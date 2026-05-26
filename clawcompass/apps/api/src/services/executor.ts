import type {
  ClawCompassStore,
  PitchHawkInput,
  PitchHawkOutput,
  SetupPhase,
  SetupPilotInput,
  SetupPilotOutput
} from "../types/domain.js";
import { assertPaymentVerified, getTransaction, markTransactionDelivered } from "./x402PaymentGate.js";

type ExecuteInput = {
  store: ClawCompassStore;
  transactionId: string;
  input?: PitchHawkInput;
};

export function executePitchHawk({ store, transactionId, input }: ExecuteInput): PitchHawkOutput {
  const transaction = getTransaction(store, transactionId);
  assertPaymentVerified(transaction);
  transaction.status = "executing";

  const projectSummary =
    input?.projectSummary?.trim() ||
    "ClawCompass helps AI agents discover, pay for, and safely execute the right capabilities.";
  const targetUser = input?.targetUser?.trim() || "AI agent builders";

  const result: PitchHawkOutput = {
    headline: "Stop guessing which agent tools to use.",
    subheadline: `${projectSummary} Built for ${targetUser} who need trusted execution, not another static directory.`,
    cta: "Find my capability stack",
    threeBullets: [
      "Analyzes the requesting agent's task and context",
      "Ranks tools by fit, trust, price, and risk",
      "Gates paid capabilities through verified x402 payments"
    ],
    confidenceScore: 0.91
  };

  validatePitchHawkOutput(result);
  markTransactionDelivered(store, transactionId);
  return result;
}

export function validatePitchHawkOutput(output: PitchHawkOutput): void {
  if (!output.headline || !output.subheadline || !output.cta || output.threeBullets.length !== 3) {
    throw new Error("Invalid PitchHawk output");
  }
  if (output.confidenceScore < 0 || output.confidenceScore > 1) {
    throw new Error("Invalid PitchHawk confidence score");
  }
}

type SetupExecuteInput = {
  store: ClawCompassStore;
  transactionId: string;
  input?: SetupPilotInput;
};

export function executeSetupPilot({
  store,
  transactionId,
  input
}: SetupExecuteInput): SetupPilotOutput {
  const transaction = getTransaction(store, transactionId);
  assertPaymentVerified(transaction);
  transaction.status = "executing";

  const combined = `${input?.task ?? ""} ${input?.context ?? ""}`.toLowerCase();
  const phase = inferSetupPhase(combined);
  const result = buildSetupPilotOutput(phase);

  validateSetupPilotOutput(result);
  markTransactionDelivered(store, transactionId);
  return result;
}

export function validateSetupPilotOutput(output: SetupPilotOutput): void {
  if (
    !output.phase ||
    !output.detectedBlocker ||
    !output.safeNextAction ||
    !output.exactCommandOrPrompt ||
    output.publicEvidenceToCapture.length === 0 ||
    output.stopConditions.length === 0
  ) {
    throw new Error("Invalid SetupPilot output");
  }
}

function inferSetupPhase(combined: string): SetupPhase {
  if (combined.includes("telegram") || combined.includes("pairing") || combined.includes("bot")) {
    return "telegram_pairing";
  }
  if (combined.includes("erc") || combined.includes("8004") || combined.includes("mainnet")) {
    return "erc8004_registration";
  }
  if (combined.includes("x402") || combined.includes("merchant") || combined.includes("payment")) {
    return "x402_setup";
  }
  if (combined.includes("wallet") || combined.includes("gas") || combined.includes("stable")) {
    return "wallet_funding";
  }
  if (combined.includes("skill")) {
    return "skill_installation";
  }
  if (combined.includes("submit") || combined.includes("judge") || combined.includes("demo")) {
    return "submission_readiness";
  }
  return "claw_creation";
}

function buildSetupPilotOutput(phase: SetupPhase): SetupPilotOutput {
  const commonEvidence = [
    "ClawUp public agent name or ID",
    "Telegram bot username",
    "8004scan URL after registration",
    "x402 payment ID or transaction hash after real payment"
  ];
  const stopConditions = [
    "Do not paste bot tokens, private keys, or x402 secrets into chat.",
    "Do not create wallets, submit forms, register on-chain, or run real payments without explicit approval.",
    "Record only public addresses, agent IDs, dashboard links, and transaction hashes."
  ];

  if (phase === "telegram_pairing") {
    return {
      phase,
      detectedBlocker:
        "Telegram pairing is incomplete or confusing: the bot token may be configured, but the Telegram sender still needs owner approval before messages reach the Claw.",
      safeNextAction:
        "Send a message to the Telegram bot, copy the full pairing approval command, paste it into ClawUp web chat, then send another Telegram message to confirm the route.",
      exactCommandOrPrompt:
        "In ClawUp web chat, run the command returned by Telegram: openclaw pairing approve telegram <CODE>",
      requiredHumanConfirmation: "none",
      publicEvidenceToCapture: commonEvidence.slice(0, 2),
      stopConditions
    };
  }

  if (phase === "erc8004_registration") {
    return {
      phase,
      detectedBlocker:
        "Mainnet identity is not prize-ready until the ClawUp agent has a funded wallet and verified ERC-8004 registration.",
      safeNextAction:
        "Prepare public metadata first, confirm gas balance, then ask for explicit approval before calling the GOAT Mainnet ERC-8004 registry.",
      exactCommandOrPrompt:
        "After approval only: register ClawCompass on GOAT Mainnet ERC-8004 with chain ID 2345 and registry 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432.",
      requiredHumanConfirmation: "APPROVE_ONCHAIN",
      publicEvidenceToCapture: ["Public wallet address", "ERC-8004 agent ID", "GOAT Mainnet transaction hash", "8004scan URL"],
      stopConditions
    };
  }

  if (phase === "x402_setup") {
    return {
      phase,
      detectedBlocker:
        "x402 is not judge-ready until merchant credentials, receiving wallet, stablecoin balance, and a real payment verification are available.",
      safeNextAction:
        "Register or approve the merchant account, keep API credentials outside repo files, then run a low-value payment test with explicit confirmation.",
      exactCommandOrPrompt:
        "After approval only: run a real 0.10 USDC x402 payment test and capture payment ID, token, amount, merchant ID, receiver, status, and tx hash.",
      requiredHumanConfirmation: "CONFIRM_PAYMENT",
      publicEvidenceToCapture: ["x402 merchant ID if public", "Receiving wallet address", "Payment ID", "Payment status", "Transaction hash"],
      stopConditions
    };
  }

  return {
    phase,
    detectedBlocker:
      "The setup flow has multiple dependent gates; the next step should be completed and verified before moving to wallet, mainnet, or payment actions.",
    safeNextAction:
      "Confirm the current setup phase, complete the next non-secret action, and capture public evidence before proceeding.",
    exactCommandOrPrompt:
      "Ask ClawCompass: diagnose my ClawUp setup using only public status and error messages; do not request or store secrets.",
    requiredHumanConfirmation: phase === "wallet_funding" ? "APPROVE_WALLET" : "none",
    publicEvidenceToCapture: commonEvidence,
    stopConditions
  };
}
