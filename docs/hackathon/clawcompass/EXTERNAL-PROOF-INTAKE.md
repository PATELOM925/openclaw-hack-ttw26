# External Proof Intake

Date: 2026-05-26

## Source

- Local source document: `/Users/shreyapatel/Projects/zzz project docs/GOAT Hack/ClawUp ENV.docx`
- Source status: secret-bearing reference material. Do not copy raw values into repo files.
- Sanitization: only public identifiers and non-secret setup facts are recorded here.
- 2026-05-26 chat update: credential classes were re-provided, but raw values were not saved. Treat those credentials as exposed until rotated or reissued.

## Public Details Found

- Candidate agent name: `ClawCompass_bot`
- Telegram bot username: `goat_4_ai_bot`
- Public wallet address: `0x1a2B3c4D5e6F7890a1B2c3D4e5F6a7B8c9D0e1F2`
- GOAT Mainnet RPC: `https://rpc.goat.network`
- GOAT Mainnet chain ID: `2345`
- Canonical ERC-8004 registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Merchant public name or ID candidate: `ClawCompass`
- Local OpenClaw control UI candidate: `http://127.0.0.1:18789/`

## Conflicts Or Unverified Facts

- The source also lists `0xE1AD845D93853fff44990aE0DcecD8575293681e` as a contract or registry-like address. Treat its role as unverified; do not replace the canonical ERC-8004 registry with it without source confirmation.
- 8004scan and GOAT docs list GOAT Mainnet chain `2345` with Identity Registry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`; use that as the ERC-8004 target unless verified source material proves otherwise.
- No verified ClawUp agent ID, pairing-approved screenshot/status, ERC-8004 agent ID, mainnet registration transaction, specific 8004scan URL, stablecoin balance, or real x402 settlement proof has been verified locally.

## Secret Material Present In Source

- Wallet private key.
- Telegram bot token.
- Merchant login credentials.
- x402 API key and API secret.
- Local control UI token.

These values must not be committed, echoed in docs, or sent through chat. Rotate or reissue exposed secrets before using them for final judging or funds.

## Current Safe Classification

- ClawUp: blocked pending verified ClawUp agent ID and running status.
- Telegram: partially unblocked by public username, still blocked pending rotated token if needed and verified ClawUp pairing.
- Wallet: partially unblocked by public address, still blocked because the private key appears in the source and balances are unverified.
- x402: partially unblocked by merchant name and credential existence, still blocked until credentials are rotated/reissued, stored outside tracked files, funded, and a real payment proof is captured.
- ERC-8004: partially prepared by public metadata and canonical registry facts, still blocked until explicit on-chain approval, registration transaction, agent ID, and 8004scan listing exist.

## Read-Only GOAT RPC Check

- Date: 2026-05-26.
- RPC `eth_chainId` returned `0x929` (`2345`).
- Public wallet balance returned `10000000000000` wei (`0.00001` native gas token).
- Canonical Identity Registry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` has contract code.
- User-supplied `0xE1AD845D93853fff44990aE0DcecD8575293681e` also has contract code, but its ERC-8004 role remains unverified.

## Next Safe Actions

1. Rotate or reissue the Telegram bot token and x402 credentials if these are final accounts.
2. Decide whether the public wallet is disposable; if not, create a fresh wallet outside repo files and fund only after explicit approval.
3. Verify ClawUp pairing through Telegram with non-secret screenshots/status.
4. Run a real `0.10 USDC` x402 payment test only after explicit approval.
5. Register ERC-8004 on GOAT Mainnet only after wallet, gas, metadata, and explicit approval exist.
