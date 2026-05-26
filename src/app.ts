import cors from "cors";
import express, { type Request, type Response } from "express";
import { analyzeTaskWithLLM } from "./services/taskAnalyzer.js";
import { sanitizeContext } from "./services/contextSanitizer.js";
import { listCapabilities, findCapability } from "./services/marketplace.js";
import { rankCapabilities } from "./services/capabilityRanker.js";
import { buildCapabilitySequence } from "./services/capabilitySequencer.js";
import { evaluateGuardrails, getSecurityPolicy, getSecurityText } from "./services/guardrails.js";
import {
  createExecutionQuote,
  createPaymentRequiredResponse,
  markPaymentSettled,
  createTransactionStore
} from "./services/paymentGate.js";
import { createPaymentAdapter, type PaymentAdapter } from "./services/paymentAdapter.js";
import { executeCapability } from "./services/executor.js";
import { createReputationLogger } from "./services/reputationLogger.js";
import { getHelpResponse } from "./services/helpText.js";
import { createCommandHandler } from "./services/commandHandler.js";
import { getExternalProofStatus } from "./services/proofStatus.js";
import type { CapabilityTransaction } from "./types/transaction.js";

export type AppOptions = {
  enableMockX402?: boolean;
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const transactions = createTransactionStore();
  const reputation = createReputationLogger();
  const paymentAdapter = createPaymentAdapter({
    ...process.env,
    ENABLE_MOCK_X402: options.enableMockX402 ? "true" : process.env.ENABLE_MOCK_X402
  });
  const commandHandler = createCommandHandler({ transactions, paymentAdapter, reputation });

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_request, response) => response.json({ ok: true, service: "clawcompass-api" }));
  app.get("/api/help", (_request, response) => response.json(getHelpResponse()));
  app.get("/api/marketplace", (_request, response) => response.json({ capabilities: listCapabilities() }));
  app.get("/api/tool/:id", (request, response) => sendCapability(request, response));
  app.post("/api/ask", async (request, response) => sendRecommendations(request, response));
  app.post("/api/use/:id", (request, response) => createUseQuote(request, response, transactions, paymentAdapter));
  app.post("/api/approve/:transactionId", (request, response) => {
    approvePayment(request, response, transactions, paymentAdapter);
  });
  app.post("/api/command", async (request, response) => {
    response.json(await commandHandler.handle(request.body));
  });
  app.post("/api/demo-settle/:transactionId", (request, response) => {
    settleDemoPayment(request, response, transactions, paymentAdapter);
  });
  app.get("/api/payment/:transactionId/status", (request, response) => {
    getPaymentStatus(request, response, transactions, paymentAdapter);
  });
  app.post("/api/execute/:id", async (request, response) => {
    executePaidCapability(request, response, transactions, reputation, paymentAdapter);
  });
  app.post("/api/cancel/:transactionId", (request, response) => {
    updateTransactionStatus(request, response, transactions, "cancelled");
  });
  app.post("/api/retry/:transactionId", (request, response) => {
    updateTransactionStatus(request, response, transactions, "awaiting_approval");
  });
  app.get("/api/security", (_request, response) => {
    const policy = getSecurityPolicy();
    response.json({ policy, text: getSecurityText(policy) });
  });
  app.get("/api/transactions", (_request, response) => {
    response.json({ transactions: transactions.list() });
  });
  app.get("/api/reputation/:id", (request, response) => {
    response.json({ profile: reputation.getProfile(request.params.id.toLowerCase()) });
  });
  app.post("/api/reputation/:id/write-onchain", (request, response) => {
    response.status(202).json(reputation.prepareOnChainWrite(request.params.id.toLowerCase()));
  });
  app.get("/api/proof", (_request, response) => {
    response.json(getExternalProofStatus());
  });
  app.post("/api/register-tool", (request, response) => {
    response.status(202).json({ status: "pending_review", submission: request.body });
  });

  return app;
}
function sendCapability(request: Request, response: Response) {
  const capability = findCapability(request.params.id);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });
  return response.json({ capability });
}
async function sendRecommendations(request: Request, response: Response) {
  const analysis = await analyzeTaskWithLLM(request.body);
  const secureContext = sanitizeContext(analysis.originalTask, request.body.context ?? "");
  const capabilities = listCapabilities();
  response.json({
    analysis: { ...analysis, sensitivity: secureContext.sensitivity, detectedSecrets: secureContext.detectedSecrets },
    secureContext,
    recommendations: rankCapabilities(analysis, secureContext, capabilities).slice(0, 3),
    sequence: buildCapabilitySequence(analysis, capabilities)
  });
}
function createUseQuote(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  paymentAdapter: PaymentAdapter
) {
  const capability = findCapability(request.params.id);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });

  const secureContext = sanitizeContext(request.body.task ?? "", request.body.context ?? "");
  const guardrail = evaluateGuardrails({
    capability,
    policy: getSecurityPolicy(),
    requestedAmountUsd: capability.priceUsd,
    secureContext
  });
  const transaction = transactions.save(
    createExecutionQuote({ capability, ...request.body, approvalRequired: guardrail.approvalRequired })
  );
  if (capability.priceUsd > 0 && !guardrail.approvalRequired) {
    return paymentAdapter
      .createPaymentRequirement(transaction, capability)
      .then((requirement) => {
        response.status(202).json({
          ...requirement,
          transaction: transactions.save(requirement.transaction),
          guardrail,
          secureContext
        });
      })
      .catch(() => response.status(502).json({ error: "x402_payment_requirement_failed" }));
  }
  return response.status(202).json({ transaction, guardrail, secureContext });
}
function settleDemoPayment(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  paymentAdapter: PaymentAdapter
) {
  const transaction = transactions.get(request.params.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });

  paymentAdapter
    .settleMockPayment(transaction, request.body)
    .then((settled) => {
      response.json({
        transaction: transactions.save(settled),
        note: "Local mock settlement only. Real x402 proof is external."
      });
    })
    .catch(() => response.status(403).json({ error: "mock_x402_disabled" }));
}
function approvePayment(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  paymentAdapter: PaymentAdapter
) {
  const transaction = transactions.get(request.params.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });
  if (transaction.status === "payment_required") {
    return response.json({
      transaction,
      paymentRequiredHeader: transaction.paymentRequiredHeader,
      message: "Payment already required. Complete settlement before execution."
    });
  }
  const capability = findCapability(transaction.capabilityId);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });

  paymentAdapter
    .createPaymentRequirement(transaction, capability)
    .then((requirement) => {
      response.json({
        ...requirement,
        transaction: transactions.save(requirement.transaction)
      });
    })
    .catch(() => response.status(502).json({ error: "x402_payment_requirement_failed" }));
}
function executePaidCapability(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  reputation: ReturnType<typeof createReputationLogger>,
  paymentAdapter: PaymentAdapter
) {
  const capability = findCapability(request.params.id);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });

  let transaction = transactions.get(request.body.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });
  if (capability.priceUsd > 0 && transaction.status !== "payment_settled") {
    return paymentAdapter
      .getPaymentStatus(transaction)
      .then((verification) => {
        if (!verification.canExecute) {
          return response.status(402).json({
            ...createPaymentRequiredResponse(transaction!, capability),
            verification
          });
        }
        transaction = transactions.save(
          markPaymentSettled(transaction!, {
            paymentId: transaction!.x402PaymentId ?? transaction!.id,
            txHash: verification.txHash ?? transaction!.txHash ?? ""
          })
        );
        return finishExecution(capability, request, response, transactions, reputation, transaction);
      })
      .catch((error) => response.status(409).json({ error: "payment_verification_failed", message: (error as Error).message }));
  }

  return finishExecution(capability, request, response, transactions, reputation, transaction);
}

