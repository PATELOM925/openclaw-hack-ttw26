# ClawCompass

ClawCompass is the selected GOAT/OpenClaw hackathon project: a capability acquisition layer for autonomous agents.

## Product

A requesting agent describes its task, goal, constraints, budget, and safe context. ClawCompass analyzes the capability gap, redacts sensitive context, recommends and sequences the right capability, gates paid execution through x402, delivers the result, and records reputation.

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

## Status

- Idea brief: accepted.
- Local backend and full web app: implemented for local validation.
- SetupPilot is the primary paid demo capability for ClawUp, Telegram, ERC-8004, x402, wallet, and submission onboarding.
- Low-risk paid capabilities create x402 payment requirements autonomously within the `0.10 USDC` cap.
- High-risk, write, wallet, external-message, unverified, above-cap, and secret-sensitive flows remain approval-gated.
- ClawUp agent, wallet, merchant, funding, and mainnet registration: blocked until explicit user action.
- On-chain reputation: not claimed until implemented and verified.

## Web App

Run:

```bash
npm run dev:web
```

Routes:
- `/`: broker workflow.
- `/capabilities`: marketplace and capability details.
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
- [Demo script](DEMO-SCRIPT.md)
- [Work graph](../../codex/work/WORK-GRAPH.md)
- [Build runbook](../BUILD-RUNBOOK.md)
- [Demo and submission guide](../DEMO-SUBMISSION.md)
- [ClawUp skill](../../../skills/clawup-agent-build/SKILL.md)
- [ERC-8004 skill](../../../skills/erc8004-mainnet-registration/SKILL.md)
- [x402 skill](../../../skills/x402-payment-readiness/SKILL.md)
