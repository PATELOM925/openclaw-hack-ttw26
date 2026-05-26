# ClawCompass Manual Submission Checklist (Essential)

## Done locally
- Backend + web app + tests are complete
- Approval + risk gates are implemented
- Mock x402 remains local-only (`ENABLE_MOCK_X402=true`)

## Must be done manually (with live credentials)
1. Create ClawUp agent and pair Telegram bot (approve pairing).
2. Configure x402 merchant and verify paid-capability requests return valid x402 requirement.
3. Create/fund agent wallet for GOAT mainnet.
4. Register agent on ERC-8004 and confirm on `8004scan.io`.
5. Run one real `/use setuppilot` payment/execution flow and capture tx proof.
6. Capture final submission data: agent name, public wallet, merchant ID, tx hashes, 8004scan URL.

## Quick demo proof expectations
- Show SetupPilot recommendation + explicit approval prompt.
- Show `APPROVE_ONCHAIN` required for high-risk actions.
- Show 8004scan listing and payment proof (non-secret fields only).
