# ClawCompass Idea Brief

## Candidate Name
ClawCompass

## Problem
AI agent builders and agent operators lose time choosing, trusting, configuring, and paying for the right skills, MCPs, hooks, plugins, rules, and sub-agents. The first lived pain point is ClawUp/GOAT onboarding itself: setup spans ClawUp, Telegram pairing, skills, wallet funding, ERC-8004, x402, and submission evidence.

## User
The primary user is an AI agent builder or requesting agent that needs a reliable capability for a concrete task without exposing unnecessary context or taking unsafe actions.

## Market And Earning Potential
The buyer is an agent builder, autonomous-agent platform, or managed AI workflow team. The first paid unit is a low-value per-capability execution fee, starting at 0.10 USDC for the hackathon demo.

## Existing Alternatives
MCP directories, plugin registries, GitHub repos, and manual prompt engineering help people find tools, but they do not broker payment, context safety, execution, and outcome reputation in one loop.

## Execution Gap
Existing directories say what exists. They do not decide what is needed, redact sensitive context, require payment before execution, block high-risk actions, or update reputation after an outcome.

## Unique Insight
Agent capability sprawl is becoming a workflow problem, not just a search problem. We experienced the setup pain directly while building this project: a builder needs a capability broker that can route them to the exact onboarding skill, protect secrets, require payment before paid diagnosis, and stop before risky mainnet actions.

## Feasible Inputs
The MVP can use user-provided task text, context, budget, and constraints; a seeded local marketplace of demo capabilities; x402 merchant credentials supplied later; and public GOAT/ClawUp registration evidence.

## Agent Action
ClawCompass analyzes the task, redacts sensitive context, ranks capabilities, creates a payment-gated transaction for paid tools, executes SetupPilot after verified payment, logs a reputation event, and halts for high-risk wallet, mainnet, payment, or write actions.

## GOAT Fit
The idea naturally uses GOAT identity and reputation through ERC-8004, and x402 for paid capability execution. The demo shows a brokered agent-to-capability transaction rather than decorative blockchain usage.

## Two-Minute Demo
The judge asks what ClawCompass does, sends the real onboarding pain prompt, sees SetupPilot recommended, sees secrets redacted, approves a paid x402-gated execution, receives a safe ClawUp/Telegram/ERC-8004/x402 setup diagnosis, sees reputation updated, and then triggers a risky mainnet/private-key request that is blocked pending explicit approval.

## Risks
The highest demo risks are x402 merchant approval, available stablecoin balance, ClawUp/Telegram pairing reliability, and ERC-8004 mainnet registration timing. The local framework must support mock x402 only for development and clearly require real x402 proof for final judging.

## Decision
Chosen. ClawCompass is the selected OpenClaw/GOAT hackathon idea.
