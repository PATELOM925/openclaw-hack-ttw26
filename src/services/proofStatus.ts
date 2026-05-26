type ProofState = "ready" | "partial" | "blocked";

type ProofItem = {
  status: ProofState;
  blocker?: string;
  missing?: string[];
  [key: string]: string | number | string[] | ProofState | undefined;
};

export function getExternalProofStatus(env: Partial<NodeJS.ProcessEnv> = process.env) {
  const clawUp = evaluateProofState(
    [Boolean(env.CLAWUP_AGENT_NAME), Boolean(env.CLAWUP_AGENT_ID)],
    {
      statusKey: "ClawUp proof",
      requiredFields: ["CLAWUP_AGENT_NAME", "CLAWUP_AGENT_ID"],
      blockers: {
        blocked: "Create ClawUp agent after explicit user approval.",
        partial: "Paste ClawUp agent name and ID from ClawUp dashboard."
      }
    }
  );

  const telegramHasUsername = Boolean(env.TELEGRAM_BOT_USERNAME);
  const telegramVerified = env.TELEGRAM_PAIRING_VERIFIED === "true";
  const telegram = evaluateSimpleProofState(
    [
      telegramHasUsername,
      telegramVerified
    ],
    {
      presentMsg: "Telegram pairing is verified.",
      blockedMsg: "Pair Telegram through BotFather and ClawUp.",
      partialMsg: "Telegram username captured; confirm bot is paired.",
      requiredFields: ["TELEGRAM_BOT_USERNAME", "TELEGRAM_PAIRING_VERIFIED"]
    }
  );

  const x402HasProof = Boolean(
    env.GOATX402_MERCHANT_ID &&
      (env.GOATX402_PAYMENT_PROOF_ID || env.GOATX402_SETTLEMENT_TX) &&
      env.GOAT_RECEIVING_WALLET
  );
  const x402HasAny = Boolean(
    env.GOATX402_API_URL ||
      env.GOATX402_API_KEY ||
      env.GOATX402_API_SECRET ||
      env.GOATX402_MERCHANT_ID ||
      env.GOATX402_MERCHANT_NAME ||
      env.GOATX402_ACCOUNT_EMAIL ||
      env.GOATX402_PAYMENT_PROOF_ID ||
      env.GOATX402_SETTLEMENT_TX ||
      env.GOAT_RECEIVING_WALLET
  );
  const x402 = evaluateSimpleProofState(
    [
      Boolean(env.GOATX402_MERCHANT_ID),
      Boolean(env.GOATX402_MERCHANT_NAME),
      Boolean(env.GOATX402_ACCOUNT_EMAIL),
      Boolean(env.GOATX402_API_URL),
      Boolean(env.GOATX402_API_KEY),
      Boolean(env.GOATX402_API_SECRET),
      Boolean(env.GOAT_RECEIVING_WALLET),
      x402HasProof
    ],
    {
      presentMsg: "x402 payment proof captured for submission.",
      blockedMsg: "Record real x402 payment proof and required merchant details after approval.",
      partialMsg: "x402 setup is partial. Add payment proof and final approved merchant details before demo.",
      requiredFields: [
        "GOATX402_MERCHANT_ID",
        "GOATX402_MERCHANT_NAME",
        "GOATX402_ACCOUNT_EMAIL",
        "GOATX402_API_URL",
        "GOATX402_API_KEY",
        "GOATX402_API_SECRET",
        "GOAT_RECEIVING_WALLET",
        "GOATX402_PAYMENT_PROOF_ID or GOATX402_SETTLEMENT_TX"
      ],
      forceStatus: x402HasProof ? "ready" : (x402HasAny ? "partial" : "blocked")
    }
  );

  const erc8004 = evaluateProofState(
    [
      Boolean(env.ERC8004_AGENT_ID),
      Boolean(env.ERC8004_REGISTRATION_TX),
      Boolean(env.ERC8004_AGENT_URI)
    ],
    {
      statusKey: "erc8004",
      requiredFields: ["ERC8004_AGENT_ID", "ERC8004_REGISTRATION_TX", "ERC8004_AGENT_URI"],
      blockers: {
        blocked: "Register on GOAT Mainnet after wallet, gas, and approval exist.",
        partial: "ERC-8004 registration is started; complete identity id, registration tx, and metadata."
      }
    }
  );

  const requiredProof: Record<string, ProofItem> = {
    clawUp: {
      ...clawUp,
      agentId: env.CLAWUP_AGENT_ID || "",
      agentName: env.CLAWUP_AGENT_NAME || "",
      blocker: clawUp.blocker
    },
    telegram: {
      ...telegram,
      username: env.TELEGRAM_BOT_USERNAME || "",
      blocker: telegram.blocker
    },
    x402: {
      ...x402,
      merchantId: env.GOATX402_MERCHANT_ID || "",
      apiUrl: env.GOATX402_API_URL || "",
      payerWallet: env.GOAT_RECEIVING_WALLET || "",
      paymentProofId: env.GOATX402_PAYMENT_PROOF_ID || "",
      settlementTx: env.GOATX402_SETTLEMENT_TX || "",
      blocker: x402.blocker
    },
    erc8004: {
      ...erc8004,
      chainId: 2345,
      scanUrl: env.ERC8004_SCAN_URL || "https://8004scan.io/agents?chain=2345",
      agentId: env.ERC8004_AGENT_ID || "",
      registrationTx: env.ERC8004_REGISTRATION_TX || "",
      agentUri: env.ERC8004_AGENT_URI || "",
      blocker: erc8004.blocker
    }
  };

  const ready = Object.values(requiredProof).every((item) => item.status === "ready");

  return {
    status: ready ? "ready_for_submission_evidence" : "blocked_external_actions_required",
    requiredProof,
    summary: {
      ready: Object.values(requiredProof).filter((item) => item.status === "ready").length,
      partial: Object.values(requiredProof).filter((item) => item.status === "partial").length,
      blocked: Object.values(requiredProof).filter((item) => item.status === "blocked").length
    }
  };
}

