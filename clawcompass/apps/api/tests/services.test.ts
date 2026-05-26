import { describe, expect, test } from "vitest";
import { analyzeTask } from "../src/services/taskAnalyzer.js";
import { sanitizeContext } from "../src/services/contextSanitizer.js";
import { rankCapabilities } from "../src/services/capabilityRanker.js";
import { evaluateGuardrails } from "../src/services/guardrails.js";
import { executePitchHawk, executeSetupPilot } from "../src/services/executor.js";
import { createInitialStore } from "../src/services/store.js";
import { createTransaction, markPaymentSettled } from "../src/services/x402PaymentGate.js";
import { logReputationEvent } from "../src/services/reputationLogger.js";

describe("ClawCompass services", () => {
  test("classifies homepage pitch work as copywriting with low risk", () => {
    const analysis = analyzeTask({
      task: "Improve my homepage pitch and CTA for an AI agent capability broker",
      budgetUsd: 0.1
    });

    expect(analysis.taskType).toBe("copywriting");
    expect(analysis.requiredCapabilities).toContain("copywriting");
    expect(analysis.riskTolerance).toBe("low");
  });

  test("redacts secrets before capability routing", () => {
    const secureContext = sanitizeContext({
      task: "Improve homepage copy",
      context: "Project: ClawCompass. API_KEY=sk-demo12345678900000000000 email om@example.com"
    });

    expect(secureContext.allowedContext).not.toContain("sk-demo");
    expect(secureContext.allowedContext).not.toContain("om@example.com");
    expect(secureContext.detectedSecrets).toEqual(
      expect.arrayContaining(["OpenAI-like API key", ".env assignment", "Email"])
    );
    expect(secureContext.approvalRequired).toBe(true);
  });

  test("ranks PitchHawk first for landing page copy within budget", () => {
    const store = createInitialStore();
    const analysis = analyzeTask({
      task: "Write landing page headline and CTA for my pitch",
      budgetUsd: 0.1
    });
    const recommendations = rankCapabilities(store.capabilities, analysis, 0.1);

    expect(recommendations[0].capability.id).toBe("pitchhawk");
    expect(recommendations[0].reasons.join(" ")).toContain("within budget");
  });

  test("classifies ClawUp setup work as onboarding", () => {
    const analysis = analyzeTask({
      task: "I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402."
    });

    expect(analysis.taskType).toBe("onboarding");
    expect(analysis.requiredCapabilities).toEqual(
      expect.arrayContaining(["clawup_setup", "telegram_pairing", "erc8004", "x402"])
    );
  });

  test("ranks SetupPilot first for ClawUp Telegram ERC-8004 x402 onboarding", () => {
    const store = createInitialStore();
    const analysis = analyzeTask({
      task: "I am stuck setting up my ClawUp hackathon agent. Telegram pairing is confusing and I still need ERC-8004 and x402.",
      budgetUsd: 0.1
    });
    const recommendations = rankCapabilities(store.capabilities, analysis, 0.1);

    expect(recommendations[0].capability.id).toBe("setuppilot");
    expect(recommendations[0].reasons.join(" ")).toContain("within budget");
  });

  test("redacts onboarding secrets including bot tokens and private keys", () => {
    const botToken = `123456789:${"ABCdefGhIJKlmNoPQRstuVWXyz"}`;
    const privateKey = `0x${"a".repeat(64)}`;
    const apiSecretAssignment = `GOATX402_${"API_SECRET"}=secret-demo`;
    const secureContext = sanitizeContext({
      task: "Help me set up ClawUp",
      context: `TELEGRAM_${"BOT_TOKEN"}=${botToken} PRIVATE_KEY=${privateKey} ${apiSecretAssignment}`
    });

    expect(secureContext.allowedContext).not.toContain("123456789:ABC");
    expect(secureContext.allowedContext).not.toContain("0xaaaaaaaa");
    expect(secureContext.allowedContext).not.toContain("secret-demo");
    expect(secureContext.detectedSecrets).toEqual(
      expect.arrayContaining(["Telegram bot token", "Private key", ".env assignment"])
    );
  });

  test("requires approval for high-risk repository write requests", () => {
    const store = createInitialStore();
    const capability = store.capabilities.find((item) => item.id === "githubhelper");
    if (!capability) throw new Error("githubhelper seed missing");

    const decision = evaluateGuardrails({
      capability,
      task: "Rewrite my repo and push changes to GitHub",
      sessionPaidExecutions: 0
    });

    expect(decision.allowed).toBe(false);
    expect(decision.approvalCode).toBe("APPROVE_WRITE");
    expect(decision.reasons).toContain("Requires external write access");
  });

  test("blocks unpaid paid execution and allows mock-settled execution", () => {
    const store = createInitialStore();
    const transaction = createTransaction({
      store,
      capabilityId: "pitchhawk",
      requesterAgentId: "agent-demo"
    });

    expect(() => executePitchHawk({ store, transactionId: transaction.id })).toThrow(
      "No verified x402 payment"
    );

    const settled = markPaymentSettled({
      store,
      transactionId: transaction.id,
      paymentId: "mock-payment-1",
      txHash: "mock-tx-1"
    });
    const result = executePitchHawk({
      store,
      transactionId: settled.id,
      input: {
        projectSummary: "ClawCompass helps agents choose and pay for trusted capabilities.",
        targetUser: "agent builders",
        desiredTone: "direct"
      }
    });

    expect(result.headline).toContain("Stop guessing");
    expect(result.confidenceScore).toBeGreaterThan(0.8);
  });

  test("blocks unpaid SetupPilot execution and returns onboarding diagnosis after settlement", () => {
    const store = createInitialStore();
    const transaction = createTransaction({
      store,
      capabilityId: "setuppilot",
      requesterAgentId: "agent-demo"
    });

    expect(() => executeSetupPilot({ store, transactionId: transaction.id })).toThrow(
      "No verified x402 payment"
    );

    const settled = markPaymentSettled({
      store,
      transactionId: transaction.id,
      paymentId: "mock-payment-setup",
      txHash: "mock-tx-setup"
    });
    const result = executeSetupPilot({
      store,
      transactionId: settled.id,
      input: {
        task: "Telegram pairing is confusing and I still need ERC-8004 and x402.",
        context: "Claw is running but Telegram does not respond."
      }
    });

    expect(result.phase).toBe("telegram_pairing");
    expect(result.detectedBlocker).toContain("pairing");
    expect(result.requiredHumanConfirmation).toBe("none");
    expect(result.publicEvidenceToCapture).toContain("Telegram bot username");
    expect(result.stopConditions).toContain("Do not paste bot tokens, private keys, or x402 secrets into chat.");
  });

  test("requires approval for mainnet registration with private-key context", () => {
    const store = createInitialStore();
    const capability = store.capabilities.find((item) => item.id === "setuppilot");
    if (!capability) throw new Error("setuppilot seed missing");

    const decision = evaluateGuardrails({
      capability,
      task: "Register on mainnet now using this private key",
      sessionPaidExecutions: 0
    });

    expect(decision.allowed).toBe(false);
    expect(decision.approvalCode).toBe("APPROVE_ONCHAIN");
    expect(decision.reasons).toContain("Mainnet or wallet action requires explicit approval");
  });

  test("updates reputation after successful paid execution", () => {
    const store = createInitialStore();
    const before = store.capabilities.find((item) => item.id === "pitchhawk");
    if (!before) throw new Error("pitchhawk seed missing");

    const event = logReputationEvent({
      store,
      capabilityId: "pitchhawk",
      transactionId: "tx-demo",
      outcome: "success",
      contextSafetyPassed: true,
      paymentVerified: true,
      executionVerified: true
    });
    const after = store.capabilities.find((item) => item.id === "pitchhawk");

    expect(event.outcome).toBe("success");
    expect(after?.usageCount).toBe(before.usageCount + 1);
    expect(after?.trustScore).toBeGreaterThan(before.trustScore);
  });
});
