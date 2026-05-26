import fs from "node:fs";
import path from "node:path";
import seedCapabilities from "../data/capabilities.seed.json" with { type: "json" };
import type { CapabilityListing, ClawCompassStore } from "../types/domain.js";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function createInitialStore(): ClawCompassStore {
  return {
    capabilities: clone(seedCapabilities as CapabilityListing[]),
    transactions: [],
    reputationEvents: []
  };
}

export function loadStore(filePath?: string): ClawCompassStore {
  if (!filePath || !fs.existsSync(filePath)) {
    return createInitialStore();
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as ClawCompassStore;
  return {
    capabilities: parsed.capabilities ?? createInitialStore().capabilities,
    transactions: parsed.transactions ?? [],
    reputationEvents: parsed.reputationEvents ?? []
  };
}

export function saveStore(store: ClawCompassStore, filePath?: string): void {
  if (!filePath) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`);
}

export function findCapability(store: ClawCompassStore, idOrName: string): CapabilityListing | undefined {
  const normalized = idOrName.trim().toLowerCase();
  return store.capabilities.find(
    (capability) =>
      capability.id.toLowerCase() === normalized ||
      capability.name.toLowerCase() === normalized
  );
}
