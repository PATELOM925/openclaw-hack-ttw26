---
name: clawup-agent-build
description: Use when creating, configuring, pairing, or troubleshooting a ClawUp/OpenClaw hackathon agent, especially when the agent must work through Telegram and remain eligible for GOAT hackathon submission.
---

# ClawUp Agent Build

## Required Context
Read:
- `docs/hackathon/BUILD-RUNBOOK.md`
- `docs/hackathon/CONTEXT.md`
- `docs/codex/work/WORK-GRAPH.md`

## Build Contract
The submitted agent must be built through ClawUp. Do not replace ClawUp with a standalone local app unless the user explicitly changes the project direction.

## Setup Flow
1. Confirm the idea brief exists.
2. Create the ClawUp agent in the ClawUp UI.
3. Create a Telegram bot through `@BotFather`.
4. Paste the Telegram bot token only into ClawUp.
5. Send the first message to the Telegram bot.
6. Copy the pairing approval command returned by Telegram.
7. Paste the pairing command into the ClawUp agent chat.
8. Confirm Telegram messages reach the ClawUp agent.

## Skill Creation In ClawUp
Use these public repos as reference context when asking the ClawUp agent to create project skills:
- https://github.com/GOATNetwork/GOAT-Hackathon-2026
- https://github.com/julies-claw/goat-agent-demo

The ClawUp agent should gain skills for:
- The selected idea's user workflow.
- GOAT Mainnet and ERC-8004.
- x402 only when the idea transacts or monetizes.
- Demo self-disclosure and guardrails.

## Safety
- Never paste bot tokens, wallet secrets, merchant credentials, or account passwords into this repo.
- Do not submit forms or create wallets without explicit user instruction.
- Record only non-secret evidence such as public agent name, public wallet address, agent ID, transaction hash, and dashboard URL.

## Verification
The ClawUp path is ready when:
- Telegram bot responds through the ClawUp agent.
- The agent can answer what it does and how to use it.
- The graph has a node for any remaining build work.
