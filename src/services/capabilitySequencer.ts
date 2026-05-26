import type { CapabilityListing, CapabilitySequenceStep } from "../types/capability.js";
import type { TaskAnalysis } from "../types/request.js";

const sequences: Record<string, string[]> = {
  copywriting: ["researchfox", "pitchhawk", "hookguard"],
  research: ["researchfox", "freesummarizer"],
  code_review: ["codewolf", "hookguard"],
  repo_write: ["codewolf", "githubhelper", "hookguard"],
  agent_safety: ["hookguard"],
  onboarding: ["setuppilot", "hookguard"],
  summarization: ["freesummarizer"],
  data_extraction: ["freesummarizer"],
  unknown: ["freesummarizer"]
};

export function buildCapabilitySequence(
  analysis: TaskAnalysis,
  capabilities: CapabilityListing[]
): CapabilitySequenceStep[] {
  const ids = analysis.recommendedSequence.length
    ? analysis.recommendedSequence
    : sequences[analysis.taskType] ?? sequences.unknown;
  return ids.flatMap((id, index) => {
    const capability = capabilities.find((item) => item.id === id);
    return capability ? [toStep(capability, index + 1)] : [];
  });
}

function toStep(capability: CapabilityListing, step: number): CapabilitySequenceStep {
  return {
    step,
    capabilityId: capability.id,
    name: capability.name,
    purpose: capability.description
  };
}
