# ClawCompass Source Of Truth

## Primary Brief

- Path: `/Users/shreyapatel/Projects/zzz project docs/GOAT Hack/CODEX_IMPLEMENTATION_BRIEF_CLAWCOMPASS.md`
- Lines read: 1,597
- SHA-256: `224ca580d65e7bb3ddc5096ff5747487fd201c56151f8ca53a043149ceef01c0`
- Status: source of truth for implementation and demo planning.

## Product Definition

ClawCompass is a capability broker for autonomous AI agents. A requesting agent describes a task, goal, budget, and context. ClawCompass analyzes capability needs, redacts sensitive context, recommends and sequences capabilities, gates paid execution through x402, executes after verified payment, and records local reputation.

The product is not a generic marketplace. The marketplace is only inventory; the broker loop is the product.

## Hard Demo Gates

- Agent must be built through ClawUp.
- Telegram must work through the ClawUp agent.
- Agent must be registered on GOAT Network Mainnet with ERC-8004.
- Agent must appear on `https://8004scan.io/agents?chain=2345`.
- x402 must be real for the final paid execution demo; local mock settlement is only for development and tests.

## MVP Loop

```text
task/context
-> task analysis
-> context redaction
-> ranked capability recommendation
-> approval for paid/risky action
-> x402 payment requirement
-> verified settlement
-> capability execution
-> transaction and reputation update
```

## Local Safety Rules

- Never commit `.env`.
- Never store private keys, wallet mnemonics, bot tokens, merchant credentials, passwords, or API secrets.
- Keep real x402 credentials only in untracked `.env`.
- Do not create wallets, submit forms, mutate ClawUp, register mainnet identity, spend funds, or send external messages without explicit user approval.

## Related Files

- Implementation plan: `docs/hackathon/clawcompass/CODEX_IMPLEMENTATION_PLAN_CLAWCOMPASS.md`
- Durable memory: `memory.md`
- Work graph: `docs/codex/work/WORK-GRAPH.md`
- Structured tracker: `docs/codex/work/work-items.json`
- Demo script: `docs/hackathon/clawcompass/DEMO-SCRIPT.md`
