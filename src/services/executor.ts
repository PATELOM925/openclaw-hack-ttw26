import type { CapabilityListing } from "../types/capability.js";

export type PitchHawkOutput = {
  headline: string;
  subheadline: string;
  cta: string;
  threeBullets: string[];
  confidenceScore: number;
};

export type ExecutionInput = {
  task: string;
  allowedContext: string;
  desiredTone?: string;
};

export function executeCapability(
  capability: CapabilityListing,
  input: ExecutionInput
): PitchHawkOutput {
  if (capability.id === "pitchhawk") return executePitchHawk(input);
  if (capability.id === "freesummarizer") return executeFreeSummarizer(input);
  throw new Error(`Capability ${capability.id} is not executable in the MVP`);
}

export function executePitchHawk(input: ExecutionInput): PitchHawkOutput {
  const context = input.allowedContext.trim() || "your agent project";
  return {
    headline: "Stop guessing which agent tools to use.",
    subheadline: `ClawCompass turns "${summarize(context)}" into a safe, paid capability workflow for autonomous agents.`,
    cta: "Find my capability stack",
    threeBullets: [
      "Analyze the task before selecting tools.",
      "Share only the minimum safe context.",
      "Pay through x402 only when execution is approved."
    ],
    confidenceScore: 0.91
  };
}

function executeFreeSummarizer(input: ExecutionInput): PitchHawkOutput {
  return {
    headline: "Summary ready.",
    subheadline: summarize(input.allowedContext),
    cta: "Use summary",
    threeBullets: ["Free capability", "Low risk", "No payment required"],
    confidenceScore: 0.75
  };
}

function summarize(value: string): string {
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}
