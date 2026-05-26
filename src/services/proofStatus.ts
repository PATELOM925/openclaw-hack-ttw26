export function getExternalProofStatus(env: Partial<NodeJS.ProcessEnv> = process.env) {
  const requiredProof = {
    clawUp: {
      status: env.CLAWUP_AGENT_ID ? "ready" : "blocked",
      agentId: env.CLAWUP_AGENT_ID || "",
      blocker: env.CLAWUP_AGENT_ID ? "" : "Create ClawUp agent after explicit user approval."
    },
    telegram: {
      status: env.TELEGRAM_BOT_USERNAME ? "ready" : "blocked",
      username: env.TELEGRAM_BOT_USERNAME || "",
      blocker: env.TELEGRAM_BOT_USERNAME ? "" : "Pair Telegram through BotFather and ClawUp."
    },
    x402: {
      status: env.GOATX402_MERCHANT_ID ? "ready" : "blocked",
      merchantId: env.GOATX402_MERCHANT_ID || "",
      blocker: env.GOATX402_MERCHANT_ID ? "" : "Configure x402 merchant credentials outside tracked files."
    },
    erc8004: {
      status: env.ERC8004_AGENT_ID ? "ready" : "blocked",
      chainId: 2345,
      agentId: env.ERC8004_AGENT_ID || "",
      scanUrl: env.ERC8004_SCAN_URL || "https://8004scan.io/agents?chain=2345",
      blocker: env.ERC8004_AGENT_ID ? "" : "Register on GOAT Mainnet after wallet, gas, and approval exist."
    }
  };
  const blocked = Object.values(requiredProof).some((item) => item.status === "blocked");
  return {
    status: blocked ? "blocked_external_actions_required" : "ready_for_submission_evidence",
    requiredProof
  };
}
