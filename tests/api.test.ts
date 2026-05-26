import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("ClawCompass API", () => {
  it("returns self-disclosure and command instructions", async () => {
    const app = createApp();

    const response = await request(app).get("/api/help").expect(200);

    expect(response.body.name).toBe("ClawCompass");
    expect(response.body.description).toContain("capability broker");
    expect(response.body.commands).toEqual(
      expect.arrayContaining(["/ask [task]", "/use [name]", "/security"])
    );
  });

  it("lists seeded marketplace capabilities", async () => {
    const app = createApp();

    const response = await request(app).get("/api/marketplace").expect(200);

    expect(response.body.capabilities.map((item: { name: string }) => item.name)).toEqual(
      expect.arrayContaining(["PitchHawk", "ResearchFox", "GitHubHelper"])
    );
  });

  it("returns task analysis, redaction, recommendations, and sequence", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/ask")
      .send({
        task: "Improve my homepage pitch. Budget: 0.10 USDC. Do not expose secrets.",
        context: "Project summary: ClawCompass\nOPENAI_API_KEY=FAKE_OPENAI_KEY_VALUE_123456",
        budgetUsd: 0.1
      })
      .expect(200);

    expect(response.body.analysis.taskType).toBe("copywriting");
    expect(response.body.secureContext.allowedContext).not.toContain("FAKE_OPENAI_KEY");
    expect(response.body.recommendations[0].capability.name).toBe("PitchHawk");
    expect(response.body.sequence.map((step: { capabilityId: string }) => step.capabilityId)).toContain(
      "pitchhawk"
    );
  });

  it("quotes a paid capability and blocks unpaid execution", async () => {
    const app = createApp();

    const quote = await request(app)
      .post("/api/use/pitchhawk")
      .send({
        requesterAgentId: "agent-demo",
        task: "Improve homepage",
        context: "Project summary\nOPENAI_API_KEY=FAKE_OPENAI_KEY_VALUE_123456"
      })
      .expect(202);

    expect(quote.body.transaction.status).toBe("awaiting_approval");
    expect(quote.body.secureContext.allowedContext).not.toContain("FAKE_OPENAI_KEY");
    expect(quote.body.secureContext.blockedContext).toContain("api_key");

    const blocked = await request(app)
      .post("/api/execute/pitchhawk")
      .send({
        transactionId: quote.body.transaction.id,
        task: "Improve homepage",
        allowedContext: "ClawCompass project summary"
      })
      .expect(402);

    expect(blocked.body.canExecute).toBe(false);
  });

  it("executes PitchHawk after demo payment settlement and updates reputation", async () => {
    const app = createApp();

    const quote = await request(app)
      .post("/api/use/pitchhawk")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    await request(app)
      .post(`/api/demo-settle/${quote.body.transaction.id}`)
      .send({ paymentId: "demo-payment", txHash: "0xabc123" })
      .expect(200);

    const executed = await request(app)
      .post("/api/execute/pitchhawk")
      .send({
        transactionId: quote.body.transaction.id,
        task: "Improve homepage",
        allowedContext: "ClawCompass routes safe capabilities"
      })
      .expect(200);

    expect(executed.body.result.headline).toContain("Stop guessing");
    expect(executed.body.transaction.status).toBe("delivered");

    const reputation = await request(app).get("/api/reputation/pitchhawk").expect(200);
    expect(reputation.body.profile.successfulExecutions).toBe(1);
  });

  it("returns a clean failure for unsupported paid capability execution", async () => {
    const app = createApp();

    const quote = await request(app)
      .post("/api/use/codewolf")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    await request(app)
      .post(`/api/demo-settle/${quote.body.transaction.id}`)
      .send({ paymentId: "demo-payment", txHash: "0xabc123" })
      .expect(200);

    const failed = await request(app)
      .post("/api/execute/codewolf")
      .send({
        transactionId: quote.body.transaction.id,
        task: "Review code",
        allowedContext: "README excerpt"
      })
      .expect(422);

    expect(failed.body.error).toBe("capability_not_executable");
    expect(failed.body.transaction.status).toBe("failed");
    expect(failed.text).not.toContain("Error:");
  });

  it("exposes security policy and records cancel flow", async () => {
    const app = createApp();
    const security = await request(app).get("/api/security").expect(200);

    expect(security.body.policy.writeActionsRequireApproval).toBe(true);

    const quote = await request(app)
      .post("/api/use/pitchhawk")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    const cancelled = await request(app)
      .post(`/api/cancel/${quote.body.transaction.id}`)
      .send()
      .expect(200);

    expect(cancelled.body.transaction.status).toBe("cancelled");

    const transactions = await request(app).get("/api/transactions").expect(200);
    expect(transactions.body.transactions[0].status).toBe("cancelled");
  });
});
