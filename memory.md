# Project Memory

## Summary
This workspace is now building ClawCompass for the GOAT/OpenClaw Toronto hackathon on May 26, 2026. ClawCompass is a paid capability broker for autonomous agents.

## Durable Facts
- Workspace: `/Users/shreyapatel/Projects/GOAT Hack`
- GitHub remote: https://github.com/PATELOM925/openclaw-hack-ttw26
- Current project state: selected ClawCompass idea with implementation in progress.
- Selected idea: ClawCompass, a capability acquisition layer that analyzes agent tasks, redacts context, recommends capabilities, buys safe paid tools through x402, sells marketplace capabilities, and logs reputation.
- Primary demo capability: ClawUp SetupPilot, a paid onboarding diagnosis for ClawUp, Telegram pairing, ERC-8004, x402, wallet readiness, and submission proof.
- Full product target: local API plus full Vite React web app, with ClawUp/Telegram remaining the required hackathon channel.
- Local web app routes: `/`, `/buy`, `/sell`, `/transactions`, `/reputation`, `/security`, and `/proof`.
- Buyer surface: `POST /api/buy` and `/buy` let another agent submit task/context/budget/risk, receive buyable recommendations, create a payment-bound purchase intent, settle locally in demo mode, and execute.
- Seller surface: `GET /api/marketplace`, `POST /api/use/:id`, `POST /api/register-tool`, and `/sell` expose listed paid capabilities and provider submissions.
- Backend now exposes proof, payment status, and pending ERC-8004 write-state APIs for the web app.
- The `om` branch is integrated onto the root `origin/development` app rather than the removed nested `clawcompass/apps/api` scaffold.
- Source-of-truth implementation brief: `/Users/shreyapatel/Projects/zzz project docs/GOAT Hack/CODEX_IMPLEMENTATION_BRIEF_CLAWCOMPASS.md`
- Brief SHA-256: `224ca580d65e7bb3ddc5096ff5747487fd201c56151f8ca53a043149ceef01c0`
- Saved local implementation plan: `docs/hackathon/clawcompass/CODEX_IMPLEMENTATION_PLAN_CLAWCOMPASS.md`
- Saved source snapshot: `docs/hackathon/clawcompass/SOURCE-OF-TRUTH.md`
- Event path: choose a real problem, build a ClawUp agent, register it on GOAT Mainnet through ERC-8004, and prepare a 2-minute live demo.
- Main prize hard gates: ClawUp-built agent, ERC-8004 mainnet registration, listing on `8004scan`.
- Judging emphasis: market and earning potential, usability and self-disclosure, x402 integrity when used, human-in-the-loop guardrails, and post-hackathon continuation.

## Source Links
- Luma event: https://luma.com/2bntw4vd
- Onboarding guide: https://docs.google.com/document/d/1y4NHtLq-M8RlOSJu4kAKXWRWxyPWPFolCWsW8mOgl20
- Workshop slides: https://docs.google.com/presentation/d/188AVJ7UFHjrHNsVKrM9a6z4qBU73zNQm
- Ideas doc: https://docs.google.com/document/d/1dCMSMunsiDpEwuaOwF5oZFK0Btgf_ZXuPcgsxWPobAY
- Judging scorecard: https://docs.google.com/document/d/1-E8kl9WOuTpLzkhvsN-fYSHo1oXr_UgbjnbwVm3hP8E
- ClawUp quickstart: https://docs.clawup.org/src/quick-start
- GOAT docs: https://docs.goat.network/
- GOAT Hackathon repo: https://github.com/GOATNetwork/GOAT-Hackathon-2026

## Current Blockers
- No ClawUp agent, Telegram bot, wallet, gas tokens, stable tokens, merchant account, or ERC-8004 registration has been created from this workspace.
- Git is initialized and connected to the project GitHub remote.

## Last Validation
On 2026-05-26, `om` was integrated onto the root `origin/development` app:
- `npm run validate` passed with 31 tests after merging `origin/om` with the buyer/seller branch.
- `npm run build:web` passed.
- `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- Route and browser smoke proved onboarding analysis, `setuppilot` top recommendation, x402 payment-required quote, mock-local settlement, SetupPilot execution, buyer flow, seller submission, and delivered transaction.
- The old nested `clawcompass/apps/api` scaffold was removed; use the root app for backend, web, command, and payment-proof work.

On 2026-05-27, `/Users/om-college/Downloads/ClawUp ENV.docx` was parsed into ignored local `.env` only. The setup provides ClawUp agent name, Telegram bot username/token, wallet/runtime fields, merchant credentials, and public status fields without committing secret values. Runtime proof status now reports ClawUp and Telegram as ready, while x402 and ERC-8004 remain partial until the real x402 API URL/payment proof and ERC-8004 agent ID are confirmed.

On 2026-05-26, ClawCompass local validation passed:
- `npm run validate` passed with 19 tests.
- `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- Work graph, registration metadata, and capability seed JSON parsed.
- Secret scan, excluding the sanitizer regex definition, returned no matches.
- Local route check proved `/health`, `/api/help`, `/api/ask`, redaction, approval, unpaid 402 block, local-only mock settlement, PitchHawk execution, `/api/security`, `/api/command`, and `/api/reputation/pitchhawk`.

On 2026-05-26, the GOAL-200 implementation added:
- LLM-first task analysis with deterministic fallback when `ANTHROPIC_API_KEY` is unavailable.
- Autonomous low-risk paid x402 quote creation within the `0.10 USDC` cap.
- Replay/binding checks for mock settlement proof.
- Pending external-proof fields for ERC-8004 reputation writes.
- Vite React web app for broker workflow, capabilities, transactions, reputation, security, and proof status.
- Explicit buyer and seller surfaces: `/buy` for agent purchases and `/sell` for marketplace/provider flows.
- SetupPilot onboarding classification, ranking, payment-gated execution, command usage, and web defaults were merged into the root app on 2026-05-26.

On 2026-05-26, buyer/seller validation passed:
- `npm run validate` passed with 26 tests.
- `npm run build:web` passed.
- Browser QA completed `/buy` create intent, mock settle, execute bought tool, and `/sell` provider submission with no console errors.

## Next Action
Next external actions, only after explicit user approval: create the ClawUp agent, pair Telegram, create or connect wallet, fund gas/stables, configure x402 Merchant Portal, register ERC-8004 identity, and record public proof.
