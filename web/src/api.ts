const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export type Capability = {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  priceToken: string;
  riskLevel: string;
  trustScore: number;
  verified: boolean;
  permissions: string[];
  outputFormat: string;
};

export type Transaction = {
  id: string;
  capabilityId: string;
  amount: string;
  token: string;
  status: string;
  paymentRequiredHeader?: string;
  txHash?: string;
};

export type BuyerIntent = {
  role: "buyer";
  buyer: {
    requesterAgentId?: string;
    requesterWallet?: string;
    budgetUsd: number;
    maxRisk: string;
  };
  analysis: AskResponse["analysis"];
  secureContext: AskResponse["secureContext"];
  recommendations: AskResponse["recommendations"];
  sequence: AskResponse["sequence"];
  selectedCapability: Capability;
  transaction: Transaction;
  guardrail: { approvalRequired: boolean; reasons: string[] };
  paymentRequiredHeader?: string;
  purchaseInstructions: { nextStep: string; message: string };
};

export type AskResponse = {
  analysis: {
    taskType: string;
    analysisSource: string;
    model: string;
    confidence: number;
    recommendedSequence: string[];
    fallbackReason?: string;
  };
  secureContext: {
    allowedContext: string;
    blockedContext: string[];
    sensitivity: string;
  };
  recommendations: Array<{ capability: Capability; score: number; reasons: string[] }>;
  sequence: Array<{ step: number; capabilityId: string; name: string; purpose: string }>;
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  return readJson<T>(response);
}

export async function apiPost<T>(path: string, body: unknown = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return readJson<T>(response);
}

export const routes = {
  ask: (body: unknown) => apiPost<AskResponse>("/api/ask", body),
  buy: (body: unknown) => apiPost<BuyerIntent>("/api/buy", body),
  marketplace: () => apiGet<{ capabilities: Capability[] }>("/api/marketplace"),
  tool: (id: string) => apiGet<{ capability: Capability }>(`/api/tool/${id}`),
  use: (id: string, body: unknown) => apiPost<{ transaction: Transaction; guardrail: { approvalRequired: boolean; reasons: string[] }; paymentRequiredHeader?: string }>(`/api/use/${id}`, body),
  payment: (id: string) => apiGet<{ transaction: Transaction; verification: { status: string; canExecute: boolean; reason: string; txHash?: string } }>(`/api/payment/${id}/status`),
  settle: (id: string, body: unknown) => apiPost<{ transaction: Transaction; note: string }>(`/api/demo-settle/${id}`, body),
  execute: (id: string, body: unknown) => apiPost<{ result: Record<string, unknown>; transaction: Transaction }>(`/api/execute/${id}`, body),
  cancel: (id: string) => apiPost<{ transaction: Transaction }>(`/api/cancel/${id}`),
  retry: (id: string) => apiPost<{ transaction: Transaction }>(`/api/retry/${id}`),
  transactions: () => apiGet<{ transactions: Transaction[] }>("/api/transactions"),
  reputation: (id: string) => apiGet<{ profile: { capabilityId: string; successfulExecutions: number; failedExecutions: number; blockedRiskEvents: number; trustDelta: number; events: unknown[] } }>(`/api/reputation/${id}`),
  writeReputation: (id: string) => apiPost<{ onChainWritten: boolean; writeStatus: string; agentId?: string }>(`/api/reputation/${id}/write-onchain`),
  security: () => apiGet<{ policy: Record<string, unknown>; text: string }>("/api/security"),
  command: (text: string) => apiPost<{ text: string; data?: unknown }>("/api/command", { text, sessionId: "web-demo" }),
  proof: () =>
    apiGet<{
      status: string;
      requiredProof: Record<
        string,
        { status: string; blocker?: string; missing?: string[]; [key: string]: unknown }
      >;
      summary?: { ready: number; partial: number; blocked: number };
    }>("/api/proof"),
  registerTool: (body: unknown) => apiPost<{ status: string; submission: unknown }>("/api/register-tool", body)
};

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Request failed: ${response.status}`);
  return data as T;
}
