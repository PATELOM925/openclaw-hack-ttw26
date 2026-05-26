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
-> approve paid capability
-> require x402 payment
-> verify payment
-> execute PitchHawk
-> return result
-> log reputation
-> block risky write action without approval
```

## Status

- Idea brief: accepted.
- Local backend: in progress.
- ClawUp agent, wallet, merchant, funding, and mainnet registration: blocked until explicit user action.
- On-chain reputation: not claimed until implemented and verified.

## Related Docs

- [Idea brief](IDEA-BRIEF.md)
- [Research](RESEARCH.md)
- [Architecture](ARCHITECTURE.md)
- [Build plan](BUILD-PLAN.md)
- [Demo script](DEMO-SCRIPT.md)
- [Work graph](../../codex/work/WORK-GRAPH.md)
- [Build runbook](../BUILD-RUNBOOK.md)
- [Demo and submission guide](../DEMO-SUBMISSION.md)
- [ClawUp skill](../../../skills/clawup-agent-build/SKILL.md)
- [ERC-8004 skill](../../../skills/erc8004-mainnet-registration/SKILL.md)
- [x402 skill](../../../skills/x402-payment-readiness/SKILL.md)
