import type { ClawCompassStore, ReputationEvent } from "../types/domain.js";

type ReputationInput = {
  store: ClawCompassStore;
  capabilityId: string;
  transactionId: string;
  requesterAgentId?: string;
  outcome: ReputationEvent["outcome"];
  contextSafetyPassed: boolean;
  paymentVerified: boolean;
  executionVerified: boolean;
};

export function logReputationEvent(input: ReputationInput): ReputationEvent {
  const event: ReputationEvent = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    capabilityId: input.capabilityId,
    brokerAgentId: process.env.CLAWUP_AGENT_ID ?? "clawcompass-local",
    requesterAgentId: input.requesterAgentId,
    transactionId: input.transactionId,
    outcome: input.outcome,
    qualityScore: input.outcome === "success" ? 0.92 : undefined,
    contextSafetyPassed: input.contextSafetyPassed,
    paymentVerified: input.paymentVerified,
    executionVerified: input.executionVerified,
    timestamp: new Date().toISOString()
  };

  input.store.reputationEvents.push(event);
  updateCapabilityStats(input.store, input.capabilityId, input.outcome);
  return event;
}

function updateCapabilityStats(
  store: ClawCompassStore,
  capabilityId: string,
  outcome: ReputationEvent["outcome"]
): void {
  const capabilityIndex = store.capabilities.findIndex((item) => item.id === capabilityId);
  if (capabilityIndex === -1) return;
  const capability = store.capabilities[capabilityIndex];

  if (outcome === "success") {
    store.capabilities[capabilityIndex] = {
      ...capability,
      usageCount: capability.usageCount + 1,
      trustScore: Math.min(100, capability.trustScore + 1),
      successRate: Math.min(0.99, Number((capability.successRate + 0.005).toFixed(3)))
    };
  }

  if (outcome === "failed_execution") {
    store.capabilities[capabilityIndex] = {
      ...capability,
      successRate: Math.max(0, Number((capability.successRate - 0.02).toFixed(3)))
    };
  }
}
