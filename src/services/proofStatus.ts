export function getExternalProofStatus(env: Partial<NodeJS.ProcessEnv> = process.env) {
  const clawUpReady = Boolean(env.CLAWUP_AGENT_ID || env.CLAWUP_AGENT_NAME);
  const x402Ready = Boolean(
    env.GOATX402_API_URL &&
      env.GOATX402_API_KEY &&
      env.GOATX402_API_SECRET &&
      env.GOATX402_MERCHANT_ID &&
      env.GOAT_RECEIVING_WALLET
  );
  const erc8004Ready = Boolean(env.ERC8004_AGENT_ID);
  const erc8004Partial = Boolean(env.ERC8004_REGISTRATION_TX || env.AGENT_WALLET_ADDRESS);
  const requiredProof = {
    clawUp: {
      status: clawUpReady ? "ready" : "blocked",
      agentId: env.CLAWUP_AGENT_ID || "",
      agentName: env.CLAWUP_AGENT_NAME || "",
      webUiUrl: env.CLAWUP_WEB_UI_URL || "",
      gatewayUrl: env.OPENCLAW_GATEWAY_URL || "",
      blocker: clawUpReady ? "" : "Create ClawUp agent after explicit user approval."
    },
    telegram: {
      status: env.TELEGRAM_BOT_USERNAME ? "ready" : "blocked",
      username: env.TELEGRAM_BOT_USERNAME || "",
      blocker: env.TELEGRAM_BOT_USERNAME ? "" : "Pair Telegram through BotFather and ClawUp."
    },
    x402: {
      status: x402Ready ? "ready" : env.GOATX402_MERCHANT_ID ? "partial" : "blocked",
      merchantId: env.GOATX402_MERCHANT_ID || "",
      merchantName: env.GOATX402_MERCHANT_NAME || "",
      receivingWallet: env.GOAT_RECEIVING_WALLET || "",
      blocker: x402Ready
        ? ""
        : "Configure x402 API URL, API key, API secret, merchant ID, and receiving wallet outside tracked files."
    },
    erc8004: {
      status: erc8004Ready ? "ready" : erc8004Partial ? "partial" : "blocked",
      chainId: 2345,
      agentId: env.ERC8004_AGENT_ID || "",
      walletAddress: env.AGENT_WALLET_ADDRESS || "",
      registrationTx: env.ERC8004_REGISTRATION_TX || "",
      scanUrl: env.ERC8004_SCAN_URL || "https://8004scan.io/agents?chain=2345",
      blocker: erc8004Ready ? "" : "Register on GOAT Mainnet after wallet, gas, and approval exist, then record the agent ID."
    }
  };
  const blocked = Object.values(requiredProof).some((item) => item.status !== "ready");
  return {
    status: blocked ? "blocked_external_actions_required" : "ready_for_submission_evidence",
    requiredProof
  };
}
