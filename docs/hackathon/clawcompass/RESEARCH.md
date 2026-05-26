# ClawCompass Research Notes

## Thesis

Tool availability is no longer the bottleneck. The hard problem is choosing, trusting, paying for, safely invoking, and sequencing the right capability for the current task.

## Source Notes

- OpenClaw/GOAT hackathon projects should show OpenClaw/ClawUp, ERC-8004 identity, x402 payments, GOAT Network, and a sharp 2-minute live demo.
- ClawUp supports creating a Claw, pairing Telegram, and adding marketplace tools.
- x402 uses HTTP 402-style payment instructions so human or machine clients can pay for API access without account checkout.
- GOAT AgentKit includes wallet, x402, x402 merchant, and ERC-8004 identity/reputation actions.
- MCP directories already contain large tool catalogs, validating the need for routing and safety.
- Remote MCP servers and connectors can access data and take actions, so approval, logging, trusted providers, redaction, and output validation are product requirements.

## Positioning

Say:

```text
ClawCompass is an agent-native capability broker.
```

Avoid:

```text
generic marketplace
tool directory
trustless tool execution
```

Use:

```text
trust-minimized payment settlement
verified and risk-tagged capability routing
context-safe execution
```

## Related Docs

- [Hub](README.md)
- [Idea brief](IDEA-BRIEF.md)
- [Architecture](ARCHITECTURE.md)
- [Build plan](BUILD-PLAN.md)
- [Event context](../CONTEXT.md)
