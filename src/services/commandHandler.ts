import type { CapabilityTransaction } from "../types/transaction.js";
import { analyzeTask } from "./taskAnalyzer.js";
import { sanitizeContext } from "./contextSanitizer.js";
import { listCapabilities, findCapability } from "./marketplace.js";
import { rankCapabilities } from "./capabilityRanker.js";
import { buildCapabilitySequence } from "./capabilitySequencer.js";
import { evaluateGuardrails, getSecurityPolicy, getSecurityText } from "./guardrails.js";
import { createExecutionQuote, createTransactionStore } from "./paymentGate.js";
import type { PaymentAdapter } from "./paymentAdapter.js";
import { getHelpResponse } from "./helpText.js";
import { createReputationLogger } from "./reputationLogger.js";

type TransactionStore = ReturnType<typeof createTransactionStore>;
type ReputationLogger = ReturnType<typeof createReputationLogger>;

export type CommandSession = {
  transactionId?: string;
  capabilityId?: string;
  task?: string;
  context?: string;
};

export type CommandHandler = {
  handle(input: {
    text: string;
    sessionId?: string;
    context?: string;
    requesterAgentId?: string;
    requesterWallet?: string;
  }): Promise<{ text: string; data?: unknown }>;
};

export function createCommandHandler(input: {
  transactions: TransactionStore;
  paymentAdapter: PaymentAdapter;
  reputation: ReputationLogger;
}): CommandHandler {
  const sessions = new Map<string, CommandSession>();

  return {
    async handle(commandInput) {
      const text = commandInput.text.trim();
      const session = getSession(sessions, commandInput.sessionId);
      if (text === "APPROVE") return approve(session, input.transactions, input.paymentAdapter);
      if (text === "CANCEL") return cancel(session, input.transactions);
      if (text === "APPROVE_WRITE") return { text: "Write approval noted. No write action will run in the MVP demo." };
      if (text.startsWith("/ask")) return ask(text, commandInput, session, input.reputation);
      if (text.startsWith("/use")) return useCapability(text, commandInput, session, input.transactions);
      if (text.startsWith("/tool")) return showTool(text);
      if (text.startsWith("/marketplace")) return showMarketplace();
      if (text.startsWith("/security")) return { text: getSecurityText() };
      if (text.startsWith("/transactions")) return showTransactions(input.transactions);
      if (text.startsWith("/reputation")) return showReputation(text, input.reputation);
      if (text.startsWith("/register_tool")) return { text: "Capability submission received for pending review." };
      if (text.startsWith("/retry")) return retry(text, input.transactions);
      if (text.startsWith("/cancel")) return cancelByCommand(text, input.transactions);
      return { text: getHelpResponse().text };
    }
  };
}

function getSession(sessions: Map<string, CommandSession>, sessionId = "default"): CommandSession {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created: CommandSession = {};
  sessions.set(sessionId, created);
  return created;
}

function ask(
  rawText: string,
  input: { context?: string },
  session: CommandSession,
  reputation: ReputationLogger
): { text: string; data: unknown } {
  const task = rawText.replace(/^\/ask\s*/i, "").trim();
  const analysis = analyzeTask({ task });
  const secureContext = sanitizeContext(task, input.context ?? "");
  const ranked = rankCapabilities(analysis, secureContext, listCapabilities()).slice(0, 3);
  session.task = task;
  session.context = input.context ?? "";
  if (analysis.taskType === "repo_write") {
    reputation.record({
      capabilityId: "githubhelper",
      brokerAgentId: "clawcompass",
      transactionId: `blocked_${Date.now()}`,
      outcome: "blocked_risk",
      contextSafetyPassed: true,
      paymentVerified: false,
      executionVerified: false
    });
    return { text: highRiskWriteText(), data: { analysis, secureContext, recommendations: ranked } };
  }
  return {
    text: formatRecommendations(analysis.taskType, ranked, secureContext.detectedSecrets),
    data: {
      analysis,
      secureContext,
      recommendations: ranked,
      sequence: buildCapabilitySequence(analysis, listCapabilities())
    }
  };
}

function useCapability(
  rawText: string,
  input: { context?: string; requesterAgentId?: string; requesterWallet?: string },
  session: CommandSession,
  transactions: TransactionStore
): { text: string; data?: unknown } {
  const name = rawText.replace(/^\/use\s*/i, "").trim();
  const capability = findCapability(name);
  if (!capability) return { text: `Capability not found: ${name}` };
  const transaction = transactions.save(
    createExecutionQuote({
      capability,
      requesterAgentId: input.requesterAgentId,
      requesterWallet: input.requesterWallet
    })
  );
  const secureContext = sanitizeContext(session.task ?? "", input.context ?? session.context ?? "");
  const guardrail = evaluateGuardrails({
    capability,
    policy: getSecurityPolicy(),
    requestedAmountUsd: capability.priceUsd
  });
  session.transactionId = transaction.id;
  session.capabilityId = capability.id;
  return {
    text: formatUseQuote(capability.name, transaction, secureContext.blockedContext),
    data: { transaction, guardrail, secureContext }
  };
}

