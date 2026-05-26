import capabilitiesSeed from "../data/capabilities.seed.json" with { type: "json" };
import type { CapabilityListing } from "../types/capability.js";

const capabilities = capabilitiesSeed as CapabilityListing[];

export function listCapabilities(): CapabilityListing[] {
  return capabilities.map((capability) => ({ ...capability }));
}

export function findCapability(idOrName: string): CapabilityListing | undefined {
  const normalized = idOrName.trim().toLowerCase();
  return listCapabilities().find((capability) => {
    return capability.id === normalized || capability.name.toLowerCase() === normalized;
  });
}
