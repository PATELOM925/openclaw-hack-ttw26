# Demo Script

## Opening
`<agent-name>` helps `<specific-user>` solve `<specific-problem>` by `<agent-action>`.

## Self-Disclosure Prompt
User: What do you do, and how do I use you?

Expected agent response:
`<clear purpose, commands, required inputs, and limits>`

## Core Workflow
1. User sends: `<demo prompt>`
2. Agent asks for any missing safe input.
3. Agent performs: `<main action>`
4. Agent returns: `<visible outcome>`

## Guardrail Moment
User requests: `<risky action>`

Expected agent response:
`<asks for confirmation, explains risk, offers cancel path>`

## GOAT Proof
- ERC-8004 agent ID: `<agent-id>`
- Mainnet registration transaction: `<transaction-hash>`
- 8004scan URL: `<agent-listing-url>`

## x402 Proof
Use only if the project includes payments:
- Payment mode: `<DIRECT-or-DELEGATE>`
- Order or transaction evidence: `<public-proof>`
- Failure handling shown: `<network-timeout-or-insufficient-funds-response>`

## Close
After the hackathon, the next step is `<continuation-plan>`.
