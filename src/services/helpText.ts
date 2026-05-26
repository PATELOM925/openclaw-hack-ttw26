export const helpText = `I am ClawCompass.

I help AI agents choose, pay for, and safely use capabilities from a managed marketplace of skills, MCPs, hooks, plugins, rules, and sub-agents.

Give me a task and I will:
1. Analyze the task and required capabilities
2. Classify and redact sensitive context
3. Search my capability marketplace
4. Rank tools by fit, trust, risk, and price
5. Ask for approval before paid or risky actions
6. Trigger x402 payment when required
7. Execute or grant access after payment is verified
8. Record outcome and reputation

Commands:
/ask [task] - recommend capabilities
/marketplace - browse available capabilities
/tool [name] - inspect a capability
/use [name] - pay for and execute a capability
/security - show guardrails
/transactions - show payment history
/reputation [name] - show trust history
/register_tool - submit a new capability`;

export function getHelpResponse() {
  return {
    name: "ClawCompass",
    description:
      "I am a capability broker for autonomous agents. I analyze tasks, redact sensitive context, recommend capabilities, ask before paid or risky actions, require x402 payment for paid execution, and log outcomes.",
    text: helpText,
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
