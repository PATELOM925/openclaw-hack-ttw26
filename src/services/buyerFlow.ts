import type { CapabilityRequest } from "../types/request.js";
import type { CapabilityTransaction } from "../types/transaction.js";
import type { GuardrailDecision } from "./guardrails.js";
import type { SecureContextPackage } from "../types/request.js";
import type { CapabilityListing, RankedCapability, CapabilitySequenceStep } from "../types/capability.js";
import type { RiskLevel } from "../types/capability.js";

export type BuyerIntentResponse = {
  role: "buyer";
  buyer: {
    requesterAgentId?: string;
    requesterWallet?: string;
    budgetUsd: number;
    maxRisk: RiskLevel;
  };
  analysis: unknown;
  secureContext: SecureContextPackage;
  recommendations: RankedCapability[];
  sequence: CapabilitySequenceStep[];
  selectedCapability: CapabilityListing;
  transaction: CapabilityTransaction;
  guardrail: GuardrailDecision;
  paymentRequiredHeader?: string;
  purchaseInstructions: {
    nextStep: "pay_x402_then_execute" | "approval_required" | "free_execute";
    message: string;
  };
};

const riskRank: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

export function buyerProfile(request: CapabilityRequest): BuyerIntentResponse["buyer"] {
  return {
    requesterAgentId: request.requesterAgentId,
    requesterWallet: request.requesterWallet,
    budgetUsd: request.budgetUsd ?? 0.1,
    maxRisk: normalizeRisk(request.maxRisk)
  };
}

export function selectBuyerRecommendations(
  recommendations: RankedCapability[],
  buyer: BuyerIntentResponse["buyer"]
): RankedCapability[] {
  return recommendations.filter((item) => {
    const withinBudget = item.capability.priceUsd <= buyer.budgetUsd;
    const withinRisk = riskRank[item.capability.riskLevel] <= riskRank[buyer.maxRisk];
    return withinBudget && withinRisk;
  });
}

export function purchaseInstructions(input: {
  transaction: CapabilityTransaction;
  approvalRequired: boolean;
  priceUsd: number;
}): BuyerIntentResponse["purchaseInstructions"] {
  if (input.approvalRequired) {
    return {
      nextStep: "approval_required",
      message: "Buyer must approve this risk before x402 payment is requested."
    };
  }
  if (input.priceUsd === 0) {
    return {
      nextStep: "free_execute",
      message: "Buyer can execute this free capability without x402 settlement."
    };
  }
  return {
    nextStep: "pay_x402_then_execute",
    message: `Buyer should settle x402 for transaction ${input.transaction.id}, then execute the capability.`
  };
}

function normalizeRisk(value: unknown): RiskLevel {
  return value === "medium" || value === "high" ? value : "low";
}
