import type { CapabilityRequest, TaskAnalysis, TaskType } from "../types/domain.js";

const TASK_KEYWORDS: Record<TaskType, string[]> = {
  copywriting: ["homepage", "pitch", "headline", "landing", "cta", "copy", "positioning"],
  research: ["market", "competitor", "research", "validation", "tam", "gap"],
  code_review: ["code", "bug", "readme", "architecture", "error", "stack trace"],
  repo_write: ["push", "commit", "rewrite repo", "modify files", "open pr", "pull request"],
  data_extraction: ["extract", "scrape", "parse", "dataset", "csv"],
  agent_safety: ["rule", "guardrail", "policy", "hook", "approval", "spending cap"],
  onboarding: [
    "clawup",
    "openclaw",
    "telegram pairing",
    "pairing",
    "erc-8004",
    "erc8004",
    "8004scan",
    "x402",
    "botfather",
    "mainnet registration",
    "merchant portal",
    "gas tokens",
    "stables",
    "setup"
  ],
  summarization: ["summarize", "notes", "condense", "summary"],
  unknown: []
};

const SECRET_HINTS = [/sk-[A-Za-z0-9_-]{12,}/g, /gh[pousr]_[A-Za-z0-9_]{12,}/g, /PRIVATE_KEY=/gi];

export function analyzeTask(request: CapabilityRequest): TaskAnalysis {
  const haystack = `${request.task} ${request.goal ?? ""} ${request.context ?? ""}`.toLowerCase();
  const taskType = classifyTask(haystack);
  const detectedSecrets = SECRET_HINTS.some((pattern) => pattern.test(request.context ?? ""))
    ? ["secret-like context"]
    : [];

  return {
    taskType,
    requiredCapabilities: requiredCapabilitiesFor(taskType),
    sensitivity: detectedSecrets.length > 0 ? "secret" : request.context ? "internal" : "public",
    detectedSecrets,
    budgetUsd: request.budgetUsd ?? 0.1,
    riskTolerance: taskType === "repo_write" ? "high" : request.maxRisk ?? "low"
  };
}

function classifyTask(haystack: string): TaskType {
  const orderedTypes: TaskType[] = [
    "repo_write",
    "copywriting",
    "research",
    "code_review",
    "onboarding",
    "agent_safety",
    "data_extraction",
    "summarization"
  ];

  return (
    orderedTypes.find((type) =>
      TASK_KEYWORDS[type].some((keyword) => haystack.includes(keyword))
    ) ?? "unknown"
  );
}

function requiredCapabilitiesFor(taskType: TaskType): string[] {
  if (taskType === "unknown") return ["general_triage"];
  if (taskType === "repo_write") return ["repo_write", "github", "code_changes"];
  if (taskType === "onboarding") {
    return ["clawup_setup", "telegram_pairing", "erc8004", "x402"];
  }
  return [taskType];
}
