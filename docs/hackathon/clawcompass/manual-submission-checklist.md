# ClawCompass Manual Submission Checklist (Live Proofs Only)

Date: 2026-05-27

## What is already done locally
- ClawCompass API + dashboard + test coverage merged into `main`.
- Approval guardrails: explicit `APPROVE_*` flows implemented.
- Local mock x402 is isolated via `ENABLE_MOCK_X402=true`; real execution remains verification-gated.
- `npm run validate` and `npm run build:web` pass.

## What remains and can be completed without code changes
Use this section when you are ready to do live setup/demos.

### 1) ClawUp + Telegram onboarding
- Create ClawUp agent
- Paste telegram bot token (in ClawUp only)
- Trigger pairing, request pairing code, approve pairing
- Confirm bot responds in TG channel

Capture:
- ClawUp agent name/id (non-secret)
- Telegram bot username
- Pairing completion timestamp/screenshot

### 2) x402 + gateway
- Register/activate merchant in x402 portal
- Confirm merchant id
- Ensure payment flow returns x402 header for `/use` paid paths

Capture:
- Merchant ID / merchant label
- Signed transaction/test payment hash
- Verification result in your wallet/explorer when successful

### 3) Wallet + GOAT chain readiness
- Request gas + stables from event forms
- Create/confirm agent wallet path
- Save addresses safely in runtime secrets only

Capture:
- Wallet address used by agent
- Funding tx hash(es)

### 4) ERC-8004 identity
- Register agent id on GOAT Mainnet
- Confirm listing on 8004scan

Capture:
- ERC-8004 agent ID
- 8004 registration tx hash
- Public URL: `https://8004scan.io/agents?chain=2345`

### 5) Real x402 + setup pilot demo
- Execute full `/ask` -> `/use setuppilot` flow with real payment
- Keep setup in `demo-ready` state after payment verification

Capture:
- Payment proof hash
- `/api/payment/:id/status` result showing executable
- SetupPilot execution output (phase, blocker, next safe action)
- Reputation update result

### 6) High-risk confirmation gate demo
- Run a mainnet/private-key onboarding task that should return `APPROVE_ONCHAIN`
- Show wrong token rejection then correct token acceptance

Capture:
- command transcript (ask/use/approve)
- blocked transaction state before approval
- payment request after correct explicit approval

### 7) Submission artifacts
- Hackathon submission form data:
  - Agent name
  - Public wallet
  - Merchant ID
  - Evidence links and hashes
  - 8004scan URL
- Public demo readiness status (no secrets, no private keys in docs)

## What I can still do from this environment
- Continue editing code/docs.
- Add/modify runbooks and judge-flow scripts.
- Add more tests/defensive checks (e.g., maximum spend prompt, extra error states).
- Record/update evidence-ready outputs in docs.

## What I cannot do without your approvals/secrets
- Actual ClawUp creation/pairing.
- Real GOAT/x402 mainnet transactions.
- ERC-8004 live registration + 8004scan confirmation.
- Final form submission.
