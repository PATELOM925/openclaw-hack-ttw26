# GOAT Hackathon Work Graph

## Root
`GOAL-000` Prepare idea-agnostic hackathon base  
Status: `done`  
Done when: event context, idea workflow, build runbooks, local skills, templates, and validation evidence exist.  
Stop when: a task requires external account action, a secret, a wallet operation, a form submission, or app code before the idea is chosen.

## Top-Down Graph
```mermaid
flowchart TD
  GOAL["GOAL-000 Prepare idea-agnostic hackathon base"]
  E100["EPIC-100 Event constraints and judging gates"]
  E200["EPIC-200 Idea intake and selection workflow"]
  E300["EPIC-300 ClawUp and GOAT build runbooks"]
  E400["EPIC-400 ERC-8004 mainnet registration path"]
  E500["EPIC-500 x402 readiness path"]
  E600["EPIC-600 Demo and submission readiness"]
  E700["EPIC-700 ClawCompass MVP framework"]
  GOAL --> E100 --> T110["TASK-110 Context doc"]
  GOAL --> E200 --> T210["TASK-210 Idea intake doc"]
  GOAL --> E300 --> T310["TASK-310 Build runbook"]
  GOAL --> E400 --> T410["TASK-410 Registration guidance"]
  GOAL --> E500 --> T510["TASK-510 Payment readiness guidance"]
  GOAL --> E600 --> T610["TASK-610 Demo and submission doc"]
  GOAL --> E700 --> T710["TASK-710 Accepted idea brief"]
  E700 --> T720["TASK-720 API framework"]
  E700 --> T730["TASK-730 Safety and payment loop"]
  E700 --> T740["TASK-740 ClawUp/GOAT setup docs"]
```

