---
name: erc8004-mainnet-registration
description: Use when planning, preparing, performing, or verifying GOAT Network Mainnet ERC-8004 agent registration, Agent URI metadata, registration evidence, or 8004scan submission readiness.
---

# ERC-8004 Mainnet Registration

## Required Context
Read:
- `docs/hackathon/BUILD-RUNBOOK.md`
- `docs/templates/agent-registration.json`
- `docs/hackathon/DEMO-SUBMISSION.md`

## Eligibility Rule
The project is not main-prize ready until the agent is registered on GOAT Network Mainnet and visible on `https://8004scan.io/agents?chain=2345`.

## Mainnet Facts
- Chain: GOAT Mainnet
- Chain ID: `2345`
- Registered agents dashboard: `https://8004scan.io/agents?chain=2345`
- GOAT docs: `https://docs.goat.network/`

## Preparation
1. Confirm the ClawUp agent exists and has a final public name.
2. Fill only public fields in `docs/templates/agent-registration.json`.
3. Keep metadata concise because Agent URI size affects cost when stored on-chain.
4. Confirm the wallet has enough gas.
5. Confirm the user explicitly approves the on-chain registration step.

## Evidence To Record
Record only public evidence:
- Public wallet address.
- Agent name.
- ERC-8004 agent ID.
- GOAT Mainnet transaction hash.
- 8004scan URL.
- Public metadata URI or data URI if used.

## Safety
- Do not store private keys, seed phrases, wallet files, API keys, or account credentials in project files.
- Do not perform mainnet actions from an ambiguous wallet or without explicit approval.
- Do not guess missing metadata; ask for the public name and description if not known.

## Verification
Registration is verified only when:
- The transaction is confirmed on GOAT Mainnet.
- `8004scan` lists the agent on chain `2345`.
- `docs/templates/submission-checklist.md` or a project status note records the public proof.
