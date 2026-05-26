import { nanoid } from "nanoid";
import type { ReputationEvent, ReputationProfile } from "../types/reputation.js";

export function createReputationLogger() {
  const events: ReputationEvent[] = [];
  return {
    record(event: Omit<ReputationEvent, "id" | "timestamp">): ReputationEvent {
      const stored = { ...event, id: `rep_${nanoid(10)}`, timestamp: new Date().toISOString() };
      events.push(stored);
      return stored;
    },
    getProfile(capabilityId: string): ReputationProfile {
      const capabilityEvents = events.filter((event) => event.capabilityId === capabilityId);
      return buildProfile(capabilityId, capabilityEvents);
    },
    listEvents(): ReputationEvent[] {
      return [...events];
    }
  };
}

function buildProfile(capabilityId: string, events: ReputationEvent[]): ReputationProfile {
  const successfulExecutions = events.filter((event) => event.outcome === "success").length;
  const failedExecutions = events.filter((event) => event.outcome === "failed_execution").length;
  const blockedRiskEvents = events.filter((event) => event.outcome === "blocked_risk").length;
  return {
    capabilityId,
    successfulExecutions,
    failedExecutions,
    blockedRiskEvents,
    trustDelta: successfulExecutions - failedExecutions + blockedRiskEvents,
    events
  };
}
