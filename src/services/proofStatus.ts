export function getExternalProofStatus(env: Partial<NodeJS.ProcessEnv> = process.env) {
  const telegramVerified = env.TELEGRAM_PAIRING_VERIFIED === "true";
  const x402Verified = Boolean(env.GOATX402_MERCHANT_ID && (env.GOATX402_PAYMENT_PROOF_ID || env.GOATX402_SETTLEMENT_TX));
  const erc8004Verified = Boolean(env.ERC8004_AGENT_ID && env.ERC8004_REGISTRATION_TX);
  const requiredProof = {
    clawUp: {
      status: env.CLAWUP_AGENT_ID ? "ready" : "blocked",
      agentId: env.CLAWUP_AGENT_ID || "",
      blocker: env.CLAWUP_AGENT_ID ? "" : "Create ClawUp agent after explicit user approval."
    },
    telegram: {
      status: env.TELEGRAM_BOT_USERNAME && telegramVerified ? "ready" : "blocked",
      username: env.TELEGRAM_BOT_USERNAME || "",
      blocker:
        env.TELEGRAM_BOT_USERNAME && !telegramVerified
          ? "Telegram bot username exists, but ClawUp pairing proof is not verified."
          : "Pair Telegram through BotFather and ClawUp."
    },
    x402: {
      status: x402Verified ? "ready" : "blocked",
      merchantId: env.GOATX402_MERCHANT_ID || "",
      paymentProofId: env.GOATX402_PAYMENT_PROOF_ID || "",
      settlementTx: env.GOATX402_SETTLEMENT_TX || "",
      blocker: x402Verified ? "" : "Record real x402 payment proof after merchant setup, funds, and explicit approval."
    },
    erc8004: {
      status: erc8004Verified ? "ready" : "blocked",
      chainId: 2345,
      agentId: env.ERC8004_AGENT_ID || "",
      registrationTx: env.ERC8004_REGISTRATION_TX || "",
      scanUrl: env.ERC8004_SCAN_URL || "https://8004scan.io/agents?chain=2345",
      blocker: erc8004Verified ? "" : "Register on GOAT Mainnet and record transaction proof after wallet, gas, and approval exist."
    }
  };
  const blocked = Object.values(requiredProof).some((item) => item.status === "blocked");
  return {
    status: blocked ? "blocked_external_actions_required" : "ready_for_submission_evidence",
    requiredProof
  };
}
