# ClawCompass Architecture

## Pipeline

```text
Requesting agent or human
-> ClawUp / Telegram
-> ClawCompass API
-> task analyzer
-> context sanitizer
-> marketplace lookup
-> ranker and sequencer
-> guardrail policy
-> x402 payment gate
-> capability executor
-> result verifier
-> transaction and reputation log
```

## Backend Modules

- `taskAnalyzer`: classifies task type, risk tolerance, budget, and required capability hints.
- `contextSanitizer`: removes secrets and creates a safe sharing preview.
- `capabilityRanker`: scores capabilities by fit, trust, success, safety, price, and simplicity.
- `guardrails`: decides whether approval is required.
- `paymentGate`: creates transactions and blocks unpaid paid executions.
- `executor`: executes `PitchHawk` and free low-risk tools with sanitized input.
- `reputationLogger`: records local outcome events.

## API

- `POST /api/ask`
- `GET /api/marketplace`
- `GET /api/tool/:id`
- `POST /api/use/:id`
- `POST /api/execute/:id`
- `POST /api/cancel/:transactionId`
- `POST /api/retry/:transactionId`
- `GET /api/security`
- `GET /api/transactions`
- `GET /api/reputation/:id`
- `POST /api/register-tool`

## External Boundaries

The local API can simulate payment settlement only through the explicit `/api/demo-settle/:transactionId` development route. Real ClawUp, wallet, merchant, x402, and ERC-8004 actions stay blocked until the user explicitly approves them.

## Local Payment Truth

`/api/demo-settle/:transactionId` is a local demo adapter. It marks a transaction as settled for development and tests, but it is not presented as real x402 proof. The live demo must replace this with GOAT x402 Merchant Portal evidence once merchant credentials and funds exist.

## Related Docs

- [Hub](README.md)
- [Idea brief](IDEA-BRIEF.md)
- [Build plan](BUILD-PLAN.md)
- [x402 skill](../../../skills/x402-payment-readiness/SKILL.md)
- [ERC-8004 skill](../../../skills/erc8004-mainnet-registration/SKILL.md)
