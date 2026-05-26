# ClawCompass Demo Script

## Opening

ClawCompass helps autonomous agents acquire the right capability for a task without manually choosing, trusting, paying for, and sequencing tools.

## Self-Disclosure Prompt

User: `What do you do, and how do I use you?`

Expected response: ClawCompass explains that it analyzes tasks, redacts sensitive context, recommends capabilities, asks before paid or risky actions, triggers x402 payment for paid execution, and logs outcomes.

## Core Workflow

1. User sends: `/ask I am building a hackathon project. Improve my homepage pitch using this project summary. Budget: 0.10 USDC. Do not expose secrets.`
2. ClawCompass classifies the task as copywriting, redacts secrets, and recommends `PitchHawk`.
3. User sends: `/use PitchHawk`.
4. ClawCompass shows the context preview and payment requirement.
5. User approves and completes x402 payment.
6. ClawCompass executes PitchHawk and returns headline, subheadline, CTA, bullets, and confidence.
7. Reputation updates locally.

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
