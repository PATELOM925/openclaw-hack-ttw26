---
name: x402-payment-readiness
description: Use when deciding whether a GOAT hackathon idea needs x402, choosing DIRECT versus DELEGATE mode, preparing merchant prerequisites, validating payment demo evidence, or handling x402 submission risks.
---

# x402 Payment Readiness

## Required Context
Read:
- `docs/hackathon/CONTEXT.md`
- `docs/hackathon/BUILD-RUNBOOK.md`
- `docs/hackathon/DEMO-SUBMISSION.md`

## Inclusion Rule
Use x402 only when the selected idea has payment, paid access, monetization, settlement, or agent-to-agent commerce. Do not add x402 as decoration.

## Mode Choice
| Mode | Use When | Demo Risk |
|---|---|---|
| DIRECT | Simple low-value payment, payment-gated access, fast hackathon demo | Lower complexity, weaker binding |
| DELEGATE | Stronger authorization, callbacks, production-like settlement | More setup and failure points |

Default to DIRECT for a short demo unless the idea specifically needs DELEGATE behavior.

## Merchant Readiness
Before building payment flow, confirm:
- Merchant account or invite path exists.
- Receiving wallet address is known.
- Token choice is known, usually USDC or USDT.
- Fee balance or event support is available.
- API key and API secret are held outside repo files.
- The agent can explain payment status and failures to the user.

## Demo Requirements
The x402 portion is judge-ready only when the agent can:
- Create or request a payment.
- Show the payer, receiver, token, amount, and status.
- Verify settlement or a controlled failure.
- Explain network errors, insufficient funds, or timeout without crashing.
- Ask for confirmation before high-value or risky actions.

## Safety
- Never store merchant credentials, payment credentials, wallet secrets, or user payment details in docs.
- Do not trigger real-value payments without explicit user approval.
- Keep demo amounts minimal.

## Work Graph
If x402 is selected, create idea-specific tasks under `EPIC-500` and move them from `backlog` to `ready` only after the idea brief defines the payment use case.
