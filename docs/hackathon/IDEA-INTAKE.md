# Idea Intake

## Purpose
Use this before writing app code. The best hackathon idea should come from a real friction point, have a clear user, and need agentic execution rather than another dashboard or chatbot.

## Selection Rule
Choose an idea only when these are clear:
- A specific person has the problem today.
- The current workaround is painful, slow, expensive, or unreliable.
- The agent can act on the user's behalf within hackathon constraints.
- Required data, APIs, websites, files, or human inputs are reachable in one day.
- GOAT identity, trust, settlement, or payments make the agent stronger.

## Intake Questions
1. Problem: Who experiences the problem, how often, and what do they do instead?
2. Existing tools: What products, services, or manual workflows already address part of it?
3. Execution gap: Where do existing tools stop too early?
4. Unique insight: What do we know from direct experience that a market report would miss?
5. Feasibility: What data or access does the agent need, and can we reach it today?
6. User value: What would the user pay, save, earn, recover, or avoid losing?
7. Demo path: What can be shown in 2 minutes without fragile setup?
8. GOAT fit: Does the idea need identity, reputation, payment, settlement, or agent-to-agent commerce?
9. Guardrails: Which actions require confirmation before the agent proceeds?

## Scoring Rubric
| Dimension | Strong | Weak |
|---|---|---|
| User pain | Frequent, concrete, costly | Abstract or rare |
| Market | Clear buyer or beneficiary | No obvious payer |
| Agentic value | Agent executes a task | Agent only summarizes |
| Feasibility | Inputs and APIs are reachable | Depends on inaccessible systems |
| Demo | Live path fits 2 minutes | Needs long explanation |
| GOAT fit | Identity or payments are natural | Blockchain feels decorative |

## Recommended Flow
1. Fill `docs/templates/idea-brief.md` for each candidate.
2. Rank candidates against the rubric above.
3. Pick one idea and update `docs/codex/work/WORK-GRAPH.md`.
4. Move the chosen idea's build tasks from `backlog` to `ready`.
5. Use `docs/hackathon/BUILD-RUNBOOK.md` to create the ClawUp agent.

## Idea Sources
The event ideas doc lists examples across retail, mobility, jobs, health, education, and B2B. Treat that list as inspiration, not a boundary. Favor a problem the team personally understands.
