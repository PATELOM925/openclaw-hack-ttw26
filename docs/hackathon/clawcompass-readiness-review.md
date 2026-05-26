# ClawCompass Readiness Review

Date: 2026-05-27

## Sources Checked
- `/Users/om-college/Downloads/CODEX_IMPLEMENTATION_BRIEF_CLAWCOMPASS.md`
- `/Users/om-college/Downloads/Open Claw Hack Toronto - judging criteria.pdf`
- `/Users/om-college/Downloads/OpenClaw Hack Ideas Mar 2026.pdf`
- `/Users/om-college/Downloads/GOAT Toronto Hackathon Onboarding Guide - May 2026.pdf`
- Local docs in `docs/hackathon/`, `docs/codex/work/`, and `docs/ideas/`
- Local root TypeScript/Express API and Vite web app

## Current Build Evidence
- `npm run validate`: root TypeScript build and API tests passed after the merge.
- `npm run build:web`: root Vite web app build passed after the merge.
- `npm run build`: passed.
- `npm audit`: 0 vulnerabilities.
- JSON validation passed for work graph, registration template, and capability seed data.
- Live local API walkthrough on port 3308:
  - `/api/help` self-disclosed ClawCompass and commands.
  - `/api/ask` recommends `setuppilot` for ClawUp onboarding work and `pitchhawk` for homepage/pitch work.
  - Secret-like context was redacted.
  - `/api/use/setuppilot` created a 0.10 USDC payment-required transaction.
  - Unpaid `/api/execute/setuppilot` returned payment required.
  - Mock-local settled execution returned SetupPilot output and a success reputation event.
  - GitHub repo-write prompt recommended `githubhelper` and required `APPROVE_WRITE`.
- Live SetupPilot walkthrough on port 3309:
  - onboarding prompt classified as `onboarding`.
  - top recommendation was `setuppilot`.
  - mock-local paid execution returned `telegram_pairing` diagnosis and public evidence checklist.
  - risky mainnet/private-key prompt required `APPROVE_ONCHAIN`.

## Judging Readiness
| Gate / Category | Current Status | Evidence | Remaining |
|---|---|---|---|
| Mandatory gate: ClawUp-built agent | Not ready | Local API exists; ClawUp setup doc exists. | Create `clawcompass-broker` in ClawUp, pair Telegram, and map commands to API. |
| Mandatory gate: ERC-8004 mainnet registration | Not ready | Registry details and setup boundaries documented. | Agent-created wallet, gas request, registration, 8004scan listing proof. |
| Mandatory gate: post-hackathon continuation | Partially ready | Idea brief and README explain capability-broker direction. | Add crisp continuation plan for provider listings, revenue split, and on-chain reputation. |
| Market & earning potential, max 16 | Green candidate after SetupPilot | Clear buyer: AI agent builders/operators; first lived pain is ClawUp/GOAT onboarding; pricing: 0.10 USDC per paid setup diagnosis. | Demonstrate the actual onboarding blocker in Telegram and state paid provider marketplace continuation. |
| Usability & self-disclosure, max 8 | Green locally | `/api/help` states purpose, commands, inputs, and limits. | Ensure same wording appears in ClawUp/Telegram, not just local API. |
| x402 protocol integrity, max 10 | Red/yellow until real payment | Local architecture enforces no verified payment, no execution; real middleware adapter exists. | Merchant portal approval, real credentials, stables, real payment test, timeout/error proof. |
| Human-in-the-loop guardrails, max 6 | Green locally | High-risk GitHub write prompts `APPROVE_WRITE`; wallet actions require approval; cancel path documented. | Demonstrate through Telegram and add a maximum-spend prompt test. |
| Internship signal | Stronger candidate | Custom TypeScript services, payment state machine, redaction, tests, and custom ClawUp skill specs for product usage plus SetupPilot. | Add the skills into ClawUp and show real async x402 error handling evidence. |

## Remaining Work, Ordered By Prize Risk
1. Create and verify ClawUp agent plus Telegram pairing.
2. Map Telegram commands to the local API behavior: `/help`, `/ask`, `/marketplace`, `/tool`, `/use`, `/security`, `/transactions`, `/reputation`.
3. Create agent wallet through the approved ClawUp flow; do not commit or print private key in repo.
4. Request GOAT mainnet gas and x402 stables using the event forms.
5. Register ClawCompass on GOAT Mainnet ERC-8004 and verify it appears on `https://8004scan.io/agents?chain=2345`.
6. Register/approve x402 merchant setup and load credentials only through runtime environment or ClawUp secrets.
7. Run one real x402 payment test with amount, token, payer, receiver, merchant ID, payment status, and transaction hash captured.
8. Replace or wrap mock-local x402 in the demo path so final judging cannot hit a fake payment success.
9. Write final two-minute demo script with SetupPilot-first Telegram prompts and proof windows.
10. Add a one-paragraph continuation plan focused on paid onboarding/capability providers, routing fee, and portable reputation.

## Win-Critical Positioning
Lead with the broker, not the marketplace.

Best one-liner:
ClawCompass is the payment, routing, and trust layer that helps one AI agent safely buy and use another agent capability, starting with the painful ClawUp/GOAT onboarding flow every hackathon builder faces.

Avoid saying:
- generic MCP marketplace
- app store for agents
- trustless tool execution
- fake x402 demo

Say instead:
- capability broker
- context-safe routing
- verified x402-paid execution
- portable ERC-8004 identity and reputation
- explicit approval for high-risk actions

## Demo Skeleton
1. Ask: "What do you do?"
2. Run: `/ask I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.`
3. Show: task analysis, SetupPilot recommendation, and secret-redaction policy.
4. Run: `/use SetupPilot`
5. Show: x402 payment required; no payment means no execution.
6. Approve and run real x402 payment.
7. Show: payment verified, SetupPilot diagnosis, next action, public evidence checklist, and reputation update.
8. Run: `/ask Register on mainnet now using this private key.`
9. Show: `APPROVE_ONCHAIN` halt.
10. Show: 8004scan listing and state continuation plan.