async function approve(
  session: CommandSession,
  transactions: TransactionStore,
  paymentAdapter: PaymentAdapter
): Promise<{ text: string; data?: unknown }> {
  if (!session.transactionId || !session.capabilityId) return { text: "No pending paid capability to approve." };
  const transaction = transactions.get(session.transactionId);
  const capability = findCapability(session.capabilityId);
  if (!transaction || !capability) return { text: "Pending transaction was not found." };
  const requirement = await paymentAdapter.createPaymentRequirement(transaction, capability);
  transactions.save(requirement.transaction);
  return {
    text: [
      "Payment required.",
      "",
      `Capability: ${capability.name}`,
      `Amount: ${requirement.transaction.amount} ${requirement.transaction.token}`,
      "Rail: x402",
      "Merchant: ClawCompass",
      "Status: awaiting verified settlement"
    ].join("\n"),
    data: requirement
  };
}

function cancel(session: CommandSession, transactions: TransactionStore): { text: string; data?: unknown } {
  if (!session.transactionId) return { text: "Cancelled. No pending transaction was active." };
  const transaction = transactions.get(session.transactionId);
  if (!transaction) return { text: "Cancelled. Pending transaction was not found." };
  const cancelled = transactions.save({ ...transaction, status: "cancelled" });
  session.transactionId = undefined;
  session.capabilityId = undefined;
  return { text: `Cancelled ${cancelled.id}. No capability was executed.`, data: cancelled };
}

function showTool(rawText: string): { text: string; data?: unknown } {
  const name = rawText.replace(/^\/tool\s*/i, "").trim();
  const capability = findCapability(name);
  if (!capability) return { text: `Capability not found: ${name}` };
  return {
    text: `${capability.name}: ${capability.description}\nPrice: ${capability.priceUsd} ${capability.priceToken}\nRisk: ${capability.riskLevel}\nTrust: ${capability.trustScore}`,
    data: capability
  };
}

function showMarketplace(): { text: string; data: unknown } {
  const capabilities = listCapabilities();
  return {
    text: capabilities
      .map((item) => `${item.name} - ${item.priceUsd === 0 ? "free" : `${item.priceUsd.toFixed(2)} ${item.priceToken}`}`)
      .join("\n"),
    data: capabilities
  };
}

function showTransactions(transactions: TransactionStore): { text: string; data: unknown } {
  const items = transactions.list();
  return {
    text: items.length ? items.map((item) => `${item.id}: ${item.status}`).join("\n") : "No transactions yet.",
    data: items
  };
}

function showReputation(rawText: string, reputation: ReputationLogger): { text: string; data: unknown } {
  const name = rawText.replace(/^\/reputation\s*/i, "").trim();
  const capability = findCapability(name);
  if (!capability) return { text: `Capability not found: ${name}`, data: undefined };
  const profile = reputation.getProfile(capability.id);
  return {
    text: [
      `${capability.name} reputation`,
      `successful executions: ${profile.successfulExecutions}`,
      `failed executions: ${profile.failedExecutions}`,
      `blocked risk events: ${profile.blockedRiskEvents}`,
      `trust delta: ${profile.trustDelta}`
    ].join("\n"),
    data: profile
  };
}

function retry(rawText: string, transactions: TransactionStore): { text: string; data?: unknown } {
  const id = rawText.replace(/^\/retry\s*/i, "").trim();
  const transaction = transactions.get(id);
  if (!transaction) return { text: `Transaction not found: ${id}` };
  return { text: `Retry ready for ${id}. Reply APPROVE to request payment again.`, data: transactions.save({ ...transaction, status: "awaiting_approval" }) };
}

function cancelByCommand(rawText: string, transactions: TransactionStore): { text: string; data?: unknown } {
  const id = rawText.replace(/^\/cancel\s*/i, "").trim();
  const transaction = transactions.get(id);
  if (!transaction) return { text: `Transaction not found: ${id}` };
  return { text: `Cancelled ${id}.`, data: transactions.save({ ...transaction, status: "cancelled" }) };
}

function formatUseQuote(name: string, transaction: CapabilityTransaction, blockedContext: string[]): string {
  return [
    `${name} costs ${transaction.amount} ${transaction.token} for one execution.`,
    "",
    "Context to be shared:",
    "- Project summary",
    "- Target user",
    "- Desired tone",
    "- Current homepage copy",
    "",
    "Context blocked:",
    ...(blockedContext.length ? blockedContext.map((item) => `- ${item}`) : ["- none detected"]),
    "",
    "Proceed with x402 payment?",
    "Reply APPROVE or CANCEL."
  ].join("\n");
}

function formatRecommendations(taskType: string, ranked: ReturnType<typeof rankCapabilities>, secrets: string[]): string {
  const lines = [
    "I analyzed your task and context.",
    "",
    `Task type: ${taskType}`,
    secrets.length ? "Detected and blocked sensitive context:" : "Detected and blocked sensitive context: none",
    ...secrets.map((secret) => `- ${secret}`),
    "",
    "I found matching capabilities:",
    ...ranked.map((item, index) => `${index + 1}. ${item.capability.name} - ${item.capability.priceUsd === 0 ? "free" : `${item.capability.priceUsd.toFixed(2)} ${item.capability.priceToken}`} - risk ${item.capability.riskLevel}`)
  ];
  return lines.join("\n");
}

function highRiskWriteText(): string {
  return `High-risk action detected.

Reason:
- Requires code modification
- Requires external write access
- Could affect a production repository

I can recommend GitHubHelper, but I will not execute write or push actions without explicit approval.

Reply APPROVE_WRITE or CANCEL.`;
}
