export type ReputationOutcome =
  | "success"
  | "failed_payment"
  | "failed_execution"
  | "blocked_risk";

export type ReputationEvent = {
  id: string;
  capabilityId: string;
  brokerAgentId: string;
  requesterAgentId?: string;
  transactionId: string;
  outcome: ReputationOutcome;
  qualityScore?: number;
  contextSafetyPassed: boolean;
  paymentVerified: boolean;
  executionVerified: boolean;
  timestamp: string;
};

export type ReputationProfile = {
  capabilityId: string;
  successfulExecutions: number;
  failedExecutions: number;
  blockedRiskEvents: number;
  trustDelta: number;
  events: ReputationEvent[];
};
