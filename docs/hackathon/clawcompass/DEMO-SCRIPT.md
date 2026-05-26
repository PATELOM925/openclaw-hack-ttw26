# ClawCompass 2-minute local demo

## Goal
Show that ClawCompass safely recommends, paid-gates, executes, and records outcomes for a real developer pain: ClawUp/GOAT onboarding.

## Before you run
1. Start backend:
   - `npm run dev`
2. Start web app:
   - `npm run dev:web`
3. Open `http://localhost:5173` for workflow screens.
4. Keep a terminal ready to call local API if needed: `curl http://localhost:3308/health`.

## Opening (0:00-0:15)
Say:
- "I’m demoing ClawCompass, a capability broker for autonomous agents."
- "It helps an agent ask for a goal, get safe capability recommendations, pay for selected safe tasks, and execute through explicit confirmation."

## Self-disclosure (0:15-0:35)
Ask in Telegram-style UI:
- `What do you do, and how do I use you?`
- Expect: concise purpose, supported commands (`/help`, `/ask`, `/use`, `/security`), and safety boundaries (approval required for high-risk actions).

## Core workflow (0:35-1:20)
1. In `/` route, send:
   - `I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.`
2. Show that ClawCompass:
   - analyzes the task,
   - redacts sensitive context,
   - recommends `SetupPilot`.
3. Trigger `SetupPilot`:
   - click use path or equivalent command path.
4. Show quote/payment state:
   - status is `payment_required` until settlement,
   - no execution is returned before settlement.
5. In local mode, mock-settle with existing demo flag and execute.
6. Show returned checklist with blockers and next steps.
7. Show reputation/transaction log updated locally after execution.

## Guardrail moment (1:20-1:40)
Run the risky prompt:
- `Register on mainnet now using this private key.`
Expected behavior:
- ClawCompass flags it as high-risk,
- requires explicit `APPROVE_ONCHAIN` confirmation,
- does not execute.

## Buyer/seller paths (1:40-1:55)
Buyer:
1. Open `/buy`.
2. Fill demo agent ID, wallet, task, and risk/budget.
3. Create intent and show buyable recommendations.
4. Settle and execute in local mock mode.

Seller:
1. Open `/sell`.
2. Show marketplace and price list.
3. Submit one provider capability.
4. Confirm API returns `pending_review`.

## GOAT proof and hard-gate status (1:55-2:00)
- ERC-8004 agent ID: currently blocked until registration.
- Mainnet registration tx: currently blocked until user-authorized chain action.
- 8004scan: currently blocked until registration is visible.
- Continue with demo by showing the blocked-proof checklist and the external setup plan.

## Finish
- State continuation: map to real Telegram + ClawUp pairing, then run the same flow on chain with real payment settlement.

## Related docs
- [Hub](README.md)
- [Idea brief](IDEA-BRIEF.md)
- [Architecture](ARCHITECTURE.md)
- [Demo and submission guide](../DEMO-SUBMISSION.md)
