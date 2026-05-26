import type { CapabilityListing, GuardrailDecision } from "../types/domain.js";

type GuardrailInput = {
  capability?: CapabilityListing;
  task: string;
  sessionPaidExecutions: number;
  amountUsd?: number;
};

const DEFAULT_SPENDING_CAP_USD = Number(process.env.DEFAULT_SPENDING_CAP_USD ?? "0.10");
const HARD_SPENDING_STOP_USD = Number(process.env.HARD_SPENDING_STOP_USD ?? "1.00");
const MAX_PAID_EXECUTIONS_PER_SESSION = Number(process.env.MAX_PAID_EXECUTIONS_PER_SESSION ?? "3");

export function evaluateGuardrails(input: GuardrailInput): GuardrailDecision {
  const reasons: string[] = [];
  const task = input.task.toLowerCase();
  const amountUsd = input.amountUsd ?? input.capability?.priceUsd ?? 0;

  if (task.includes("push") || task.includes("rewrite my repo") || input.capability?.permissions.includes("write_files")) {
    reasons.push("Requires code modification");
    reasons.push("Requires external write access");
    reasons.push("Could affect a production repository");
    return {
      allowed: false,
      status: "approval_required",
      approvalCode: "APPROVE_WRITE",
      reasons
    };
  }

  if (
    task.includes("mainnet") ||
    task.includes("erc-8004") ||
    task.includes("erc8004") ||
    task.includes("register on") ||
    task.includes("wallet") ||
    task.includes("transfer") ||
    task.includes("private key")
  ) {
    return {
      allowed: false,
      status: "approval_required",
      approvalCode: "APPROVE_ONCHAIN",
      reasons: ["Mainnet or wallet action requires explicit approval"]
    };
  }

  if (amountUsd > HARD_SPENDING_STOP_USD) {
    return {
      allowed: false,
      status: "blocked",
      reasons: [`Amount ${amountUsd.toFixed(2)} exceeds hard stop ${HARD_SPENDING_STOP_USD.toFixed(2)}`]
    };
  }

  if (input.sessionPaidExecutions >= MAX_PAID_EXECUTIONS_PER_SESSION) {
    return {
      allowed: false,
      status: "approval_required",
      approvalCode: "APPROVE",
      reasons: ["Max paid executions per session reached"]
    };
  }

  if (amountUsd > 0 || amountUsd > DEFAULT_SPENDING_CAP_USD) {
    return {
      allowed: false,
      status: "approval_required",
      approvalCode: "APPROVE",
      reasons: [`Paid capability costs ${amountUsd.toFixed(2)} USDC`]
    };
  }

  return {
    allowed: true,
    status: "allowed",
    reasons: ["Low-risk free action"]
  };
}

export function getSecurityPolicy() {
  return {
    autonomousSpendingCapUsd: DEFAULT_SPENDING_CAP_USD,
    hardSpendingStopUsd: HARD_SPENDING_STOP_USD,
    maxPaidExecutionsPerSession: MAX_PAID_EXECUTIONS_PER_SESSION,
    writeActions: "approval required",
    walletActions: "approval required",
    externalMessages: "approval required",
    unverifiedTools: "approval required",
    secretHandling: "automatic redaction",
    paymentRule: "no verified x402 payment, no paid execution",
    abortRoute: "/cancel [transaction_id]"
  };
}
