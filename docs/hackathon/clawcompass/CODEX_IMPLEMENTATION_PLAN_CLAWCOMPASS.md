# ClawCompass Brief-Driven Completion Plan

## Summary

- Source of truth: `/Users/shreyapatel/Projects/zzz project docs/GOAT Hack/CODEX_IMPLEMENTATION_BRIEF_CLAWCOMPASS.md`
- Brief read fully: 1,597 lines.
- Brief SHA-256: `224ca580d65e7bb3ddc5096ff5747487fd201c56151f8ca53a043149ceef01c0`
- Repo layout decision: keep the existing root TypeScript/Express app; do not create a nested `clawcompass/` app.
- MVP product rule: ClawCompass is a paid capability acquisition broker, not a static marketplace or directory.

## Local Completion Tasks

- Persist this plan and a compact source-of-truth summary for future agents.
- Keep `memory.md`, `docs/codex/work/WORK-GRAPH.md`, and `docs/codex/work/work-items.json` aligned.
- Add `/health`, `/api/approve/:transactionId`, and `/api/command`.
- Keep `/api/demo-settle/:transactionId` disabled unless `ENABLE_MOCK_X402=true`.
- Add `goatx402-sdk-server` and wrap it behind a payment adapter that can request real x402 orders when credentials and a payer wallet exist.
- Keep local mock x402 settlement clearly labeled as development-only.
- Expand sanitizer coverage for raw API keys, OAuth tokens, phone numbers, generic env secrets, wallet private keys, JWTs, database URLs, email addresses, and seed phrases.
- Keep budget filtering explicit: if affordable alternatives exist, exclude capabilities above budget.
- Support the risky GitHub/write demo halt with the expected approval language.
- Add command-format output for ClawUp/Telegram use.

## External Completion Tasks

These remain blocked until explicit user approval and required credentials/funds exist:

- Create the ClawUp agent named `clawcompass-broker`.
- Pair Telegram through BotFather and ClawUp.
- Create or connect the agent wallet without storing secrets.
- Request GOAT mainnet gas and USDC/USDT for the demo.
- Configure the GOAT x402 Merchant Portal with credentials only in untracked `.env`.
- Register ClawCompass on GOAT Mainnet ERC-8004.
- Verify ClawCompass appears on `https://8004scan.io/agents?chain=2345`.
- Record only public proof: wallet address, agent ID, tx hash, 8004scan URL, and x402 order/settlement evidence.

## Acceptance Criteria

- `/help` self-discloses what ClawCompass does and lists commands.
- `/ask` analyzes task/context, redacts secrets, and returns ranked recommendations.
- `/use PitchHawk` creates a paid execution quote and asks for approval.
- `APPROVE` or `/api/approve/:transactionId` creates an x402 payment requirement.
- Paid execution cannot run unless payment is verified or local mock mode has explicitly settled it.
- PitchHawk returns structured output after verified payment.
- Transactions and local reputation update after execution.
- Risky repo-write requests halt and require explicit approval.
- README/setup docs make external ClawUp, x402, wallet, and ERC-8004 blockers explicit.

## Verification

- Run `npm run validate`.
- Run `npm audit --audit-level=moderate`.
- Parse JSON files with `python3 -m json.tool`.
- Run a secret-pattern scan excluding dependency/build artifacts.
- Rehearse the 2-minute demo after external proof steps exist.

## Current Confidence

- Local-code path: high.
- Live demo readiness: blocked by external ClawUp, Telegram, wallet, merchant, x402 settlement, and ERC-8004 proof.
