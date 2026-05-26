import type { CapabilityTransaction } from "../types/transaction.js";
import { analyzeTask, analyzeTaskWithLLM } from "./taskAnalyzer.js";
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

type ApprovalKind = "approve" | "write" | "wallet" | "onchain" | "external";

export type CommandSession = {
  transactionId?: string;
  capabilityId?: string;
  task?: string;
  context?: string;
  approvalKinds?: ApprovalKind[];
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
      if (text === "APPROVE") return approve(session, input.transactions, input.paymentAdapter, "approve");
      if (text === "APPROVE_WRITE") return approve(session, input.transactions, input.paymentAdapter, "write");
      if (text === "APPROVE_WALLET") return approve(session, input.transactions, input.paymentAdapter, "wallet");
      if (text === "APPROVE_ONCHAIN") return approve(session, input.transactions, input.paymentAdapter, "onchain");
      if (text === "APPROVE_EXTERNAL") return approve(session, input.transactions, input.paymentAdapter, "external");
      if (text === "CANCEL") return cancel(session, input.transactions);
      if (text.startsWith("/ask")) return ask(text, commandInput, session, input.reputation);
      if (text.startsWith("/use")) return useCapability(text, commandInput, session, input.transactions, input.paymentAdapter);
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

async function ask(
  rawText: string,
  input: { context?: string },
  session: CommandSession,
  reputation: ReputationLogger
): Promise<{ text: string; data: unknown }> {
  const task = rawText.replace(/^\/ask\s*/i, "").trim();
  const analysis = await analyzeTaskWithLLM({ task });
  const secureContext = sanitizeContext(task, input.context ?? "");
  const ranked = rankCapabilities(analysis, secureContext, listCapabilities()).slice(0, 3);
  const taskLower = task.toLowerCase();

  session.task = task;
  session.context = input.context ?? "";
  session.approvalKinds = extractApprovalKindsFromAnalysis(analysis, ranked, taskLower);

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
    return {
      text: highRiskActionText(task, ["write"], analysis.taskType),
      data: { analysis, secureContext, recommendations: ranked }
    };
  }

  const primary = ranked[0];
  if (primary) {
    const primaryGuardrail = evaluateGuardrails({
      capability: primary.capability,
      policy: getSecurityPolicy(),
      requestedAmountUsd: primary.capability.priceUsd,
      secureContext
    });
    if (primaryGuardrail.approvalRequired) {
      const approvalKinds = extractApprovalKindsFromGuardrails(primaryGuardrail.reasons, taskLower);
      if (approvalKinds.length > 0) {
        return {
          text: highRiskActionText(task, approvalKinds, analysis.taskType),
          data: { analysis, secureContext, recommendations: ranked }
        };
      }
    }
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
  transactions: TransactionStore,
  paymentAdapter: PaymentAdapter
): Promise<{ text: string; data?: unknown }> {
  const name = rawText.replace(/^\/use\s*/i, "").trim();
  const capability = findCapability(name);
  if (!capability) return Promise.resolve({ text: `Capability not found: ${name}` });

  const taskContext = session.task ?? "";
  const secureContext = sanitizeContext(taskContext, input.context ?? session.context ?? "");
  const guardrail = evaluateGuardrails({
    capability,
    policy: getSecurityPolicy(),
    requestedAmountUsd: capability.priceUsd,
    secureContext
  });
  const approvalKinds = extractApprovalKindsFromGuardrails(guardrail.reasons, taskContext);

  const transaction = transactions.save(
    createExecutionQuote({
      capability,
      requesterAgentId: input.requesterAgentId,
      requesterWallet: input.requesterWallet,
      approvalRequired: guardrail.approvalRequired
    })
  );
  session.transactionId = transaction.id;
  session.capabilityId = capability.id;
  session.approvalKinds = approvalKinds;

  if (capability.priceUsd > 0 && !guardrail.approvalRequired) {
    return paymentAdapter.createPaymentRequirement(transaction, capability).then((requirement) => {
      transactions.save(requirement.transaction);
      return {
        text: formatPaymentRequired(capability.name, requirement.transaction),
        data: { ...requirement, guardrail, secureContext }
      };
    });
  }

  return Promise.resolve({
    text: formatUseQuote(capability.name, transaction, secureContext.blockedContext, approvalKinds),
    data: { transaction, guardrail, secureContext }
  });
}

async function approve(
  session: CommandSession,
  transactions: TransactionStore,
  paymentAdapter: PaymentAdapter,
  requestedKind: ApprovalKind
): Promise<{ text: string; data?: unknown }> {
  if (!session.transactionId || !session.capabilityId) return { text: "No pending paid capability to approve." };
  const transaction = transactions.get(session.transactionId);
  const capability = findCapability(session.capabilityId);
  if (!transaction || !capability) return { text: "Pending transaction was not found." };
  if (transaction.status === "payment_required") return { text: "No pending approval-gated capability. Payment is already required.", data: transaction };

  const requiredKinds: ApprovalKind[] =
    session.approvalKinds && session.approvalKinds.length > 0 ? session.approvalKinds : ["approve"];
  const explicitKinds = requiredKinds.filter((kind) => kind !== "approve");

  if (requestedKind !== "approve") {
    if (explicitKinds.length === 0) {
      return {
        text: "This workflow accepts APPROVE only.",
        data: transaction
      };
    }
    if (!explicitKinds.includes(requestedKind)) {
      return {
        text: `This workflow requires ${explicitKinds.map(formatApprovalTokenDisplay).join(", ")} approval.`,
        data: transaction
      };
    }
  }

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

function formatPaymentRequired(name: string, transaction: CapabilityTransaction): string {
  return [
    `${name} costs ${transaction.amount} ${transaction.token} for one execution.`,
    "",
    "Payment required.",
    `Capability: ${name}`,
    `Amount: ${transaction.amount} ${transaction.token}`,
    "Rail: x402",
    "Merchant: ClawCompass",
    "Status: awaiting verified settlement"
  ].join("\n");
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
  return {
    text: `Retry ready for ${id}. Reply APPROVE to request payment again.`,
    data: transactions.save({ ...transaction, status: "awaiting_approval" })
  };
}

function cancelByCommand(rawText: string, transactions: TransactionStore): { text: string; data?: unknown } {
  const id = rawText.replace(/^\/cancel\s*/i, "").trim();
  const transaction = transactions.get(id);
  if (!transaction) return { text: `Transaction not found: ${id}` };
  return { text: `Cancelled ${id}.`, data: transactions.save({ ...transaction, status: "cancelled" }) };
}

function formatUseQuote(
  name: string,
  transaction: CapabilityTransaction,
  blockedContext: string[],
  approvalKinds: ApprovalKind[] = ["approve"]
): string {
  return formatUseQuoteWithApprovals(name, transaction, blockedContext, approvalKinds);
}

function formatUseQuoteWithApprovals(
  name: string,
  transaction: CapabilityTransaction,
  blockedContext: string[],
  approvalKinds: ApprovalKind[]
): string {
  const requestedApprovals = approvalKinds.length ? approvalKinds : (["approve"] as ApprovalKind[]);
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
    `Requires approval: ${requestedApprovals.map(formatApprovalTokenDisplay).join(", ")}`,
    "Reply with one approval token or CANCEL."
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

function formatApprovalToken(kind: ApprovalKind): string {
  if (kind === "write") return "APPROVE_WRITE";
  if (kind === "wallet") return "APPROVE_WALLET";
  if (kind === "onchain") return "APPROVE_ONCHAIN";
  if (kind === "external") return "APPROVE_EXTERNAL";
  return "APPROVE";
}

function formatApprovalTokenDisplay(kind: ApprovalKind): string {
  return formatApprovalToken(kind);
}

function highRiskActionText(task: string, approvalKinds: ApprovalKind[], taskType: string): string {
  return [
    "High-risk action detected.",
    "",
    `Task context: ${taskType}`,
    `Reason: ${task.includes("private key") || task.toLowerCase().includes("mainnet") ? "sensitive credentials or onchain action" : "requires privileged action"}`,
    `Requested capabilities include risk: ${approvalKinds.map(formatApprovalTokenDisplay).join(", ")}`,
    "",
    `Reply with ${approvalKinds.map(formatApprovalTokenDisplay).join(" or ")} or CANCEL.`
  ].join("\n");
}

function extractApprovalKindsFromAnalysis(
  analysis: ReturnType<typeof analyzeTask>,
  recommendations: ReturnType<typeof rankCapabilities>,
  taskHint = ""
): ApprovalKind[] {
  if (analysis.taskType === "repo_write") return ["write"];

  const highRiskHints: ApprovalKind[] = [];
  const task = taskHint.toLowerCase();
  if (task.includes("private key") || task.includes("onchain") || task.includes("mainnet")) {
    highRiskHints.push("onchain");
  }
  if (task.includes("wallet") || task.includes("deploy") || task.includes("transfer") || task.includes("stables") || task.includes("deposit")) {
    highRiskHints.push("wallet");
  }
  if (task.includes("send") && task.includes("telegram")) {
    highRiskHints.push("external");
  }
  if (highRiskHints.length > 0) return dedupeKinds(highRiskHints);

  const best = recommendations[0];
  if (!best) return [];
  const reasons = evaluateGuardrails({
    capability: best.capability,
    policy: getSecurityPolicy(),
    requestedAmountUsd: best.capability.priceUsd,
    secureContext: {
      task: analysis.originalTask,
      allowedContext: analysis.originalTask,
      blockedContext: [],
      detectedSecrets: [],
      sensitivity: "public",
      approvalRequired: false
    }
  }).reasons;

  return extractApprovalKindsFromGuardrails(reasons, task);
}

function extractApprovalKindsFromGuardrails(reasons: string[], taskHint = ""): ApprovalKind[] {
  const lowerTask = taskHint.toLowerCase();
  const kinds = new Set<ApprovalKind>();

  if (reasons.includes("write_action")) kinds.add("write");
  if (reasons.includes("wallet_action")) kinds.add("wallet");
  if (reasons.includes("external_action")) kinds.add("external");

  if (lowerTask.includes("private key") || lowerTask.includes("mainnet") || lowerTask.includes("onchain")) {
    kinds.add("onchain");
  }

  return dedupeKinds(Array.from(kinds));
}

function dedupeKinds(values: ApprovalKind[]): ApprovalKind[] {
  return Array.from(new Set(values));
}
