import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("ClawCompass API", () => {
  it("returns health status for infrastructure checks", async () => {
    const app = createApp();

    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({ ok: true, service: "clawcompass-api" });
  });

  it("returns self-disclosure and command instructions", async () => {
    const app = createApp();

    const response = await request(app).get("/api/help").expect(200);

    expect(response.body.name).toBe("ClawCompass");
    expect(response.body.description).toContain("capability broker");
    expect(response.body.text).toContain("I am ClawCompass.");
    expect(response.body.text).toContain("Trigger x402 payment when required");
    expect(response.body.limits).toContain("No verified x402 payment, no paid execution.");
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
    expect(response.body.analysis.analysisSource).toBe("deterministic_fallback");
    expect(response.body.analysis.model).toBe("claude-sonnet-4-6");
    expect(response.body.analysis.recommendedSequence).toContain("pitchhawk");
    expect(response.body.secureContext.allowedContext).not.toContain("FAKE_OPENAI_KEY");
    expect(response.body.recommendations[0].capability.name).toBe("PitchHawk");
    expect(response.body.sequence.map((step: { capabilityId: string }) => step.capabilityId)).toContain(
      "pitchhawk"
    );
  });

  it("quotes low-risk paid capabilities autonomously and blocks unpaid execution", async () => {
    const app = createApp();

    const quote = await request(app)
      .post("/api/use/pitchhawk")
      .send({
        requesterAgentId: "agent-demo",
        task: "Improve homepage",
        context: "Project summary: ClawCompass routes safe capabilities"
      })
      .expect(202);

    expect(quote.body.transaction.status).toBe("payment_required");
    expect(quote.body.paymentRequiredHeader).toContain("\"protocol\":\"x402\"");
    expect(quote.body.guardrail.approvalRequired).toBe(false);
    expect(quote.body.secureContext.blockedContext).toEqual([]);

    const status = await request(app).get(`/api/payment/${quote.body.transaction.id}/status`).expect(200);

    expect(status.body.transaction.status).toBe("payment_required");
    expect(status.body.verification.status).toBe("payment_required");
    expect(status.body.verification.canExecute).toBe(false);

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

  it("creates an explicit buyer intent from another agent context", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/buy")
      .send({
        requesterAgentId: "buyer-agent-001",
        requesterWallet: "0x0000000000000000000000000000000000000001",
        task: "Validate competitors and improve homepage positioning. Budget: 0.10 USDC.",
        context: "Public product summary for autonomous agent builders.",
        budgetUsd: 0.1,
        maxRisk: "low"
      })
      .expect(202);

    expect(response.body.role).toBe("buyer");
    expect(response.body.buyer.requesterAgentId).toBe("buyer-agent-001");
    expect(response.body.selectedCapability.id).toBe("pitchhawk");
    expect(response.body.recommendations.map((item: { capability: { id: string } }) => item.capability.id)).toContain(
      "researchfox"
    );
    expect(response.body.secureContext.blockedContext).toEqual([]);
    expect(response.body.transaction.status).toBe("payment_required");
    expect(response.body.transaction.requesterWallet).toBe("0x0000000000000000000000000000000000000001");
    expect(response.body.purchaseInstructions.nextStep).toBe("pay_x402_then_execute");
  });

  it("keeps buyer selections inside the other agent risk budget", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/api/buy")
      .send({
        requesterAgentId: "careful-buyer",
        requesterWallet: "0x0000000000000000000000000000000000000001",
        task: "Rewrite the repository and push changes, but only buy low risk help.",
        context: "Public repo summary only.",
        budgetUsd: 0.1,
        maxRisk: "low"
      })
      .expect(202);

    expect(response.body.role).toBe("buyer");
    expect(response.body.selectedCapability.riskLevel).toBe("low");
    expect(response.body.selectedCapability.id).not.toBe("githubhelper");
    expect(response.body.recommendations.every((item: { capability: { riskLevel: string } }) => item.capability.riskLevel === "low"))
      .toBe(true);
  });

  it("keeps high-risk capabilities approval-gated", async () => {
    const app = createApp();

    const quote = await request(app)
      .post("/api/use/githubhelper")
      .send({ requesterAgentId: "agent-demo", task: "Rewrite repo and push" })
      .expect(202);

    expect(quote.body.transaction.status).toBe("awaiting_approval");
    expect(quote.body.guardrail.approvalRequired).toBe(true);
    expect(quote.body.guardrail.reasons).toEqual(
      expect.arrayContaining(["write_action", "high_risk", "unverified_provider"])
    );
  });

  it("keeps demo settlement disabled unless mock x402 is enabled", async () => {
    const app = createApp();

    const quote = await request(app)
      .post("/api/use/pitchhawk")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    const blocked = await request(app)
      .post(`/api/demo-settle/${quote.body.transaction.id}`)
      .send({ paymentId: "demo-payment", txHash: "0xabc123" })
      .expect(403);

    expect(blocked.body.error).toBe("mock_x402_disabled");
  });

  it("executes PitchHawk after local mock payment settlement and updates reputation", async () => {
    const app = createApp({ enableMockX402: true });

    const quote = await request(app)
      .post("/api/use/pitchhawk")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    await request(app)
      .post(`/api/demo-settle/${quote.body.transaction.id}`)
      .send({
        paymentId: "demo-payment",
        txHash: "0xabc123",
        capabilityId: "pitchhawk",
        amount: "0.10",
        token: "USDC",
        chainId: 2345
      })
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
    expect(reputation.body.profile.events[0].writeStatus).toBe("pending_external_proof");
  });

  it("returns a clean failure for unsupported paid capability execution", async () => {
    const app = createApp({ enableMockX402: true });

    const quote = await request(app)
      .post("/api/use/codewolf")
      .send({ requesterAgentId: "agent-demo" })
      .expect(202);

    await request(app)
      .post(`/api/demo-settle/${quote.body.transaction.id}`)
      .send({
        paymentId: "demo-payment",
        txHash: "0xabc123",
        capabilityId: "codewolf",
        amount: "0.10",
        token: "USDC",
        chainId: 2345
      })
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

  it("adapts ClawUp and Telegram commands into chat-friendly responses", async () => {
    const app = createApp({ enableMockX402: true });

    const help = await request(app).post("/api/command").send({ text: "/help" }).expect(200);
    expect(help.body.text).toContain("I am ClawCompass.");

    const ask = await request(app)
      .post("/api/command")
      .send({
        sessionId: "demo-session",
        text:
          "/ask I need a tool that can rewrite my repo and push changes to GitHub."
      })
      .expect(200);

    expect(ask.body.text).toContain("High-risk action detected.");
    expect(ask.body.text).toContain("Reply APPROVE_WRITE or CANCEL.");

    const blockedReputation = await request(app).get("/api/reputation/githubhelper").expect(200);
    expect(blockedReputation.body.profile.blockedRiskEvents).toBe(1);

    const reputationCommand = await request(app)
      .post("/api/command")
      .send({ sessionId: "demo-session", text: "/reputation GitHubHelper" })
      .expect(200);
    expect(reputationCommand.body.text).toContain("blocked risk events: 1");

    const use = await request(app)
      .post("/api/command")
      .send({
        sessionId: "demo-session",
        text: "/use PitchHawk",
        context: "Project summary: ClawCompass"
      })
      .expect(200);

    expect(use.body.text).toContain("PitchHawk costs 0.10 USDC");
    expect(use.body.text).toContain("Payment required.");
    expect(use.body.text).toContain("Rail: x402");

    const approve = await request(app)
      .post("/api/command")
      .send({ sessionId: "demo-session", text: "APPROVE" })
      .expect(200);

    expect(approve.body.text).toContain("No pending approval-gated capability.");

    const cancel = await request(app)
      .post("/api/command")
      .send({ sessionId: "demo-session", text: "CANCEL" })
      .expect(200);

    expect(cancel.body.text).toContain("Cancelled");
  });

  it("exposes security policy and records cancel flow", async () => {
    const app = createApp();
    const security = await request(app).get("/api/security").expect(200);

    expect(security.body.policy.writeActionsRequireApproval).toBe(true);
    expect(security.body.text).toContain("ClawCompass Guardrails");
    expect(security.body.text).toContain("Abort route: /cancel [transaction_id]");

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

  it("exposes external proof status and pending on-chain reputation write state", async () => {
    const app = createApp();

    const proof = await request(app).get("/api/proof").expect(200);

    expect(proof.body.status).toBe("blocked_external_actions_required");
    expect(proof.body.requiredProof.clawUp.status).toBe("blocked");
    expect(proof.body.requiredProof.erc8004.chainId).toBe(2345);

    const write = await request(app)
      .post("/api/reputation/pitchhawk/write-onchain")
      .send()
      .expect(202);

    expect(write.body.writeStatus).toBe("pending_external_proof");
    expect(write.body.onChainWritten).toBe(false);
  });
});