function finishExecution(
  capability: NonNullable<ReturnType<typeof findCapability>>,
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  reputation: ReturnType<typeof createReputationLogger>,
  transaction: CapabilityTransaction
) {
  const executing = transactions.save({ ...transaction, status: "executing" });
  const result = tryExecuteCapability(capability, request, response, transactions, reputation, executing);
  if (!result) return;
  const delivered = transactions.save({ ...executing, status: "delivered", deliveredAt: new Date().toISOString() });
  reputation.record({
    capabilityId: capability.id,
    brokerAgentId: "clawcompass",
    requesterAgentId: delivered.requesterAgentId,
    transactionId: delivered.id,
    outcome: "success",
    contextSafetyPassed: true,
    paymentVerified: capability.priceUsd === 0 || Boolean(delivered.x402PaymentId),
    executionVerified: true
  });
  return response.json({ result, transaction: delivered });
}

function getPaymentStatus(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  paymentAdapter: PaymentAdapter
) {
  const transaction = transactions.get(request.params.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });
  paymentAdapter
    .getPaymentStatus(transaction)
    .then((verification) => {
      const refreshed =
        verification.canExecute && transaction.status !== "payment_settled" && transaction.token !== "FREE"
          ? transactions.save(
              markPaymentSettled(transaction, {
                paymentId: transaction.x402PaymentId ?? transaction.id,
                txHash: verification.txHash ?? transaction.txHash ?? ""
              })
            )
          : transaction;
      response.json({ transaction: refreshed, verification });
    })
    .catch((error) => response.status(409).json({ error: "payment_verification_failed", message: (error as Error).message }));
}

function tryExecuteCapability(
  capability: NonNullable<ReturnType<typeof findCapability>>,
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  reputation: ReturnType<typeof createReputationLogger>,
  executing: CapabilityTransaction
) {
  try {
    return executeCapability(capability, request.body);
  } catch (error) {
    const failed = transactions.save({ ...executing, status: "failed", error: (error as Error).message });
    reputation.record({
      capabilityId: capability.id,
      brokerAgentId: "clawcompass",
      requesterAgentId: failed.requesterAgentId,
      transactionId: failed.id,
      outcome: "failed_execution",
      contextSafetyPassed: true,
      paymentVerified: Boolean(failed.x402PaymentId),
      executionVerified: false
    });
    response.status(422).json({ error: "capability_not_executable", transaction: failed });
    return undefined;
  }
}

function updateTransactionStatus(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  status: CapabilityTransaction["status"]
) {
  const transaction = transactions.get(request.params.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });
  return response.json({ transaction: transactions.save({ ...transaction, status }) });
}
