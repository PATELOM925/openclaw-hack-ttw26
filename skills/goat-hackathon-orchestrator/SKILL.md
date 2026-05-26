---
name: goat-hackathon-orchestrator
description: Use when selecting a GOAT/OpenClaw hackathon idea, updating the local work graph, routing tasks to ClawUp, ERC-8004, x402, demo, or submission workflows, or deciding what the next project action should be.
---

# GOAT Hackathon Orchestrator

## Start Here
Read these files first:
- `memory.md`
- `docs/codex/work/WORK-GRAPH.md`
- `docs/hackathon/CONTEXT.md`
- `docs/hackathon/IDEA-INTAKE.md`

## Core Rule
Do not start app code until a chosen idea has a filled idea brief and at least one `ready` build task in the work graph.

## Routing
- Idea selection or scoring: use `docs/hackathon/IDEA-INTAKE.md` and `docs/templates/idea-brief.md`.
- ClawUp setup or Telegram pairing: use `skills/clawup-agent-build/SKILL.md`.
- GOAT Mainnet registration: use `skills/erc8004-mainnet-registration/SKILL.md`.
- x402 payment or merchant flow: use `skills/x402-payment-readiness/SKILL.md`.
- Demo or form prep: use `docs/hackathon/DEMO-SUBMISSION.md`.

## Work Graph Updates
Before meaningful work:
1. Find the lowest matching node in `docs/codex/work/WORK-GRAPH.md`.
2. If no node fits, add the smallest useful node.
3. Set status to `in_progress` only for work actively being handled.
4. Record owner surface, acceptance, verification, and next action.

After meaningful work:
1. Attach evidence or the exact blocker.
2. Move completed preparation nodes to `done`; leave idea-specific build nodes `backlog` until selected.
3. Mirror status changes in `docs/codex/work/work-items.json`.
4. Update `memory.md` when future agents need the fact.

## Idea Decision Gate
An idea can move forward only when it has:
- A specific user and problem.
- A reachable input or data source.
- An action the agent can perform.
- A 2-minute demo path.
- A reason GOAT identity, trust, settlement, or x402 matters.

## Stop Conditions
Stop and ask before generating wallets, using credentials, submitting forms, changing ClawUp settings, registering on-chain, spending funds, or sending external messages.
