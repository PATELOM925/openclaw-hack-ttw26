import request from "supertest";
import { describe, expect, test } from "vitest";
import { createApp } from "../src/app.js";
import { createInitialStore } from "../src/services/store.js";

describe("ClawCompass API", () => {
  test("returns health status", async () => {
    const app = createApp({ store: createInitialStore() });

    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({ ok: true, service: "clawcompass-api" });
  });

  test("returns seven marketplace capabilities", async () => {
    const app = createApp({ store: createInitialStore() });

    const response = await request(app).get("/api/marketplace").expect(200);

    expect(response.body.capabilities).toHaveLength(7);
  });

  test("recommends PitchHawk and blocks secret context in ask flow", async () => {
    const app = createApp({ store: createInitialStore() });

    const response = await request(app)
      .post("/api/ask")
      .send({
        task: "Improve my homepage pitch using my project summary",
        context: "ClawCompass routes paid skills. API_KEY=sk-demo12345678900000000000",
        budgetUsd: 0.1
      })
      .expect(200);

    expect(response.body.recommendations[0].capability.id).toBe("pitchhawk");
    expect(response.body.secureContext.detectedSecrets).toContain("OpenAI-like API key");
    expect(response.body.secureContext.allowedContext).not.toContain("sk-demo");
  });

  test("halts high-risk GitHub write requests", async () => {
    const app = createApp({ store: createInitialStore() });

    const response = await request(app)
      .post("/api/ask")
      .send({ task: "I need a tool that can rewrite my repo and push changes to GitHub." })
      .expect(200);

    expect(response.body.guardrail.status).toBe("approval_required");
    expect(response.body.guardrail.approvalCode).toBe("APPROVE_WRITE");
  });

  test("recommends SetupPilot for ClawUp onboarding prompts", async () => {
    const app = createApp({ store: createInitialStore() });

    const response = await request(app)
      .post("/api/ask")
      .send({
        task: "I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.",
        budgetUsd: 0.1
      })
      .expect(200);

    expect(response.body.analysis.taskType).toBe("onboarding");
    expect(response.body.recommendations[0].capability.id).toBe("setuppilot");
  });

  test("blocks unpaid execution and then executes after mock payment settlement", async () => {
    const store = createInitialStore();
    const app = createApp({ store });

    const useResponse = await request(app)
      .post("/api/use/pitchhawk")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    const transactionId = useResponse.body.transaction.id;

    await request(app)
      .post("/api/execute/pitchhawk")
      .send({ transactionId })
      .expect(402);

    const paidResponse = await request(app)
      .post("/api/execute/pitchhawk")
      .set("x-clawcompass-mock-payment", "settled")
      .send({
        transactionId,
        input: {
          projectSummary: "ClawCompass brokers paid capability execution for agents.",
          targetUser: "AI agent builders"
        }
      })
      .expect(200);

    expect(paidResponse.body.result.headline).toContain("Stop guessing");
    expect(paidResponse.body.transaction.status).toBe("delivered");
    expect(paidResponse.body.reputation.outcome).toBe("success");
  });

  test("blocks unpaid SetupPilot execution and returns setup diagnosis after mock payment", async () => {
    const store = createInitialStore();
    const app = createApp({ store });

    const useResponse = await request(app)
      .post("/api/use/setuppilot")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    const transactionId = useResponse.body.transaction.id;

    await request(app)
      .post("/api/execute/setuppilot")
      .send({ transactionId })
      .expect(402);

    const paidResponse = await request(app)
      .post("/api/execute/setuppilot")
      .set("x-clawcompass-mock-payment", "settled")
      .send({
        transactionId,
        input: {
          task: "Telegram pairing is confusing and I still need ERC-8004 and x402.",
          context: "Claw is running but Telegram does not respond."
        }
      })
      .expect(200);

    expect(paidResponse.body.result.phase).toBe("telegram_pairing");
    expect(paidResponse.body.result.safeNextAction).toContain("pairing");
    expect(paidResponse.body.transaction.status).toBe("delivered");
    expect(paidResponse.body.reputation.outcome).toBe("success");
  });
});
