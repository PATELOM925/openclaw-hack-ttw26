# Build Runbook

## Build Sequence
1. Select the idea and write the idea brief.
2. Create the agent in ClawUp.
3. Create a Telegram bot with BotFather and connect it to ClawUp.
4. Add project-specific skills to the ClawUp agent.
5. Create or connect a wallet only after explicit user approval.
6. Request mainnet gas tokens for deployment.
7. If the idea needs payments, request stables and prepare x402.
8. Register the agent on GOAT Mainnet with ERC-8004.
9. Verify listing on `https://8004scan.io/agents?chain=2345`.
10. Rehearse the 2-minute demo.

## ClawUp Setup
- Use the ClawUp quickstart: https://docs.clawup.org/src/quick-start
- Under Create New Agent, fill the agent details once the idea is selected.
- Create a Telegram bot through `@BotFather`.
- Paste the Telegram bot token into ClawUp only inside the ClawUp UI.
- Message the Telegram bot and copy the pairing approval command it returns.
- In ClawUp, open the agent chat and paste the pairing approval command.
- Confirm Telegram messages reach the agent.

## Skills To Add In ClawUp
Use the GOAT Hackathon repo as reference material when asking the ClawUp agent to create its own skills:
- https://github.com/GOATNetwork/GOAT-Hackathon-2026
- https://github.com/julies-claw/goat-agent-demo

The ClawUp skills should cover:
- GOAT Network mainnet development.
- ERC-8004 agent identity registration and verification.
- x402 merchant or payment flows if the idea uses payments.
- The selected idea's user-facing workflow.

## Wallet And Funding
- Do not put private keys, bot tokens, merchant credentials, or recovery phrases in this repo.
- Wallet creation must be done only when the user asks.
- Request gas tokens through the event form for mainnet deployment.
- Request USDC or USDT stables only if x402 is part of the selected idea.
- Store only public wallet address, agent ID, transaction hash, and dashboard URL in docs.

## ERC-8004 Mainnet
- Network: GOAT Mainnet.
- Chain ID: `2345`.
- Registration proof: agent visible at `https://8004scan.io/agents?chain=2345`.
- Use `docs/templates/agent-registration.json` as the public metadata starting point.
- Keep Agent URI metadata minimal and public-safe.

## x402
Use x402 only if it improves the idea. DIRECT mode is better for simple low-value demos. DELEGATE mode is better for stronger binding, settlement workflows, or callback needs.

## Pre-Demo Checks
- Telegram bot responds.
- Agent explains what it does and how to use it.
- Agent refuses or pauses high-risk actions until user confirmation.
- ERC-8004 mainnet registration can be shown.
- x402 payment flow can be shown if included.