## Node Register
| ID | Kind | Status | Owner Surface | Acceptance | Verification | Next Action |
|---|---|---|---|---|---|---|
| GOAL-000 | goal | done | `docs/`, `skills/`, `memory.md` | Future agent can continue after idea selection. | Validate docs, JSON, skills, secrets, and file sizes. | Select idea. |
| EPIC-100 | epic | done | `docs/hackathon/CONTEXT.md` | Event rules and judging gates are captured with source links. | Review context doc against source list. | Use during demo planning. |
| TASK-110 | task | done | `docs/hackathon/CONTEXT.md` | Schedule, links, support contacts, gates, and scorecard summary exist. | Markdown scan and source link review. | Keep updated if event guidance changes. |
| EPIC-200 | epic | done | `docs/hackathon/IDEA-INTAKE.md` | Idea can be evaluated before app work starts. | Intake fields cover problem, market, gap, data, GOAT fit. | Fill idea brief. |
| TASK-210 | task | done | `docs/templates/idea-brief.md` | Template produces a sharp, buildable idea brief. | Manual review against judging criteria. | Choose one candidate idea. |
| EPIC-300 | epic | done | `docs/hackathon/BUILD-RUNBOOK.md` | ClawUp build path is documented without secrets. | Runbook lists non-mutating setup checks and external actions. | Create ClawUp agent after idea selection. |
| TASK-310 | task | done | `skills/clawup-agent-build/SKILL.md` | Future agent knows when to use ClawUp flow. | Skill validator and frontmatter scan. | Use during ClawUp setup. |
| EPIC-400 | epic | done | `skills/erc8004-mainnet-registration/SKILL.md` | Registration workflow separates planning from on-chain action. | Secret scan and skill validation. | Register only after explicit approval. |
| TASK-410 | task | done | `docs/templates/agent-registration.json` | Metadata template avoids secrets and supports 8004scan verification. | JSON validity check. | Fill public metadata. |
| EPIC-500 | epic | done | `skills/x402-payment-readiness/SKILL.md` | x402 is routed only when the idea transacts or monetizes. | Review DIRECT/DELEGATE decision criteria. | Decide payment scope after idea selection. |
| TASK-510 | task | backlog | app code | x402 flow is implemented and demoable if selected. | Live payment or controlled test evidence. | Wait for idea. |
| EPIC-600 | epic | done | `docs/hackathon/DEMO-SUBMISSION.md` | 2-minute demo and final checklist are available. | Manual read-through against scorecard. | Rehearse after build. |
| TASK-610 | task | done | `docs/templates/demo-script.md` | Demo script fits the judging flow. | Time-boxed dry run after agent exists. | Fill script after build. |
| EPIC-700 | epic | done | `docs/ideas/`, `clawcompass/apps/api/`, `docs/hackathon/` | ClawCompass has a runnable local API framework and non-secret setup docs. | `npm test`, `npm run typecheck`, `npm run build`, JSON validation, npm audit. | Wire ClawUp/Telegram after secrets and explicit external-action approval. |
| TASK-710 | task | done | `docs/ideas/clawcompass-idea-brief.md` | ClawCompass is selected with problem, user, demo path, GOAT fit, and risks. | Manual review against idea intake rubric. | Use brief for build and demo copy. |
| TASK-720 | task | done | `clawcompass/apps/api/` | API exposes health, marketplace, ask, security, use, execute, transactions, and reputation endpoints. | 11 Vitest tests pass; TypeScript typecheck and build pass. | Start local API when ready for ClawUp wiring. |
| TASK-730 | task | done | `clawcompass/apps/api/src/services/` | Redaction, guardrails, x402-gated execution, transaction states, and reputation updates exist. | Tests cover redaction, unpaid blocking, mock verified execution, reputation, and high-risk halt. | Replace mock x402 with real credentials when supplied. |
| TASK-740 | task | done | `docs/hackathon/clawcompass-setup.md`, `.env.example` | Docs explain later ClawUp, Telegram, ERC-8004, and x402 setup without storing secrets. | Manual review, npm audit, and no committed real secret values. | Fill public evidence after ClawUp/GOAT setup. |
| TASK-750 | task | done | `docs/hackathon/clawcompass-readiness-review.md` | Build is evaluated against implementation brief, judging scorecard, onboarding guide, and ideas guidance. | Local tests, live API walkthrough, PDF review, and readiness gap list. | Execute external ClawUp, ERC-8004, and real x402 gates. |
| TASK-760 | task | done | `clawcompass/apps/api/`, `docs/clawup-skills/`, `docs/ideas/` | SetupPilot is the primary demo capability and custom ClawUp usage skills are specified. | Tests cover onboarding classification, ranking, redaction, gated execution, and on-chain approval halt. | Add skills to ClawUp and verify Telegram demo. |

## Status Notes
- Required preparation nodes are `done`.
- ClawCompass is the selected idea.
- ClawCompass framework tasks are `done`.
- External actions are intentionally not performed in this scaffold.

## ClawCompass Evidence
Validated on 2026-05-27:
- `npm test` in `clawcompass/apps/api`: 2 test files, 18 tests passed.
- `npm run typecheck` in `clawcompass/apps/api`: passed.
- `npm run build` in `clawcompass/apps/api`: passed.
- `npm audit` in `clawcompass/apps/api`: 0 vulnerabilities after updating Vitest.
- `python3 -m json.tool docs/codex/work/work-items.json` passed.
- Earlier built server smoke check on port 3307 returned `/health` ok and the then-current 6 marketplace capabilities; SetupPilot later expands the seed set to 7.
- Readiness review added at `docs/hackathon/clawcompass-readiness-review.md` after checking event PDFs and running a judge-like local API walkthrough.
- SetupPilot added as primary demo capability with custom skill specs under `docs/clawup-skills/`.
- Live SetupPilot smoke check on port 3309 returned onboarding classification, `setuppilot` top recommendation, setup diagnosis, and `APPROVE_ONCHAIN` halt.

## Validation Evidence
Validated on 2026-05-26:
- `python3 -m json.tool docs/codex/work/work-items.json`
- `python3 -m json.tool docs/templates/agent-registration.json`
- Unresolved marker scan returned no matches.
- Secret-pattern scan returned no matches.
- `find AGENTS.md memory.md docs skills -type f -name '*.md' -exec wc -l {} +` showed all authored Markdown files under 300 lines.
- `quick_validate.py` reported all four local skills valid.
