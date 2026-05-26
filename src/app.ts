import cors from "cors";
import express, { type Request, type Response } from "express";
import { analyzeTask } from "./services/taskAnalyzer.js";
import { sanitizeContext } from "./services/contextSanitizer.js";
import { listCapabilities, findCapability } from "./services/marketplace.js";
import { rankCapabilities } from "./services/capabilityRanker.js";
import { buildCapabilitySequence } from "./services/capabilitySequencer.js";
import { evaluateGuardrails, getSecurityPolicy } from "./services/guardrails.js";
import {
  createExecutionQuote,
  createPaymentRequiredResponse,
  createTransactionStore,
  markPaymentSettled
} from "./services/paymentGate.js";
import { executeCapability } from "./services/executor.js";
import { createReputationLogger } from "./services/reputationLogger.js";
import { getHelpResponse } from "./services/helpText.js";
import type { CapabilityTransaction } from "./types/transaction.js";

export function createApp() {
  const app = express();
  const transactions = createTransactionStore();
  const reputation = createReputationLogger();

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.get("/api/help", (_request, response) => response.json(getHelpResponse()));
  app.get("/api/marketplace", (_request, response) => response.json({ capabilities: listCapabilities() }));
  app.get("/api/tool/:id", (request, response) => sendCapability(request, response));
  app.post("/api/ask", (request, response) => sendRecommendations(request, response));
  app.post("/api/use/:id", (request, response) => createUseQuote(request, response, transactions));
  app.post("/api/demo-settle/:transactionId", (request, response) => {
    settleDemoPayment(request, response, transactions);
  });
  app.post("/api/execute/:id", (request, response) => {
    executePaidCapability(request, response, transactions, reputation);
  });
  app.post("/api/cancel/:transactionId", (request, response) => {
    updateTransactionStatus(request, response, transactions, "cancelled");
  });
  app.post("/api/retry/:transactionId", (request, response) => {
    updateTransactionStatus(request, response, transactions, "awaiting_approval");
  });
  app.get("/api/security", (_request, response) => response.json({ policy: getSecurityPolicy() }));
  app.get("/api/transactions", (_request, response) => {
    response.json({ transactions: transactions.list() });
  });
  app.get("/api/reputation/:id", (request, response) => {
    response.json({ profile: reputation.getProfile(request.params.id.toLowerCase()) });
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

function sendRecommendations(request: Request, response: Response) {
  const analysis = analyzeTask(request.body);
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
  transactions: ReturnType<typeof createTransactionStore>
) {
  const capability = findCapability(request.params.id);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });

  const guardrail = evaluateGuardrails({
    capability,
    policy: getSecurityPolicy(),
    requestedAmountUsd: capability.priceUsd
  });
  const transaction = transactions.save(createExecutionQuote({ capability, ...request.body }));
  const secureContext = sanitizeContext(request.body.task ?? "", request.body.context ?? "");
  return response.status(202).json({ transaction, guardrail, secureContext });
}

function settleDemoPayment(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>
) {
  const transaction = transactions.get(request.params.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });

  const settled = transactions.save(markPaymentSettled(transaction, request.body));
  return response.json({ transaction: settled, note: "Demo settlement only. Real x402 proof is external." });
}

function executePaidCapability(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  reputation: ReturnType<typeof createReputationLogger>
) {
  const capability = findCapability(request.params.id);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });

  const transaction = transactions.get(request.body.transactionId);
  if (!transaction) return response.status(404).json({ error: "transaction_not_found" });
  if (capability.priceUsd > 0 && transaction.status !== "payment_settled") {
    return response.status(402).json(createPaymentRequiredResponse(transaction, capability));
  }

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
