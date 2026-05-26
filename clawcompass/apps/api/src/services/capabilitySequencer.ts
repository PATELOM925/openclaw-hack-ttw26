import type { CapabilityRecommendation } from "../types/domain.js";

export function sequenceCapabilities(recommendations: CapabilityRecommendation[]): string[] {
  return recommendations.map((recommendation) => recommendation.capability.id);
}
