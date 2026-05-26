# ClawCompass

ClawCompass is a capability broker for autonomous AI agents. A requesting agent describes its task, goal, budget, and project context. ClawCompass analyzes what capabilities are needed, redacts sensitive context, ranks tools from a managed marketplace, gates paid capabilities through x402 payments, executes after payment verification, and logs outcome reputation.

The main hackathon demo capability is **ClawUp SetupPilot**, a paid setup diagnosis skill for builders stuck across ClawUp, Telegram pairing, GOAT mainnet, ERC-8004, x402, and submission readiness.

## MVP Loop

```text
requesting agent task/context
  -> task analysis
  -> capability recommendation
  -> context redaction
  -> x402 payment requirement
  -> verified execution
  -> reputation event
```

## Local API

```bash
cd clawcompass/apps/api
npm install
npm run dev
```

Endpoints:

- `GET /health`
- `GET /api/marketplace`
- `GET /api/tool/:id`
- `POST /api/ask`
- `GET /api/security`
- `POST /api/use/:id`
- `POST /api/execute/:id`
- `GET /api/transactions`
- `GET /api/reputation/:id`

## Demo Commands

- `/help`
- `/ask I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.`
- `/use SetupPilot`
- `/ask Improve my homepage pitch using my project summary. Budget: 0.10 USDC. Do not expose secrets.`
- `/security`

## Guardrails

- No verified x402 payment, no paid execution.
- Secrets are redacted before routing context.
- Write, wallet, and external-message actions require explicit approval.
- Mock x402 is local/test only; final demo requires real x402 evidence.
