# OpenClaw Hackathon (TTW26)

## Event
- **Hackathon**: OpenClaw Hackathon (Toronto Tech Week)
- **Format**: Hackathon
- **Constraint**: Must use OpenClaw host's frameworks/tools to build the solution

## Team
| Name | Role |
|--------|--------|
| Om Patel | AI/ML Lead, Full-Stack |
| Awais | Data Engineering, Backend |
| Abhinav | Backend / Systems |
| Kumar Managalam | Role pending |

## Project
Selected idea: **ClawCompass**, a paid capability broker for autonomous agents.

ClawCompass lets a requesting agent describe its task and safe context, then analyzes which skill, MCP, hook, plugin, rule, or sub-agent is needed. It recommends and sequences the right capability, redacts sensitive context, charges per paid capability through x402, executes after verified payment, and records reputation.

## Planning Scaffold
- Project instructions: [`AGENTS.md`](AGENTS.md)
- Durable context: [`memory.md`](memory.md)
- Work graph: [`docs/codex/work/WORK-GRAPH.md`](docs/codex/work/WORK-GRAPH.md)
- Idea intake: [`docs/hackathon/IDEA-INTAKE.md`](docs/hackathon/IDEA-INTAKE.md)
- Build runbook: [`docs/hackathon/BUILD-RUNBOOK.md`](docs/hackathon/BUILD-RUNBOOK.md)
- Demo and submission guide: [`docs/hackathon/DEMO-SUBMISSION.md`](docs/hackathon/DEMO-SUBMISSION.md)
- ClawCompass hub: [`docs/hackathon/clawcompass/README.md`](docs/hackathon/clawcompass/README.md)

## Local Backend

```bash
npm install
npm run dev
```

The API listens on `http://localhost:3000` by default. Useful demo endpoints:

- `GET /health`
- `GET /api/help`
- `POST /api/ask`
- `GET /api/marketplace`
- `GET /api/tool/pitchhawk`
- `POST /api/use/pitchhawk`
- `POST /api/approve/:transactionId`
- `POST /api/execute/pitchhawk`
- `POST /api/command`
- `GET /api/security`
- `GET /api/transactions`
- `GET /api/reputation/pitchhawk`
- `GET /api/proof`
- `GET /api/payment/:transactionId/status`
- `POST /api/reputation/:id/write-onchain`

Local development can use `ENABLE_MOCK_X402=true` to unlock `/api/demo-settle/:transactionId`.
Keep it disabled for final demo evidence. Real paid execution uses the `goatx402-sdk-server`
adapter when merchant credentials and a payer wallet are available in untracked `.env`.

## Web App

```bash
npm run dev:web
```

The browser app runs through Vite, defaults to `http://localhost:5173`, and calls the API at
`http://localhost:3000`. Set `VITE_API_BASE_URL` if the API runs somewhere else.

Validation:

```bash
npm run validate
npm run build:web
npm audit --audit-level=moderate
```

Real ClawUp, wallet, x402 merchant, and ERC-8004 actions remain external gated steps. Put real credentials only in untracked `.env`, never in repo docs.

## Brief And Plan

- Source-of-truth brief: `/Users/shreyapatel/Projects/zzz project docs/GOAT Hack/CODEX_IMPLEMENTATION_BRIEF_CLAWCOMPASS.md`
- Saved implementation plan: [`docs/hackathon/clawcompass/CODEX_IMPLEMENTATION_PLAN_CLAWCOMPASS.md`](docs/hackathon/clawcompass/CODEX_IMPLEMENTATION_PLAN_CLAWCOMPASS.md)
- Source snapshot: [`docs/hackathon/clawcompass/SOURCE-OF-TRUTH.md`](docs/hackathon/clawcompass/SOURCE-OF-TRUTH.md)

## Action Items
- [ ] Review OpenClaw's required frameworks and documentation
- [x] Identify compatible project ideas within host constraints
- [ ] Finalize roles per team member
- [ ] Build and demo

## Tools
- OpenClaw host framework(s) (primary constraint)
- Claude Code Pro
- Cursor Pro
- Python / FastAPI
- Lovable (UI)

## Status
- [ ] Confirm attendance
- [x] Finalize project idea using the idea intake workflow
- [x] Build local MVP
- [x] Add full web app for broker workflow, proof, security, transactions, and reputation
- [ ] Complete external ClawUp, x402, wallet, and ERC-8004 proof
- [ ] Demo

## Next Steps
1. Create the ClawUp agent and Telegram pairing after explicit user action
2. Configure wallet, x402 merchant, and ERC-8004 registration after explicit user action
3. Rehearse and submit the 2-minute demo with public proof visible
