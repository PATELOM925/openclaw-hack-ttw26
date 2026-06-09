# ClawCompass

ClawCompass is the selected GOAT/OpenClaw hackathon project: a capability acquisition layer for autonomous agents.

## Product

A requesting agent describes its task, goal, constraints, budget, and safe context. ClawCompass analyzes the capability gap, redacts sensitive context, recommends and sequences the right capability, buys low-risk tools through x402, sells marketplace capabilities from listed providers, delivers the result after verified payment, and records reputation.

## Demo Loop

```text
/ask task
-> analyze task and context
-> recommend 3 capabilities
-> show redacted context preview
-> approval only for risky or above-cap actions
-> require x402 payment
-> verify payment
-> execute SetupPilot
-> return result
-> log reputation
-> block risky write action without approval
```

Buyer demo path:

```text
/buy screen or POST /api/buy
-> buyer agent submits task, context, budget, wallet, and max risk
-> ClawCompass returns only buyable recommendations within that risk/budget
-> buyer gets x402 payment requirement
-> payment is settled locally only with ENABLE_MOCK_X402=true
-> bought capability executes and logs reputation
```

Seller demo path:

```text
/sell screen
-> marketplace shows capabilities ClawCompass sells
-> provider submits a new seller capability
-> submission returns pending_review, not auto-listed without review
```

## Status

- Idea brief: accepted.
- Local backend and full web app: implemented for local validation.
- SetupPilot is the primary paid demo capability for ClawUp, Telegram, ERC-8004, x402, wallet, and submission onboarding.
- Low-risk paid capabilities create x402 payment requirements autonomously within the `0.10 USDC` cap.
- Explicit buyer and seller surfaces are implemented in the API and web app.
- Optional Telegram runtime bridge is available behind `TELEGRAM_BOT_ENABLED=true`; it reuses the command handler and stays disabled by default.
- High-risk, write, wallet, external-message, unverified, above-cap, and secret-sensitive flows remain approval-gated.
- ClawUp agent, wallet, merchant, funding, and mainnet registration: blocked until explicit user action.
- Sanitized external proof intake exists, but final proof still needs verified ClawUp pairing, safe credentials, real x402 settlement, and ERC-8004 listing.
- On-chain reputation: not claimed until implemented and verified.

## Web App

Run:

```bash
npm run dev:web
```

Routes:
- `/`: broker workflow.
- `/buy`: buyer-agent workflow for recommendation, purchase intent, settlement, and execution.
- `/sell`: seller marketplace and pending provider submissions.
- `/transactions`: status, retry, and cancel.
- `/reputation`: local reputation and pending ERC-8004 write state.
- `/security`: policy and blocked-risk demo.
- `/proof`: ClawUp, Telegram, x402, wallet, and ERC-8004 proof blockers.

## Related Docs

- [Idea brief](IDEA-BRIEF.md)
- [Research](RESEARCH.md)
- [Architecture](ARCHITECTURE.md)
- [Build plan](BUILD-PLAN.md)
- [Brief-driven implementation plan](CODEX_IMPLEMENTATION_PLAN_CLAWCOMPASS.md)
- [Source of truth snapshot](SOURCE-OF-TRUTH.md)
- [External proof intake](EXTERNAL-PROOF-INTAKE.md)
- [Demo script](DEMO-SCRIPT.md)
- [Work graph](../../codex/work/WORK-GRAPH.md)
- [Build runbook](../BUILD-RUNBOOK.md)
- [Demo and submission guide](../DEMO-SUBMISSION.md)
- [ClawUp skill](../../../skills/clawup-agent-build/SKILL.md)
- [ERC-8004 skill](../../../skills/erc8004-mainnet-registration/SKILL.md)
- [x402 skill](../../../skills/x402-payment-readiness/SKILL.md)
