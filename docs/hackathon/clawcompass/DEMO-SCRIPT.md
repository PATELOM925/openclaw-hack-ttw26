# ClawCompass Demo Script

## Opening

ClawCompass helps autonomous agents acquire the right capability for a task without manually choosing, trusting, paying for, and sequencing tools.

## Self-Disclosure Prompt

User: `What do you do, and how do I use you?`

Expected response: ClawCompass explains that it analyzes tasks, redacts sensitive context, recommends capabilities, asks before paid or risky actions, triggers x402 payment for paid execution, and logs outcomes.

## Core Workflow

1. User sends: `/ask I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.`
2. ClawCompass classifies the task as onboarding, redacts secrets, and recommends `SetupPilot`.
3. User sends: `/use SetupPilot`.
4. ClawCompass shows the safe context preview and payment requirement.
5. User approves and completes x402 payment. Local development can use mock settlement only with `ENABLE_MOCK_X402=true`.
6. ClawCompass executes SetupPilot and returns setup phase, blocker, next safe action, confirmation requirement, and public evidence checklist.
7. Reputation updates locally.

## Buyer And Seller Proof

Buyer path in the web app:

1. Open `/buy`.
2. Keep the demo buyer agent ID, wallet, task, and public context.
3. Click `Create buy intent`.
4. Verify the selected capability, recommended tools to buy, blocked-context field, and x402 transaction.
5. Click `Settle buyer payment` only in local mock mode.
6. Click `Execute bought tool` and show the bought output.

Seller path in the web app:

1. Open `/sell`.
2. Show listed capabilities and prices ClawCompass can sell.
3. Submit a provider capability.
4. Verify the API returns `pending_review`, proving provider intake exists without auto-listing unsafe tools.

## Guardrail Moment

User requests: `/ask I need a tool that can rewrite my repo and push changes to GitHub.`

Expected response: ClawCompass detects high risk, explains code write and external push risk, and requires explicit approval before any write action.

## GOAT Proof

- ERC-8004 agent ID: blocked until registration.
- Mainnet registration transaction: blocked until registration.
- 8004scan URL: blocked until listing exists.

## x402 Proof

- Payment mode: DIRECT.
- Amount: `0.10 USDC`.
- Order or transaction evidence: blocked until merchant and funding are ready.
- Fallback: local payment state proves no paid result is delivered before settlement.

## Close

After the hackathon, ClawCompass can add real MCP ingestion, provider verification, payout splitting, private capability marketplaces, and on-chain reputation feedback.

## Related Docs

- [Hub](README.md)
- [Idea brief](IDEA-BRIEF.md)
- [Architecture](ARCHITECTURE.md)
- [Demo and submission guide](../DEMO-SUBMISSION.md)
