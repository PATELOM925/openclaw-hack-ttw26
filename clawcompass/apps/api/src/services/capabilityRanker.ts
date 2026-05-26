import type {
  CapabilityListing,
  CapabilityRecommendation,
  TaskAnalysis
} from "../types/domain.js";

export function rankCapabilities(
  capabilities: CapabilityListing[],
  analysis: TaskAnalysis,
  budgetUsd = analysis.budgetUsd
): CapabilityRecommendation[] {
  return capabilities
    .map((capability) => scoreCapability(capability, analysis, budgetUsd))
    .filter((recommendation) => recommendation.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

function scoreCapability(
  capability: CapabilityListing,
  analysis: TaskAnalysis,
  budgetUsd: number
): CapabilityRecommendation {
  const taskFit = getTaskFit(capability, analysis);
  const trust = capability.trustScore / 100;
  const success = capability.successRate;
  const contextSafety = capability.permissions.includes("write_files") ? 0.35 : 0.95;
  const priceEfficiency = capability.priceUsd === 0 ? 1 : capability.priceUsd <= budgetUsd ? 0.9 : 0.2;
  const simplicity = capability.permissions.length <= 2 ? 0.9 : 0.45;
  const riskPenalty = analysis.taskType !== "repo_write" && capability.riskLevel === "high" ? 0.45 : 1;
  const verifiedPenalty = capability.verified ? 1 : 0.65;

  const score =
    (taskFit * 35 +
      trust * 20 +
      success * 15 +
      contextSafety * 15 +
      priceEfficiency * 10 +
      simplicity * 5) *
    riskPenalty *
    verifiedPenalty;

  return {
    capability,
    score: Math.round(score),
    reasons: buildReasons(capability, taskFit, budgetUsd)
  };
}

function getTaskFit(capability: CapabilityListing, analysis: TaskAnalysis): number {
  const supported = capability.supportedTasks.map((task) => task.toLowerCase());
  const required = analysis.requiredCapabilities.map((task) => task.toLowerCase());
  if (required.some((task) => supported.includes(task))) return 0.96;
  if (analysis.taskType === "onboarding" && supported.includes("clawup_setup")) return 0.98;
  if (analysis.taskType === "copywriting" && supported.includes("pitch")) return 0.94;
  if (analysis.taskType === "repo_write" && supported.includes("github")) return 0.95;
  if (capability.priceToken === "FREE" && analysis.taskType === "summarization") return 0.9;
  return 0.15;
}

function buildReasons(capability: CapabilityListing, taskFit: number, budgetUsd: number): string[] {
  const reasons = [
    `Task fit ${Math.round(taskFit * 100)}/100`,
    `Trust ${capability.trustScore}/100`,
    `Risk ${capability.riskLevel}`
  ];

  if (capability.priceUsd === 0) {
    reasons.push("free capability");
  } else if (capability.priceUsd <= budgetUsd) {
    reasons.push(`${capability.priceUsd.toFixed(2)} ${capability.priceToken} within budget`);
  } else {
    reasons.push(`${capability.priceUsd.toFixed(2)} ${capability.priceToken} above budget`);
  }

  return reasons;
}
