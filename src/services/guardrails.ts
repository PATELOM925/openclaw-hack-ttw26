import type { CapabilityListing } from "../types/capability.js";

export type SecurityPolicy = {
  autonomousSpendCapUsd: number;
  hardSpendStopUsd: number;
  maxPaidExecutionsPerSession: number;
  writeActionsRequireApproval: boolean;
  walletActionsRequireApproval: boolean;
  externalMessagesRequireApproval: boolean;
  unverifiedToolsRequireApproval: boolean;
  paymentRequiredBeforePaidExecution: boolean;
};

export type GuardrailDecision = {
  allowed: boolean;
  approvalRequired: boolean;
  reasons: string[];
};

export function getSecurityPolicy(): SecurityPolicy {
  return {
    autonomousSpendCapUsd: 0.1,
    hardSpendStopUsd: 1,
    maxPaidExecutionsPerSession: 3,
    writeActionsRequireApproval: true,
    walletActionsRequireApproval: true,
    externalMessagesRequireApproval: true,
    unverifiedToolsRequireApproval: true,
    paymentRequiredBeforePaidExecution: true
  };
}

export function getSecurityText(policy: SecurityPolicy = getSecurityPolicy()): string {
  return `ClawCompass Guardrails

Autonomous spending cap: ${policy.autonomousSpendCapUsd.toFixed(2)} USDC
Hard spending stop: ${policy.hardSpendStopUsd.toFixed(2)} USDC
Max paid executions per session: ${policy.maxPaidExecutionsPerSession}
Write actions: approval required
Wallet actions: approval required
External messages: approval required
Unverified tools: approval required
Secret handling: automatic redaction
Payment rule: no verified x402 payment, no paid execution
Abort route: /cancel [transaction_id]`;
}

export function evaluateGuardrails(input: {
  capability: CapabilityListing;
  policy: SecurityPolicy;
  requestedAmountUsd: number;
}): GuardrailDecision {
  const reasons = collectReasons(input.capability, input.policy, input.requestedAmountUsd);
  return { allowed: reasons.length === 0, approvalRequired: reasons.length > 0, reasons };
}

function collectReasons(
  capability: CapabilityListing,
  policy: SecurityPolicy,
  amount: number
): string[] {
  const reasons: string[] = [];
  if (capability.priceUsd > 0) reasons.push("paid_capability");
  if (amount > policy.hardSpendStopUsd) reasons.push("hard_spend_stop");
  if (capability.riskLevel === "high") reasons.push("high_risk");
  if (!capability.verified && policy.unverifiedToolsRequireApproval) reasons.push("unverified_provider");
  if (capability.permissions.some((permission) => permission.includes("write"))) reasons.push("write_action");
  if (capability.permissions.some((permission) => permission.includes("wallet"))) reasons.push("wallet_action");
  if (capability.permissions.some((permission) => permission.includes("external"))) reasons.push("external_action");
  return reasons;
}
