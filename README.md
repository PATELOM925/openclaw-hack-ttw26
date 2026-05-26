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
Selected idea: **ClawCompass**, a capability broker that helps AI agents discover, pay for, and safely execute trusted capabilities from a managed marketplace of skills, MCPs, hooks, plugins, rules, and sub-agents. The primary demo capability is **ClawUp SetupPilot**, focused on the real onboarding pain around ClawUp, Telegram pairing, ERC-8004, x402, and submission proof.

Strategy: build the local ClawCompass framework, wire it through ClawUp/Telegram, register the agent on GOAT Mainnet with ERC-8004, and use x402 for paid capability execution.

## Planning Scaffold
- Project instructions: [`AGENTS.md`](AGENTS.md)
- Durable context: [`memory.md`](memory.md)
- Work graph: [`docs/codex/work/WORK-GRAPH.md`](docs/codex/work/WORK-GRAPH.md)
- Idea intake: [`docs/hackathon/IDEA-INTAKE.md`](docs/hackathon/IDEA-INTAKE.md)
- Build runbook: [`docs/hackathon/BUILD-RUNBOOK.md`](docs/hackathon/BUILD-RUNBOOK.md)
- Demo and submission guide: [`docs/hackathon/DEMO-SUBMISSION.md`](docs/hackathon/DEMO-SUBMISSION.md)
- ClawCompass idea brief: [`docs/ideas/clawcompass-idea-brief.md`](docs/ideas/clawcompass-idea-brief.md)
- ClawCompass setup: [`docs/hackathon/clawcompass-setup.md`](docs/hackathon/clawcompass-setup.md)
- Local API: [`clawcompass/`](clawcompass/)

## Action Items
- [ ] Review OpenClaw's required frameworks and documentation
- [x] Identify compatible project idea within host constraints
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
- [ ] Build MVP
- [ ] Demo

## Next Steps
1. Fill an idea brief from `docs/templates/idea-brief.md`
2. Update the work graph with idea-specific build tasks
3. Create the ClawUp agent and Telegram pairing
4. Build and demo within time limit
