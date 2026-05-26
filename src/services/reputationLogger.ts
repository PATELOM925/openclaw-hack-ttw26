import { nanoid } from "nanoid";
import type { ReputationEvent, ReputationProfile, ReputationWriteStatus } from "../types/reputation.js";

type ReputationRecordInput =
  Omit<ReputationEvent, "id" | "timestamp" | "onChainWritten" | "writeStatus"> &
  Partial<Pick<ReputationEvent, "onChainWritten" | "writeStatus">>;

export function createReputationLogger() {
  const events: ReputationEvent[] = [];
  return {
    record(event: ReputationRecordInput): ReputationEvent {
      const stored = {
        ...event,
        onChainWritten: event.onChainWritten ?? false,
        writeStatus: event.writeStatus ?? defaultWriteStatus(event),
        id: `rep_${nanoid(10)}`,
        timestamp: new Date().toISOString()
      };
      events.push(stored);
      return stored;
    },
    getProfile(capabilityId: string): ReputationProfile {
      const capabilityEvents = events.filter((event) => event.capabilityId === capabilityId);
      return buildProfile(capabilityId, capabilityEvents);
    },
    listEvents(): ReputationEvent[] {
      return [...events];
    },
    prepareOnChainWrite(capabilityId: string): Pick<ReputationEvent, "onChainWritten" | "writeStatus" | "agentId" | "erc8004TxHash"> {
      const hasExternalProof =
        Boolean(process.env.ERC8004_AGENT_ID) &&
        Boolean(process.env.AGENT_WALLET_ADDRESS) &&
        Boolean(process.env.AGENT_PRIVATE_KEY);
      return {
        onChainWritten: false,
        writeStatus: hasExternalProof ? "ready_to_write" : "pending_external_proof",
        agentId: process.env.ERC8004_AGENT_ID || undefined,
        erc8004TxHash: undefined
      };
    }
  };
}

function defaultWriteStatus(event: Pick<ReputationEvent, "outcome" | "paymentVerified" | "executionVerified">): ReputationWriteStatus {
  if (event.outcome !== "success") return "not_applicable";
  if (event.paymentVerified && event.executionVerified) return "pending_external_proof";
  return "not_applicable";
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
