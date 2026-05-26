# Idea Brief: ClawCompass

## Candidate Name

ClawCompass

## Problem

AI agent builders and autonomous agents have too many possible skills, MCP servers, hooks, plugins, rules, and sub-agents to choose from, and the hard part is deciding what is safe, useful, affordable, and correctly sequenced for a task.

## User

The immediate user is a hackathon builder or their requesting agent trying to complete a concrete project task without manually choosing and installing every capability.

## Market And Earning Potential

Capability gaps grow as agents attempt more complex work. ClawCompass earns per paid capability execution, with future provider revenue sharing, verified listings, private marketplaces, and reputation APIs.

## Existing Alternatives

MCP directories list tools, ClawUp can host and bind tools, and integration platforms connect agents to apps. They do not complete the full loop of task analysis, context safety, payment, execution, verification, and reputation.

## Execution Gap

Directories answer what exists. ClawCompass answers what this agent needs now, what context can be safely shared, what it costs, whether it should be approved, and whether it worked.

## Unique Insight

For agents, capability choice is itself an execution problem. The requesting agent should not need to know which tool it needs before asking for help.

## Feasible Inputs

The MVP uses user-supplied task text, optional project summary/context, seeded capability listings, x402 payment configuration, local transaction state, and local reputation logs.

## Agent Action

ClawCompass autonomously analyzes, redacts, ranks, recommends, and executes low-risk free capabilities. Paid, high-risk, write, wallet, external-message, or unverified actions require approval.

## GOAT Fit

ERC-8004 provides agent identity and future reputation portability. x402 fits per-capability paid execution. GOAT Network provides the hackathon payment and identity rail.

## Two-Minute Demo

Ask ClawCompass to improve homepage positioning with a `0.10 USDC` budget. It recommends PitchHawk, previews redacted context, requires x402 payment, executes after verified payment, logs reputation, then blocks a risky repo-write request pending explicit approval.

## Risks

External blockers include ClawUp setup, Telegram pairing, wallet creation, funding, merchant credentials, real x402 settlement, and ERC-8004 mainnet registration. Local implementation must not fake these proofs.

## Decision

Chosen. ClawCompass is the project direction because it naturally uses identity, payment, capability commerce, and guardrails in a judge-visible workflow.

## Related Docs

- [Hub](README.md)
- [Research](RESEARCH.md)
- [Architecture](ARCHITECTURE.md)
- [Build plan](BUILD-PLAN.md)
- [Work graph](../../codex/work/WORK-GRAPH.md)
