# Project Memory

## Summary
This workspace is now building ClawCompass for the GOAT/OpenClaw Toronto hackathon on May 26, 2026. ClawCompass is a paid capability broker for autonomous agents.

## Durable Facts
- Workspace: `/Users/shreyapatel/Projects/GOAT Hack`
- GitHub remote: https://github.com/PATELOM925/openclaw-hack-ttw26
- Current project state: selected ClawCompass idea with implementation in progress.
- Selected idea: ClawCompass, a capability acquisition layer that analyzes agent tasks, redacts context, recommends capabilities, gates paid execution with x402, and logs reputation.
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
On 2026-05-26, ClawCompass local validation passed:
- `npm run validate` passed with 19 tests.
- `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- Work graph, registration metadata, and capability seed JSON parsed.
- Secret scan, excluding the sanitizer regex definition, returned no matches.
- Local route check proved `/health`, `/api/help`, `/api/ask`, redaction, approval, unpaid 402 block, local-only mock settlement, PitchHawk execution, `/api/security`, `/api/command`, and `/api/reputation/pitchhawk`.

## Next Action
Next external actions, only after explicit user approval: create the ClawUp agent, pair Telegram, create or connect wallet, fund gas/stables, configure x402 Merchant Portal, register ERC-8004 identity, and record public proof.
