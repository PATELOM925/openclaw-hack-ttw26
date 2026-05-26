import cors from "cors";
import express, { type Request, type Response } from "express";
import { analyzeTask } from "./services/taskAnalyzer.js";
import { sanitizeContext } from "./services/contextSanitizer.js";
import { rankCapabilities } from "./services/capabilityRanker.js";
import { sequenceCapabilities } from "./services/capabilitySequencer.js";
import { evaluateGuardrails, getSecurityPolicy } from "./services/guardrails.js";
import { executePitchHawk, executeSetupPilot } from "./services/executor.js";
import { logReputationEvent } from "./services/reputationLogger.js";
import { createInitialStore, findCapability, saveStore } from "./services/store.js";
import {
  createTransaction,
  getTransaction,
  isMockX402Enabled,
  markPaymentSettled,
  markTransactionFailed
} from "./services/x402PaymentGate.js";
import type {
  CapabilityRequest,
  ClawCompassStore,
  PitchHawkInput,
  SetupPilotInput
} from "./types/domain.js";
import { helpResponse, securityResponse } from "./routes/commandResponses.js";

type AppOptions = {
  store?: ClawCompassStore;
  storePath?: string;
};

export function createApp(options: AppOptions = {}) {
  const app = express();
  const store = options.store ?? createInitialStore();

  app.use(cors());
  app.use(express.json({ limit: "128kb" }));

  const persist = () => saveStore(store, options.storePath);

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "clawcompass-api" });
  });

  app.get("/api/help", (_request, response) => {
    response.json({ message: helpResponse() });
  });

  app.get("/api/marketplace", (_request, response) => {
    response.json({ capabilities: store.capabilities });
  });

  app.get("/api/tool/:id", (request, response) => {
    const capability = findCapability(store, request.params.id);
    if (!capability) {
      response.status(404).json({ error: "Capability not found" });
      return;
    }

    response.json({
      capability,
      trustSummary: {
        trustScore: capability.trustScore,
        successRate: capability.successRate,
        riskLevel: capability.riskLevel,
        verified: capability.verified
      }
    });
  });

  app.post("/api/ask", (request: Request<unknown, unknown, CapabilityRequest>, response) => {
    if (!request.body?.task) {
      response.status(400).json({ error: "task is required" });
      return;
    }

    const analysis = analyzeTask(request.body);
    const secureContext = sanitizeContext(request.body);
    const recommendations = rankCapabilities(store.capabilities, analysis, analysis.budgetUsd);
    const sequence = sequenceCapabilities(recommendations);
    const first = recommendations[0]?.capability;
    const guardrail = first
      ? evaluateGuardrails({
          capability: first,
          task: request.body.task,
          amountUsd: first.priceUsd,
          sessionPaidExecutions: countDeliveredPaidExecutions(store, request.body.requesterAgentId)
        })
      : { allowed: false, status: "blocked", reasons: ["No matching capability found"] };

    response.json({
      analysis,
      secureContext,
      recommendations,
      sequence,
      guardrail
    });
  });

  app.get("/api/security", (_request, response) => {
    response.json({
      policy: getSecurityPolicy(),
      message: securityResponse()
    });
  });

  app.post("/api/use/:id", (request, response) => {
    const capability = findCapability(store, request.params.id);
    if (!capability) {
      response.status(404).json({ error: "Capability not found" });
      return;
    }

    const guardrail = evaluateGuardrails({
      capability,
      task: String(request.body?.task ?? capability.description),
      amountUsd: capability.priceUsd,
      sessionPaidExecutions: countDeliveredPaidExecutions(store, request.body?.requesterAgentId)
    });
    const transaction = createTransaction({
      store,
      capabilityId: capability.id,
      requesterAgentId: request.body?.requesterAgentId,
      requesterWallet: request.body?.requesterWallet
    });
    persist();

    response.status(capability.priceUsd > 0 ? 202 : 200).json({
      capability,
      transaction,
      guardrail,
      message:
        capability.priceUsd > 0
          ? `${capability.name} costs ${capability.priceUsd.toFixed(2)} ${capability.priceToken}. Proceed with x402 payment by replying APPROVE or CANCEL.`
          : `${capability.name} is free to execute.`
    });
  });

  app.post("/api/execute/:id", (request, response) => {
    const capability = findCapability(store, request.params.id);
    if (!capability) {
      response.status(404).json({ error: "Capability not found" });
      return;
    }

    const transactionId = String(request.body?.transactionId ?? "");
    if (!transactionId) {
      response.status(400).json({ error: "transactionId is required" });
      return;
    }

    const transaction = getTransaction(store, transactionId);
    if (transaction.capabilityId !== capability.id) {
      response.status(409).json({ error: "Transaction does not match capability" });
      return;
    }

    if (
      capability.priceUsd > 0 &&
      transaction.status !== "payment_settled" &&
      request.header("x-clawcompass-mock-payment") === "settled" &&
      isMockX402Enabled()
    ) {
      markPaymentSettled({
        store,
        transactionId,
        paymentId: "mock-x402-payment",
        txHash: "mock-x402-transaction"
      });
    }

    if (capability.priceUsd > 0 && transaction.status !== "payment_settled") {
      response.status(402).json({
        error: "Payment required",
        message: "No verified x402 payment, no paid execution.",
        transaction
      });
      return;
    }

    try {
      if (!["pitchhawk", "setuppilot"].includes(capability.id)) {
        response.status(501).json({ error: "Only SetupPilot and PitchHawk execution are implemented in the MVP" });
        return;
      }

      const result =
        capability.id === "setuppilot"
          ? executeSetupPilot({
              store,
              transactionId,
              input: request.body?.input as SetupPilotInput | undefined
            })
          : executePitchHawk({
              store,
              transactionId,
              input: request.body?.input as PitchHawkInput | undefined
            });
      const delivered = getTransaction(store, transactionId);
      const reputation = logReputationEvent({
        store,
        capabilityId: capability.id,
        transactionId,
        requesterAgentId: delivered.requesterAgentId,
        outcome: "success",
        contextSafetyPassed: true,
        paymentVerified: true,
        executionVerified: true
      });
      persist();

      response.json({ result, transaction: delivered, reputation });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution failed";
      markTransactionFailed(store, transactionId, message);
      persist();
      response.status(message.includes("No verified x402 payment") ? 402 : 500).json({
        error: message,
        message:
          message.includes("No verified x402 payment")
            ? "No capability was executed. No reputation update was recorded."
            : "Capability execution failed after payment."
      });
    }
  });

  app.get("/api/transactions", (_request, response) => {
    response.json({ transactions: store.transactions });
  });

  app.get("/api/reputation/:id", (request, response) => {
    const capability = findCapability(store, request.params.id);
    if (!capability) {
      response.status(404).json({ error: "Capability not found" });
      return;
    }

    response.json({
      capability,
      events: store.reputationEvents.filter((event) => event.capabilityId === capability.id)
    });
  });

  app.post("/api/register-tool", (_request, response) => {
    response.status(501).json({
      error: "Tool registration is parked for P1",
      message: "The MVP uses seeded verified capabilities only."
    });
  });

  return app;
}

function countDeliveredPaidExecutions(store: ClawCompassStore, requesterAgentId?: string): number {
  return store.transactions.filter(
    (transaction) =>
      transaction.status === "delivered" &&
      transaction.amount !== "0.00" &&
      (!requesterAgentId || transaction.requesterAgentId === requesterAgentId)
  ).length;
}
