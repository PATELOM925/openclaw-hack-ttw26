# Project Memory

## Summary
This workspace is the GOAT/OpenClaw Toronto hackathon repo for ClawCompass, a capability broker for AI agents. The project started as an idea-agnostic scaffold and moved to the selected ClawCompass idea on 2026-05-27.

## Durable Facts
- Workspace: `/Users/shreyapatel/Projects/GOAT Hack`
- GitHub remote: https://github.com/PATELOM925/openclaw-hack-ttw26
- Current project state: ClawCompass selected; local TypeScript/Express framework is being added under `clawcompass/apps/api`.
- Primary demo direction: SetupPilot, a paid ClawUp/GOAT onboarding diagnosis capability for Telegram pairing, ERC-8004, x402, and submission readiness.
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
- Secrets, keys, public addresses, merchant IDs, and registration evidence will be supplied later and must remain outside tracked files unless explicitly public.

## Last Validation
On 2026-05-27, the ClawCompass framework validated cleanly:
- `npm test` in `clawcompass/apps/api`: 2 test files, 18 tests passed after SetupPilot addition.
- `npm run typecheck` in `clawcompass/apps/api`: passed.
- `npm run build` in `clawcompass/apps/api`: passed.
- `npm audit` in `clawcompass/apps/api`: 0 vulnerabilities.
- `python3 -m json.tool docs/codex/work/work-items.json`: passed.
- Earlier built server smoke check on port 3307 returned `/health` ok and the then-current 6 marketplace capabilities; SetupPilot later expands the seed set to 7.
- SetupPilot added as the primary demo capability on 2026-05-27.
- Live SetupPilot smoke check on port 3309 returned onboarding classification, `setuppilot` top recommendation, setup diagnosis, and `APPROVE_ONCHAIN` halt.

Earlier scaffold validation on 2026-05-26:
- Work graph JSON and registration metadata JSON parsed.
- No unresolved marker strings were found.
- No secret-like patterns were found.
- All authored Markdown files were under 300 lines.
- All four local project skills passed the skill validator.

## Next Action
Finish the ClawCompass API framework, then wire ClawUp/Telegram and real GOAT/x402 credentials only after explicit user instruction.
