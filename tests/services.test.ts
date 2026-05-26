import { describe, expect, it } from "vitest";
import { analyzeTask, analyzeTaskWithLLM } from "../src/services/taskAnalyzer.js";
import { sanitizeContext } from "../src/services/contextSanitizer.js";
import { listCapabilities } from "../src/services/marketplace.js";
import { rankCapabilities } from "../src/services/capabilityRanker.js";
import { buildCapabilitySequence } from "../src/services/capabilitySequencer.js";
import { evaluateGuardrails, getSecurityPolicy } from "../src/services/guardrails.js";
import {
  createExecutionQuote,
  createPaymentRequiredResponse,
  markPaymentSettled
} from "../src/services/paymentGate.js";
import { createPaymentAdapter } from "../src/services/paymentAdapter.js";
import { executeCapability, executeSetupPilot } from "../src/services/executor.js";
import { createReputationLogger } from "../src/services/reputationLogger.js";
import { getExternalProofStatus } from "../src/services/proofStatus.js";

describe("task analysis", () => {
  it("classifies homepage pitch work as copywriting with low risk and parsed budget", () => {
    const analysis = analyzeTask({
      task: "Improve my homepage pitch for a hackathon project. Budget: 0.10 USDC.",
      budgetUsd: 0.1
    });

    expect(analysis.taskType).toBe("copywriting");
    expect(analysis.requiredCapabilities).toContain("landing_page_copy");
    expect(analysis.budgetUsd).toBe(0.1);
    expect(analysis.riskTolerance).toBe("low");
  });

  it("classifies repo rewrite and push work as high-risk repo_write", () => {
    const analysis = analyzeTask({
      task: "Rewrite my repo and push changes to GitHub",
      maxRisk: "high"
    });

    expect(analysis.taskType).toBe("repo_write");
    expect(analysis.requiredCapabilities).toContain("repo_write");
    expect(analysis.riskTolerance).toBe("high");
  });

  it("returns LLM fallback metadata when no Anthropic key is configured", async () => {
    const analysis = await analyzeTaskWithLLM(
      { task: "Validate the market and then write homepage copy", budgetUsd: 0.1 },
      { ANTHROPIC_API_KEY: "" }
    );

    expect(analysis.analysisSource).toBe("deterministic_fallback");
    expect(analysis.model).toBe("claude-sonnet-4-6");
    expect(analysis.fallbackReason).toBe("missing_anthropic_api_key");
    expect(analysis.recommendedSequence).toEqual(["researchfox", "pitchhawk"]);
    expect(analysis.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("classifies ClawUp setup work as onboarding", () => {
    const analysis = analyzeTask({
      task: "I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402."
    });

    expect(analysis.taskType).toBe("onboarding");
    expect(analysis.requiredCapabilities).toEqual(
      expect.arrayContaining(["clawup_setup", "telegram_pairing", "erc8004", "x402"])
    );
    expect(analysis.recommendedSequence).toEqual(["setuppilot", "hookguard"]);
  });
});

describe("context sanitization", () => {
  it("redacts secret-like values and reports blocked context classes", () => {
    const rawApiKey = `sk-${"test12345678901234567890"}`;
    const oauthAssignment = `OAUTH_${"TOKEN"}=oauth_demo_token_1234567890`;
    const context = [
      "Project summary: capability broker",
      "OPENAI_API_KEY=FAKE_OPENAI_KEY_VALUE_123456",
      rawApiKey,
      oauthAssignment,
      "Phone: +1 (416) 555-1212",
      "DATABASE_URL=postgres://user:pass@example.com:5432/app",
      "Contact me at builder@example.com"
    ].join("\n");

    const sanitized = sanitizeContext("Improve homepage", context);

    expect(sanitized.allowedContext).toContain("Project summary");
    expect(sanitized.allowedContext).not.toContain("FAKE_OPENAI_KEY");
    expect(sanitized.allowedContext).not.toContain("sk-test");
    expect(sanitized.allowedContext).not.toContain("oauth_demo");
    expect(sanitized.allowedContext).not.toContain("416");
    expect(sanitized.allowedContext).not.toContain("postgres://");
    expect(sanitized.allowedContext).not.toContain("builder@example.com");
    expect(sanitized.blockedContext).toEqual(
      expect.arrayContaining(["api_key", "oauth_token", "phone_number", "database_url", "email"])
    );
    expect(sanitized.approvalRequired).toBe(true);
  });
});

describe("capability ranking and sequencing", () => {
  it("ranks PitchHawk first for landing page copy", () => {
    const analysis = analyzeTask({
      task: "Improve my homepage pitch using my project summary",
      budgetUsd: 0.1
    });
    const sanitized = sanitizeContext(analysis.originalTask, "Public project summary");

    const ranked = rankCapabilities(analysis, sanitized, listCapabilities());

    expect(ranked[0].capability.name).toBe("PitchHawk");
    expect(ranked[0].reasons.join(" ")).toContain("landing_page_copy");
    expect(ranked.slice(0, 3)).toHaveLength(3);
  });

  it("ranks SetupPilot first for ClawUp and GOAT onboarding", () => {
    const analysis = analyzeTask({
      task: "I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.",
      budgetUsd: 0.1
    });
    const sanitized = sanitizeContext(analysis.originalTask, "Public status only");

    const ranked = rankCapabilities(analysis, sanitized, listCapabilities());

    expect(ranked[0].capability.id).toBe("setuppilot");
  });

  it("filters paid capabilities above budget when a viable free alternative exists", () => {
    const analysis = analyzeTask({
      task: "Summarize these public notes",
      budgetUsd: 0
    });
    const sanitized = sanitizeContext(analysis.originalTask, "Public notes");

    const ranked = rankCapabilities(analysis, sanitized, listCapabilities());

    expect(ranked[0].capability.id).toBe("freesummarizer");
    expect(ranked.slice(0, 3).every((item) => item.capability.priceUsd <= analysis.budgetUsd)).toBe(true);
  });

  it("builds a research to draft to safety sequence for pitch tasks", () => {
    const analysis = analyzeTask({ task: "Improve homepage pitch and add safe agent rules" });
    const sequence = buildCapabilitySequence(analysis, listCapabilities());

    expect(sequence.map((step) => step.capabilityId)).toEqual([
      "researchfox",
      "pitchhawk",
      "hookguard"
    ]);
  });
});

describe("guardrails", () => {
  it("allows low-risk paid capability within the autonomous spend cap", () => {
    const pitchHawk = listCapabilities().find((capability) => capability.id === "pitchhawk");
    const policy = getSecurityPolicy();

    expect(pitchHawk).toBeDefined();
    const decision = evaluateGuardrails({
      capability: pitchHawk!,
      policy,
      requestedAmountUsd: pitchHawk!.priceUsd
    });

    expect(decision.allowed).toBe(true);
    expect(decision.approvalRequired).toBe(false);
    expect(decision.reasons).not.toContain("paid_capability");
  });

  it("requires approval for paid capabilities and high-risk write permissions", () => {
    const githubHelper = listCapabilities().find((capability) => capability.id === "githubhelper");
    const policy = getSecurityPolicy();

    expect(githubHelper).toBeDefined();
    const decision = evaluateGuardrails({
      capability: githubHelper!,
      policy,
      requestedAmountUsd: githubHelper!.priceUsd
    });

    expect(decision.allowed).toBe(false);
    expect(decision.approvalRequired).toBe(true);
    expect(decision.reasons).toEqual(
      expect.arrayContaining(["write_action", "high_risk", "unverified_provider"])
    );
  });
});

describe("payment, execution, and reputation", () => {
  it("requires complete live x402 proof fields before enabling live order creation", async () => {
    const capability = listCapabilities().find((item) => item.id === "pitchhawk");
    expect(capability).toBeDefined();
    const quote = createExecutionQuote({ capability: capability! });
    const partialLiveAdapter = createPaymentAdapter({
      GOATX402_API_URL: "https://example.x402.test",
      GOATX402_API_KEY: "key",
      GOATX402_API_SECRET: "secret",
      GOATX402_MERCHANT_ID: "merchant-id",
      GOAT_RECEIVING_WALLET: "0x0000000000000000000000000000000000000001",
      // Intentionally omit GOATX402_MERCHANT_NAME and GOATX402_ACCOUNT_EMAIL
      ENABLE_MOCK_X402: "false"
    });

    const partialRequirement = await partialLiveAdapter.createPaymentRequirement(quote, capability!);
    expect(partialRequirement.transaction.status).toBe("payment_required");
    expect(partialRequirement.message).toContain("Configure real x402 credentials");
    expect(partialRequirement.paymentRequiredHeader).toContain("\"protocol\":\"x402\"");
    expect(partialRequirement.transaction.paymentRequiredHeader).toContain("\"protocol\":\"x402\"");
  });

  it("enables local mock settlement only through the mock x402 adapter", async () => {
    const capability = listCapabilities().find((item) => item.id === "pitchhawk");
    expect(capability).toBeDefined();
    const quote = createExecutionQuote({ capability: capability! });

    const realAdapter = createPaymentAdapter({ ENABLE_MOCK_X402: "false" });
    await expect(
      realAdapter.settleMockPayment(quote, { paymentId: "demo-payment", txHash: "0xabc123" })
    ).rejects.toThrow("Mock x402 is disabled");

    const mockAdapter = createPaymentAdapter({ ENABLE_MOCK_X402: "true" });
    const settled = await mockAdapter.settleMockPayment(quote, {
      paymentId: "demo-payment",
      txHash: "0xabc123",
      capabilityId: "pitchhawk",
      amount: "0.10",
      token: "USDC",
      requesterWallet: quote.requesterWallet,
      chainId: 2345
    });

    expect(mockAdapter.mode).toBe("mock");
    expect(settled.status).toBe("payment_settled");
    expect(settled.x402PaymentId).toBe("demo-payment");
  });

  it("rejects mock settlement proof that is not bound to the transaction", async () => {
    const capability = listCapabilities().find((item) => item.id === "pitchhawk");
    expect(capability).toBeDefined();
    const quote = createExecutionQuote({
      capability: capability!,
      requesterWallet: "0x0000000000000000000000000000000000000001"
    });
    const mockAdapter = createPaymentAdapter({ ENABLE_MOCK_X402: "true" });

    await expect(
      mockAdapter.settleMockPayment(quote, {
        paymentId: "demo-payment",
        txHash: "0xabc123",
        capabilityId: "codewolf",
        amount: "0.10",
        token: "USDC",
        requesterWallet: quote.requesterWallet,
        chainId: 2345
      })
    ).rejects.toThrow("Payment proof capability mismatch");
  });

  it("blocks paid execution until payment is settled, then executes PitchHawk and logs reputation", () => {
    const capability = listCapabilities().find((item) => item.id === "pitchhawk");
    expect(capability).toBeDefined();

    const quote = createExecutionQuote({
      capability: capability!,
      requesterAgentId: "agent-demo",
      requesterWallet: "0x0000000000000000000000000000000000000001"
    });

    expect(quote.status).toBe("quoted");

    const paymentRequired = createPaymentRequiredResponse(quote, capability!);
    expect(paymentRequired.httpStatus).toBe(402);
    expect(paymentRequired.canExecute).toBe(false);

    const settled = markPaymentSettled(quote, {
      paymentId: "demo-payment",
      txHash: "0xabc123"
    });
    const output = executeCapability(capability!, {
      task: "Improve homepage",
      allowedContext: "ClawCompass routes capabilities",
      desiredTone: "direct"
    });

    const logger = createReputationLogger();
    const event = logger.record({
      capabilityId: capability!.id,
      brokerAgentId: "clawcompass",
      transactionId: settled.id,
      outcome: "success",
      contextSafetyPassed: true,
      paymentVerified: true,
      executionVerified: true
    });

    expect(settled.status).toBe("payment_settled");
    expect(output.headline).toContain("Stop guessing");
    expect(event.outcome).toBe("success");
    expect(event.onChainWritten).toBe(false);
    expect(event.writeStatus).toBe("pending_external_proof");
    expect(logger.getProfile("pitchhawk").successfulExecutions).toBe(1);
  });

  it("returns a structured SetupPilot onboarding diagnosis after settlement", () => {
    const capability = listCapabilities().find((item) => item.id === "setuppilot");
    expect(capability).toBeDefined();

    const output = executeCapability(capability!, {
      task: "Telegram pairing is confusing and I still need ERC-8004 and x402.",
      allowedContext: "Claw is running but Telegram does not respond."
    });

    expect(output).toMatchObject({
      phase: "x402_setup",
      requiresHumanConfirmation: true
    });
    expect("publicEvidenceToCapture" in output && output.publicEvidenceToCapture).toContain("Payment ID");
    expect(executeSetupPilot({ task: "register on mainnet", allowedContext: "" }).exactCommandOrPrompt).toContain(
      "After approval only"
    );
  });
});

describe("external proof status", () => {
  it("does not treat public identifiers as final submission proof", () => {
    const proof = getExternalProofStatus({
      CLAWUP_AGENT_ID: "clawcompass-broker",
      TELEGRAM_BOT_USERNAME: "goat_4_ai_bot",
      GOATX402_MERCHANT_ID: "ClawCompass",
      ERC8004_AGENT_ID: "123",
      ERC8004_SCAN_URL: "https://8004scan.io/agents?chain=2345"
    });

    expect(proof.status).toBe("blocked_external_actions_required");
    expect(proof.requiredProof.clawUp.status).toBe("ready");
    expect(proof.requiredProof.telegram.status).toBe("blocked");
    expect(proof.requiredProof.x402.status).toBe("blocked");
    expect(proof.requiredProof.erc8004.status).toBe("blocked");
  });

  it("marks external proof ready only when verification evidence is present", () => {
    const proof = getExternalProofStatus({
      CLAWUP_AGENT_ID: "clawcompass-broker",
      TELEGRAM_BOT_USERNAME: "goat_4_ai_bot",
      TELEGRAM_PAIRING_VERIFIED: "true",
      GOATX402_MERCHANT_ID: "ClawCompass",
      GOATX402_PAYMENT_PROOF_ID: "pay_123",
      GOATX402_SETTLEMENT_TX: "0xabc123",
      ERC8004_AGENT_ID: "123",
      ERC8004_REGISTRATION_TX: "0xdef456",
      ERC8004_SCAN_URL: "https://8004scan.io/agents/123?chain=2345"
    });

    expect(proof.status).toBe("ready_for_submission_evidence");
    expect(Object.values(proof.requiredProof).every((item) => item.status === "ready")).toBe(true);
  });
});
