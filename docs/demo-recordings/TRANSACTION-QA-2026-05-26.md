# Transaction QA

Date: 2026-05-26

## Summary

Transaction QA passed against a local demo stack with mock x402 enabled only for settlement testing.

## Environment

- API: `http://127.0.0.1:3308`
- Web: `http://127.0.0.1:5174`
- Runtime: `ENABLE_MOCK_X402=true`
- Recording: `docs/demo-recordings/clawcompass-transactions-qa-2026-05-26.webm`

## Checks

- Broker flow recommended `setuppilot` for the ClawUp/Telegram/ERC-8004/x402 onboarding task.
- `POST /api/execute/setuppilot` before settlement returned HTTP `402` with `canExecute=false`.
- Broker transaction `txn_qeHMY2nbCj` moved to `delivered` after local mock settlement and execution.
- Reputation for `setuppilot` showed `successfulExecutions: 1` and `pending_external_proof`.
- Buyer flow created transaction `txn_USTmDkMFLX`, settled it locally, executed `pitchhawk`, and returned bought output.
- Transaction history showed both tested transactions as `delivered`.
- Proof page still showed ClawUp, Telegram, real x402, and ERC-8004 as blocked external proof gates.

## Notes

This recording is demo evidence for the local product path, not real x402 settlement evidence. Final judging still needs real merchant payment proof and ERC-8004 registration proof.
