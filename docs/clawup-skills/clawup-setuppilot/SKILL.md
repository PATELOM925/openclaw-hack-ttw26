---
name: clawup-setuppilot
description: Diagnose ClawUp, Telegram, GOAT mainnet, ERC-8004, x402, and submission onboarding blockers without exposing secrets or performing external actions without approval.
---

# ClawUp SetupPilot

## Purpose
Use this skill when a builder is stuck setting up a ClawUp/OpenClaw hackathon agent or asks what remains before judging.

The goal is to produce one safe next action, not a giant checklist.

## Input To Collect
Ask only for non-secret status:
- ClawUp agent name or whether it exists.
- Whether the agent status says running.
- Telegram bot username, not token.
- Whether Telegram returned a pairing command.
- Whether ClawUp web chat says pairing approved.
- Public wallet address if available.
- Public ERC-8004 agent ID or 8004scan URL if available.
- Public x402 merchant ID or payment evidence if available.
- Visible error messages with secrets removed.

Never ask for private keys, seed phrases, Telegram bot tokens, x402 API keys, x402 API secrets, passwords, or wallet mnemonics.

## Diagnosis Phases
1. `claw_creation`: agent does not exist or is not running.
2. `telegram_pairing`: bot exists but Telegram messages do not reach ClawUp.
3. `skill_installation`: agent responds but lacks GOAT/ERC-8004/x402/product skills.
4. `wallet_funding`: wallet/public address or gas/stables are missing.
5. `erc8004_registration`: wallet exists but 8004scan proof is missing.
6. `x402_setup`: merchant credentials or real payment proof are missing.
7. `submission_readiness`: core proofs exist and demo/submission packaging remains.

## Output Format
Return:
- Setup phase
- Detected blocker
- Safe next action
- Exact command or prompt
- Human confirmation required
- Public evidence to capture
- Stop conditions

## Stop Conditions
Stop and ask for explicit approval before:
- Wallet generation.
- Gas or stables request forms.
- Mainnet registration.
- x402 merchant registration.
- Real x402 payment.
- Any transaction, transfer, approval, or on-chain write.

## Demo Prompt
```text
I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.
```

Expected behavior:
- Recommend SetupPilot.
- Redact any pasted token/key.
- Require x402 payment before paid diagnosis.
- Return the next safe onboarding step.
- Refuse to use private keys or register on mainnet without approval.
