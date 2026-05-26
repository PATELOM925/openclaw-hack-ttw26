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
-> browser dashboard and ClawUp/Telegram command output
```

Buyer and seller surfaces share the same broker core:

```text
Buyer agent
-> POST /api/buy
-> risk and budget-filtered recommendations
-> x402-bound purchase intent
-> payment verification
-> bought capability execution

Seller/provider
-> listed marketplace capability or POST /api/register-tool
-> broker quote through POST /api/use/:id
-> x402 payment requirement
-> delivery and reputation event
```

## Backend Modules

- `taskAnalyzer`: classifies task type, risk tolerance, budget, and required capability hints.
- `contextSanitizer`: removes secrets and creates a safe sharing preview.
- `capabilityRanker`: scores capabilities by fit, trust, success, safety, price, and simplicity.
- `guardrails`: decides whether approval is required.
- `paymentGate`: creates transactions and blocks unpaid paid executions.
- `paymentAdapter`: wraps `goatx402-sdk-server` for real x402 order creation and exposes local mock settlement only when enabled.
- `buyerFlow`: shapes buyer-agent profiles, budget/risk-filtered buyable recommendations, and purchase instructions.
- `commandHandler`: formats ClawUp/Telegram commands into chat-friendly responses.
- `executor`: executes `SetupPilot`, `PitchHawk`, and free low-risk tools with sanitized input.
- `reputationLogger`: records local outcome events.
- `web/`: Vite React dashboard for broker workflow, capabilities, transactions, reputation, security, and proof status.

## API

- `GET /health`
- `POST /api/ask`
- `GET /api/marketplace`
- `GET /api/tool/:id`
- `POST /api/buy`
- `POST /api/use/:id`
- `POST /api/approve/:transactionId`
- `POST /api/execute/:id`
- `POST /api/command`
- `POST /api/cancel/:transactionId`
- `POST /api/retry/:transactionId`
- `GET /api/security`
- `GET /api/transactions`
- `GET /api/reputation/:id`
- `POST /api/register-tool`
- `GET /api/payment/:transactionId/status`
- `GET /api/proof`
- `POST /api/reputation/:id/write-onchain`

## External Boundaries

The local API can simulate payment settlement only through the explicit `/api/demo-settle/:transactionId` development route when `ENABLE_MOCK_X402=true`. Real ClawUp, wallet, merchant, x402, and ERC-8004 actions stay blocked until the user explicitly approves them.

## Local Payment Truth

`/api/demo-settle/:transactionId` is a local mock adapter. It marks a transaction as settled for development and tests only when mock x402 is enabled, but it is not presented as real x402 proof. The live demo must replace this with GOAT x402 Merchant Portal evidence once merchant credentials and funds exist.

## Web Surfaces

- `/`: task intake, safe context preview, recommendations, sequence, x402 quote, payment status, execution result.
- `/buy`: buyer-agent task/context intake, recommended tools to buy, payment settlement, and execution.
- `/sell`: listed seller capabilities and pending provider submissions.
- `/transactions`: payment history with status, retry, and cancel controls.
- `/reputation`: local reputation profile and pending on-chain write state.
- `/security`: guardrail policy and blocked-risk command demo.
- `/proof`: external ClawUp, Telegram, x402, wallet, and ERC-8004 blocker/proof checklist.

## Related Docs

- [Hub](README.md)
- [Idea brief](IDEA-BRIEF.md)
- [Build plan](BUILD-PLAN.md)
- [x402 skill](../../../skills/x402-payment-readiness/SKILL.md)
- [ERC-8004 skill](../../../skills/erc8004-mainnet-registration/SKILL.md)