function evaluateProofState(
  presence: boolean[],
  config: {
    statusKey: string;
    requiredFields: string[];
    blockers: {
      blocked: string;
      partial: string;
    };
  }
): ProofItem {
  const presentCount = presence.filter(Boolean).length;
  if (presentCount === 0) {
    return {
      status: "blocked",
      blocker: `${config.statusKey}: ${config.blockers.blocked}`,
      missing: [...config.requiredFields]
    };
  }
  if (presentCount < presence.length) {
    return {
      status: "partial",
      blocker: `${config.statusKey}: ${config.blockers.partial}`,
      missing: config.requiredFields.filter((field, index) => !presence[index])
    };
  }
  return {
    status: "ready",
    missing: []
  };
}

function evaluateSimpleProofState(
  presence: boolean[],
  config: {
    requiredFields: string[];
    presentMsg: string;
    blockedMsg: string;
    partialMsg: string;
    forceStatus?: ProofState;
  }
): ProofItem {
  if (config.forceStatus) {
    if (config.forceStatus === "ready") {
      return { status: "ready", missing: [] };
    }

    if (config.forceStatus === "blocked") {
      return {
        status: "blocked",
        blocker: config.blockedMsg,
        missing: config.requiredFields.filter((field, idx) => !presence[idx] && field !== "GOATX402_PAYMENT_PROOF_ID or GOATX402_SETTLEMENT_TX")
      };
    }

    return {
      status: "partial",
      blocker: config.partialMsg,
      missing: config.requiredFields.filter((field, idx) => !presence[idx] && field !== "GOATX402_PAYMENT_PROOF_ID or GOATX402_SETTLEMENT_TX")
    };
  }

  const presentCount = presence.filter(Boolean).length;
  if (presentCount === 0) {
    return {
      status: "blocked",
      blocker: config.blockedMsg,
      missing: [...config.requiredFields]
    };
  }

  if (presentCount < presence.length) {
    return {
      status: "partial",
      blocker: config.partialMsg,
      missing: config.requiredFields.filter((field, index) => !presence[index] && field !== "GOATX402_PAYMENT_PROOF_ID or GOATX402_SETTLEMENT_TX")
    };
  }

  return {
    status: "ready",
    blocker: config.presentMsg,
    missing: []
  };
}
