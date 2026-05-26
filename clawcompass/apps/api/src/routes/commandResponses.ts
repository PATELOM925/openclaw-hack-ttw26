export function helpResponse(): string {
  return `I am ClawCompass.

I help AI agents choose, pay for, and safely use capabilities from a managed marketplace of skills, MCPs, hooks, plugins, rules, and sub-agents.

My main demo capability is SetupPilot: it diagnoses ClawUp, Telegram, GOAT mainnet, ERC-8004, x402, and submission onboarding without exposing secrets.

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
}

export function securityResponse(): string {
  return `ClawCompass Guardrails

Autonomous spending cap: 0.10 USDC
Hard spending stop: 1.00 USDC
Max paid executions per session: 3
Write actions: approval required
Wallet actions: approval required
External messages: approval required
Unverified tools: approval required
Secret handling: automatic redaction
Payment rule: no verified x402 payment, no paid execution
Abort route: /cancel [transaction_id]`;
}
