import type { CapabilityRequest, TaskAnalysis, TaskType } from "../types/request.js";
import type { RiskLevel } from "../types/capability.js";

const taskRules: Array<{ type: TaskType; tokens: string[]; capabilities: string[] }> = [
  { type: "repo_write", tokens: ["rewrite", "push", "commit", "pull request"], capabilities: ["repo_write"] },
  { type: "copywriting", tokens: ["homepage", "pitch", "copy", "landing"], capabilities: ["landing_page_copy"] },
  { type: "research", tokens: ["research", "market", "competitor"], capabilities: ["market_validation"] },
  { type: "code_review", tokens: ["review code", "readme", "bug"], capabilities: ["code_review"] },
  { type: "agent_safety", tokens: ["guardrail", "safety", "approval", "rule"], capabilities: ["agent_safety"] },
  { type: "data_extraction", tokens: ["extract", "summarize", "parse"], capabilities: ["data_extraction"] }
];

export function analyzeTask(request: CapabilityRequest): TaskAnalysis {
  const task = request.task.trim();
  const match = taskRules.find((rule) => containsAny(task, rule.tokens));
  const highRisk = containsAny(task, ["push", "wallet", "transfer", "deploy", "private key"]);

  return {
    originalTask: task,
    taskType: match?.type ?? "unknown",
    requiredCapabilities: match?.capabilities ?? ["general_capability_routing"],
    sensitivity: highRisk ? "confidential" : "internal",
    detectedSecrets: [],
    budgetUsd: request.budgetUsd ?? parseBudget(task) ?? 0,
    riskTolerance: chooseRiskTolerance(request.maxRisk, highRisk)
  };
}

function containsAny(value: string, tokens: string[]): boolean {
  const lower = value.toLowerCase();
  return tokens.some((token) => lower.includes(token));
}

function parseBudget(task: string): number | undefined {
  const match = task.match(/budget\s*:?\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : undefined;
}

function chooseRiskTolerance(maxRisk: RiskLevel | undefined, highRisk: boolean): RiskLevel {
  if (maxRisk) return maxRisk;
  return highRisk ? "high" : "low";
}
