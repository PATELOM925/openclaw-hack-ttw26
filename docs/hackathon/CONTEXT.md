# Hackathon Context

## Event
OpenClaw Hack Toronto Students and Alumni, May 26, 2026, Toronto Metropolitan University. The mission is to build an AI agent that does more than talk: it should have identity, wallet/payment capability when useful, and verifiable behavior on GOAT Network.

## Source Links
- Project GitHub: https://github.com/PATELOM925/openclaw-hack-ttw26
- Luma event: https://luma.com/2bntw4vd
- Onboarding guide: https://docs.google.com/document/d/1y4NHtLq-M8RlOSJu4kAKXWRWxyPWPFolCWsW8mOgl20
- Workshop slides: https://docs.google.com/presentation/d/188AVJ7UFHjrHNsVKrM9a6z4qBU73zNQm
- Ideas doc: https://docs.google.com/document/d/1dCMSMunsiDpEwuaOwF5oZFK0Btgf_ZXuPcgsxWPobAY
- Judging scorecard: https://docs.google.com/document/d/1-E8kl9WOuTpLzkhvsN-fYSHo1oXr_UgbjnbwVm3hP8E
- Submission form: https://bit.ly/openclaw-hackathon-submission

## Schedule
| Time | Event |
|---|---|
| 10:00 AM | Doors open and welcome |
| 11:00 AM | Kickoff and logistics |
| 11:30 AM | Technical workshop: deploy agent on GOAT Mainnet |
| 1:00 PM | Hacking begins / AgentKit demo window |
| 5:00 PM | Submission prep and judge training |
| 5:45 PM | Submissions close |
| 6:00 PM | Judging starts; each team demos to assigned judge |
| 6:45 PM | Finalists selected and stage demos |
| 7:20 PM | Awards |
| 7:30 PM | Internship networking |
| 8:30 PM | Event ends |

## Hard Requirements
- Build the agent via ClawUp.
- Register the agent on GOAT Network Mainnet with ERC-8004.
- Verify the agent appears on `https://8004scan.io/agents?chain=2345`.
- Submit through the final form before 5:45 PM.
- Prepare a live 2-minute demo for the assigned judge.

## Judging Criteria
| Category | Weight | What Green Looks Like |
|---|---:|---|
| Market and earning potential | 35% | A real, urgent niche problem with a clear customer and monetization path. |
| Usability and self-disclosure | 20% | The bot states exactly what it does, how to use it, and required parameters. |
| x402 protocol integrity | 25% | If payments are used, the agent executes, verifies, settles, and explains failures cleanly. |
| Human-in-the-loop guardrails | 15% | Small tasks can be autonomous; high-risk or high-value actions require confirmation and have an abort path. |

## Support
- Telegram group: https://t.me/goatbuilderhub/1301
- Help tags: `@sd_zkp`, `@Kevin2030`, `@alicelliu`
- Gas request form: https://docs.google.com/forms/d/e/1FAIpQLSdiAvEIK8UqSOBaFqQFCDFGWQvwDgg7rNJ0Npyqy1Dd_apzoQ/viewform
- Stables request form for x402: https://docs.google.com/forms/d/e/1FAIpQLSeC81t5gdFUfdgVNd0qbgd2FL2lOuEnyuTjGwmrw3o_kmyLJQ/viewform

## Technical Resources
- ClawUp quickstart: https://docs.clawup.org/src/quick-start
- GOAT docs: https://docs.goat.network/
- GOAT AgentKit: https://github.com/GOATNetwork/agentkit
- GOAT Hackathon repo with skills: https://github.com/GOATNetwork/GOAT-Hackathon-2026
- Registered agents dashboard: https://8004scan.io/agents?chain=2345
- Hackathon dashboard: https://goat-hackathon-2026.vercel.app/
- x402 merchant portal: https://x402-merchant.goat.network/
- GOAT faucet for testnet tokens: https://bridge.testnet3.goat.network/faucet
- Agent demo example: https://github.com/julies-claw/goat-agent-demo

## Practical Priority
Build the demo around the judge tests. The agent must explain itself, show a real user workflow, prove ERC-8004 registration, and show x402 only if the selected idea needs payments.
