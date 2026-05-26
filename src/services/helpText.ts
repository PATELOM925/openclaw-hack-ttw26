export function getHelpResponse() {
  return {
    name: "ClawCompass",
    description:
      "I am a capability broker for autonomous agents. I analyze tasks, redact sensitive context, recommend capabilities, ask before paid or risky actions, require x402 payment for paid execution, and log outcomes.",
    commands: [
      "/help",
      "/ask [task]",
      "/marketplace",
      "/tool [name]",
      "/use [name]",
      "/security",
      "/transactions",
      "/reputation [name]",
      "/register_tool",
      "/cancel [transaction_id]",
      "/retry [transaction_id]"
    ],
    limits: [
      "No verified x402 payment, no paid execution.",
      "Write, wallet, external-message, unverified, or high-risk actions require approval.",
      "Secrets are redacted from context previews."
    ]
  };
}
