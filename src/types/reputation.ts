export type ReputationOutcome =
  | "success"
  | "failed_payment"
  | "failed_execution"
  | "blocked_risk";

export type ReputationWriteStatus =
  | "not_applicable"
  | "pending_external_proof"
  | "ready_to_write"
  | "written"
  | "failed";

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
  onChainWritten: boolean;
  writeStatus: ReputationWriteStatus;
  erc8004TxHash?: string;
  agentId?: string;
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
