# ClawCompass Build Plan

## P0

- Accept idea and update work graph.
- Seed the capability marketplace.
- Build task analysis, context redaction, ranking, sequencing, guardrails, transaction state, and reputation logging.
- Implement the `PitchHawk` paid capability path.
- Expose API routes for demo commands.
- Add tests for unit, API, payment, redaction, and guardrail behavior.
- Prepare ClawUp command wording and demo script.

## P1

- Add transaction cancel and retry routes.
- Add pending tool submission route.
- Add clear failure messages for unpaid, failed, blocked, and unknown capability paths.
- Add local validation and secret scans.
- Add `/health`, `/api/approve/:transactionId`, and `/api/command`.
- Add `goatx402-sdk-server` adapter and keep mock settlement disabled unless `ENABLE_MOCK_X402=true`.

## External Blockers

- Create ClawUp agent.
- Pair Telegram.
- Create or connect wallet.
- Request gas and stable funds.
- Configure x402 Merchant Portal.
- Register ERC-8004 identity on GOAT Mainnet.
- Capture 8004scan and payment proof.

## Local Commands

```bash
npm install
npm run validate
npm run dev
```

The backend exposes `/health`, `/api/help`, `/api/ask`, `/api/marketplace`, `/api/use/:id`, `/api/approve/:transactionId`, `/api/execute/:id`, `/api/command`, `/api/security`, `/api/transactions`, and `/api/reputation/:id`.

## Related Docs

- [Hub](README.md)
- [Architecture](ARCHITECTURE.md)
- [Demo script](DEMO-SCRIPT.md)
- [Build runbook](../BUILD-RUNBOOK.md)
- [Work graph](../../codex/work/WORK-GRAPH.md)
