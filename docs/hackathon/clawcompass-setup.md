# ClawCompass Setup

## Local Framework
The local API lives at the repository root. It supports the broker loop that the ClawUp agent can call:

```text
ask -> recommend -> redact -> request payment -> execute -> reputation
```

Run locally:

```bash
npm install
npm run dev
```

Smoke check:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/marketplace
```

## Runtime Configuration
Use `.env.example` as the shape for local runtime variables. Keep the real `.env` untracked.

Tracked docs may contain only public evidence:

- ClawUp public agent name or ID
- Telegram bot username, not token
- Public wallet address
- ERC-8004 agent ID
- GOAT Mainnet transaction hash
- 8004scan URL
- x402 merchant ID only if the team considers it public
- Public receiving wallet address

Never commit private keys, wallet mnemonics, Telegram bot tokens, x402 API keys, x402 API secrets, passwords, or merchant credentials.

## ClawUp And Telegram
Use ClawUp as the submitted agent shell.

1. Create the ClawUp agent named `clawcompass-broker`.
2. Create a Telegram bot with BotFather.
3. Paste the Telegram bot token only into ClawUp.
4. Send a message to the Telegram bot and copy the pairing approval command.
5. Paste the pairing approval command into the ClawUp agent chat.
6. Verify Telegram messages reach the ClawUp agent.
7. Add ClawUp skills using the GOAT hackathon repo and demo repo as references.

Stop before changing ClawUp settings that require credentials unless the user explicitly approves.

## GOAT Mainnet And ERC-8004
Registration is not part of local framework scaffolding.

Use these public constants when the user approves registration:

- Chain ID: `2345`
- RPC: `https://rpc.goat.network`
- Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Dashboard: `https://8004scan.io/agents?chain=2345`

Do not generate wallets, request gas, submit forms, or register on-chain without explicit user instruction.

## x402
ClawCompass uses x402 because the selected idea includes paid capability execution.

Local tests can use `ENABLE_MOCK_X402=true`. The final demo must use real x402 credentials and payment evidence from the GOAT merchant portal flow.

Required runtime values for real x402:

- `GOATX402_API_URL`
- `GOATX402_API_KEY`
- `GOATX402_API_SECRET`
- `GOATX402_MERCHANT_ID`
- `GOAT_RECEIVING_WALLET`

The API enforces the rule: no verified x402 payment, no paid execution.
