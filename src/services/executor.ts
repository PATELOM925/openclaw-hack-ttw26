import type { CapabilityListing } from "../types/capability.js";

export type PitchHawkOutput = {
  headline: string;
  subheadline: string;
  cta: string;
  threeBullets: string[];
  confidenceScore: number;
};

export type SetupPhase =
  | "claw_creation"
  | "telegram_pairing"
  | "skill_installation"
  | "wallet_readiness"
  | "erc8004_registration"
  | "x402_setup"
  | "submission_readiness";

export type SetupPilotOutput = {
  phase: SetupPhase;
  detectedBlocker: string;
  safeNextAction: string;
  exactCommandOrPrompt: string;
  requiresHumanConfirmation: boolean;
  publicEvidenceToCapture: string[];
  stopConditions: string[];
};

export type ExecutionInput = {
  task: string;
  allowedContext: string;
  desiredTone?: string;
};

export function executeCapability(
  capability: CapabilityListing,
  input: ExecutionInput
): PitchHawkOutput | SetupPilotOutput {
  if (capability.id === "setuppilot") return executeSetupPilot(input);
  if (capability.id === "pitchhawk") return executePitchHawk(input);
  if (capability.id === "freesummarizer") return executeFreeSummarizer(input);
  throw new Error(`Capability ${capability.id} is not executable in the MVP`);
}

export function executeSetupPilot(input: ExecutionInput): SetupPilotOutput {
  const phase = inferSetupPhase(`${input.task}\n${input.allowedContext}`);
  const output = buildSetupPilotOutput(phase);
  validateSetupPilotOutput(output);
  return output;
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
      "Execute paid capabilities only after verified x402 settlement."
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

function inferSetupPhase(value: string): SetupPhase {
  const lower = value.toLowerCase();
  if (lower.includes("x402") || lower.includes("merchant") || lower.includes("payment")) return "x402_setup";
  if (lower.includes("8004") || lower.includes("mainnet") || lower.includes("register")) return "erc8004_registration";
  if (lower.includes("wallet") || lower.includes("gas") || lower.includes("stable")) return "wallet_readiness";
  if (lower.includes("skill") || lower.includes("tool")) return "skill_installation";
  if (lower.includes("telegram") || lower.includes("pair") || lower.includes("botfather")) return "telegram_pairing";
  if (lower.includes("submit") || lower.includes("judge") || lower.includes("proof")) return "submission_readiness";
  return "claw_creation";
}

function buildSetupPilotOutput(phase: SetupPhase): SetupPilotOutput {
  const commonEvidence = [
    "ClawUp public agent name or ID",
    "Telegram bot username, not token",
    "Public wallet address after wallet setup",
    "8004scan URL after ERC-8004 registration",
    "x402 payment ID or transaction hash after real payment"
  ];
  const stopConditions = [
    "Do not paste bot tokens, private keys, seed phrases, or x402 secrets into chat.",
    "Stop before wallet creation, funding, x402 merchant setup, mainnet registration, or real payments unless the user explicitly approves."
  ];

  if (phase === "telegram_pairing") {
    return {
      phase,
      detectedBlocker:
        "Telegram pairing is incomplete or confusing: the bot may exist, but the Telegram sender still needs owner approval before messages reach the Claw.",
      safeNextAction:
        "Send a message to the Telegram bot, copy the full pairing approval command, paste it into ClawUp web chat, then send another Telegram message to confirm the route.",
      exactCommandOrPrompt:
        "In ClawUp web chat, run the command returned by Telegram: openclaw pairing approve telegram <CODE>",
      requiresHumanConfirmation: true,
      publicEvidenceToCapture: ["Telegram bot username", "ClawUp pairing approved status", "Timestamped Telegram response"],
      stopConditions
    };
  }

  if (phase === "erc8004_registration") {
    return {
      phase,
      detectedBlocker:
        "Mainnet identity is not submission-ready until the ClawUp agent has a funded wallet and verified ERC-8004 registration.",
      safeNextAction:
        "Prepare public metadata first, confirm gas balance, then request explicit approval before calling the GOAT Mainnet ERC-8004 registry.",
      exactCommandOrPrompt:
        "After approval only: register ClawCompass on GOAT Mainnet ERC-8004 with chain ID 2345 and capture the 8004scan URL.",
      requiresHumanConfirmation: true,
      publicEvidenceToCapture: ["Public wallet address", "ERC-8004 agent ID", "GOAT Mainnet transaction hash", "8004scan URL"],
      stopConditions
    };
  }

  if (phase === "x402_setup") {
    return {
      phase,
      detectedBlocker:
        "x402 is not judge-ready until merchant credentials, receiving wallet, stablecoin balance, and real payment verification are available.",
      safeNextAction:
        "Keep credentials in runtime secrets only, verify receiving wallet and stable balance, then run one explicit approved payment test.",
      exactCommandOrPrompt:
        "After approval only: run a real 0.10 USDC x402 payment test and capture payment ID, token, amount, merchant ID, receiver, status, and tx hash.",
      requiresHumanConfirmation: true,
      publicEvidenceToCapture: ["x402 merchant ID if public", "Receiving wallet address", "Payment ID", "Payment status", "Transaction hash"],
      stopConditions
    };
  }

  if (phase === "wallet_readiness") {
    return {
      phase,
      detectedBlocker: "Wallet and funding status are not verified yet.",
      safeNextAction: "Record only the public address and balance status after the approved wallet flow; never expose the private key or seed phrase.",
      exactCommandOrPrompt: "Ask ClawUp to show the agent public wallet address only, then request gas/stables through the event forms.",
      requiresHumanConfirmation: true,
      publicEvidenceToCapture: ["Public wallet address", "Gas balance status", "Stablecoin balance status"],
      stopConditions
    };
  }

  return {
    phase,
    detectedBlocker: "Onboarding state is incomplete or not yet proven with public evidence.",
    safeNextAction: "Diagnose the current ClawUp setup using only public status, public IDs, and visible error messages.",
    exactCommandOrPrompt: "Ask ClawCompass: diagnose my ClawUp setup using only public status and error messages; do not request or store secrets.",
    requiresHumanConfirmation: phase !== "skill_installation",
    publicEvidenceToCapture: commonEvidence,
    stopConditions
  };
}

export function validateSetupPilotOutput(output: SetupPilotOutput): void {
  if (
    !output.phase ||
    !output.detectedBlocker ||
    !output.safeNextAction ||
    !output.exactCommandOrPrompt ||
    !Array.isArray(output.publicEvidenceToCapture) ||
    output.publicEvidenceToCapture.length === 0 ||
    !Array.isArray(output.stopConditions) ||
    output.stopConditions.length === 0
  ) {
    throw new Error("Invalid SetupPilot output");
  }
}
