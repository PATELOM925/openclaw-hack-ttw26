export type CapabilityType =
  | "skill"
  | "mcp"
  | "plugin"
  | "hook"
  | "rule"
  | "sub_agent"
  | "github_project";

export type RiskLevel = "low" | "medium" | "high";
export type Sensitivity = "public" | "internal" | "confidential" | "secret";

export type CapabilityListing = {
  id: string;
  name: string;
  type: CapabilityType;
  description: string;
  providerName: string;
  providerWallet?: string;
  supportedTasks: string[];
  inputRequirements: string[];
  outputFormat: string;
  priceUsd: number;
  priceToken: "USDC" | "USDT" | "FREE";
  pricingModel: "free" | "per_call" | "per_bundle";
  trustScore: number;
  successRate: number;
  usageCount: number;
  riskLevel: RiskLevel;
  permissions: string[];
  verified: boolean;
  erc8004AgentId?: string;
  endpointUrl?: string;
  repoUrl?: string;
  lastCheckedAt: string;
};

export type CapabilityRequest = {
  requesterAgentId?: string;
  requesterWallet?: string;
  task: string;
  goal?: string;
  context?: string;
  budgetUsd?: number;
  maxRisk?: RiskLevel;
  allowedDataClasses?: string[];
};

export type TaskType =
  | "copywriting"
  | "research"
  | "code_review"
  | "repo_write"
  | "data_extraction"
  | "agent_safety"
  | "onboarding"
  | "summarization"
  | "unknown";

export type TaskAnalysis = {
  taskType: TaskType;
  requiredCapabilities: string[];
  sensitivity: Sensitivity;
  detectedSecrets: string[];
  budgetUsd: number;
  riskTolerance: RiskLevel;
};

export type SecureContextPackage = {
  task: string;
  allowedContext: string;
  blockedContext: string[];
  detectedSecrets: string[];
  sensitivity: Sensitivity;
  approvalRequired: boolean;
};

export type CapabilityTransactionStatus =
  | "quoted"
  | "awaiting_approval"
  | "payment_required"
  | "payment_pending"
  | "payment_settled"
  | "executing"
  | "delivered"
  | "failed"
  | "cancelled";

export type CapabilityTransaction = {
  id: string;
  requesterAgentId?: string;
  requesterWallet?: string;
  capabilityId: string;
  merchantId: string;
  amount: string;
  token: "USDC" | "USDT";
  status: CapabilityTransactionStatus;
  x402PaymentId?: string;
  txHash?: string;
  paymentRequiredHeader?: string;
  error?: string;
  createdAt: string;
  settledAt?: string;
  deliveredAt?: string;
};

export type ReputationEvent = {
  id: string;
  capabilityId: string;
  brokerAgentId: string;
  requesterAgentId?: string;
  transactionId: string;
  outcome: "success" | "failed_payment" | "failed_execution" | "blocked_risk";
  qualityScore?: number;
  contextSafetyPassed: boolean;
  paymentVerified: boolean;
  executionVerified: boolean;
  timestamp: string;
};

export type CapabilityRecommendation = {
  capability: CapabilityListing;
  score: number;
  reasons: string[];
};

export type GuardrailDecision = {
  allowed: boolean;
  status: "allowed" | "approval_required" | "blocked";
  approvalCode?: "APPROVE" | "APPROVE_WRITE" | "APPROVE_ONCHAIN";
  reasons: string[];
};

export type PitchHawkInput = {
  projectSummary?: string;
  targetUser?: string;
  currentCopy?: string;
  desiredTone?: string;
};

export type PitchHawkOutput = {
  headline: string;
  subheadline: string;
  cta: string;
  threeBullets: string[];
  confidenceScore: number;
};

export type SetupPilotInput = {
  task?: string;
  context?: string;
};

export type SetupPhase =
  | "claw_creation"
  | "telegram_pairing"
  | "skill_installation"
  | "wallet_funding"
  | "erc8004_registration"
  | "x402_setup"
  | "submission_readiness";

export type SetupPilotOutput = {
  phase: SetupPhase;
  detectedBlocker: string;
  safeNextAction: string;
  exactCommandOrPrompt: string;
  requiredHumanConfirmation: "none" | "APPROVE_WALLET" | "APPROVE_ONCHAIN" | "CONFIRM_PAYMENT";
  publicEvidenceToCapture: string[];
  stopConditions: string[];
};

export type ClawCompassStore = {
  capabilities: CapabilityListing[];
  transactions: CapabilityTransaction[];
  reputationEvents: ReputationEvent[];
};
