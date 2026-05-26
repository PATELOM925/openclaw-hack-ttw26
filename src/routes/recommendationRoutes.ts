import type { Request, Response } from "express";
import { buildCapabilitySequence } from "../services/capabilitySequencer.js";
import { rankCapabilities } from "../services/capabilityRanker.js";
import { sanitizeContext } from "../services/contextSanitizer.js";
import { evaluateGuardrails, getSecurityPolicy } from "../services/guardrails.js";
import { listCapabilities, findCapability } from "../services/marketplace.js";
import type { PaymentAdapter } from "../services/paymentAdapter.js";
import { createExecutionQuote, createTransactionStore } from "../services/paymentGate.js";
import { analyzeTaskWithLLM } from "../services/taskAnalyzer.js";
import { buyerProfile, purchaseInstructions, selectBuyerRecommendations } from "../services/buyerFlow.js";

export function sendCapability(request: Request, response: Response) {
  const capability = findCapability(request.params.id);
  if (!capability) return response.status(404).json({ error: "capability_not_found" });
  return response.json({ capability });
}

export async function sendRecommendations(request: Request, response: Response) {
  const analysis = await analyzeTaskWithLLM(request.body);
  const secureContext = sanitizeContext(analysis.originalTask, request.body.context ?? "");
  const capabilities = listCapabilities();
  response.json({
    analysis: { ...analysis, sensitivity: secureContext.sensitivity, detectedSecrets: secureContext.detectedSecrets },
    secureContext,
    recommendations: rankCapabilities(analysis, secureContext, capabilities).slice(0, 3),
    sequence: buildCapabilitySequence(analysis, capabilities)
  });
}

export async function createBuyerIntent(
  request: Request,
  response: Response,
  transactions: ReturnType<typeof createTransactionStore>,
  paymentAdapter: PaymentAdapter
) {
  const analysis = await analyzeTaskWithLLM(request.body);
  const secureContext = sanitizeContext(analysis.originalTask, request.body.context ?? "");
  const capabilities = listCapabilities();
  const buyer = buyerProfile(request.body);
  const ranked = rankCapabilities(analysis, secureContext, capabilities);
  const recommendations = selectBuyerRecommendations(ranked, buyer).slice(0, 3);
  const sequence = buildCapabilitySequence(analysis, capabilities);
  const selectedCapability = recommendations[0]?.capability;
  if (!selectedCapability) return response.status(422).json({ error: "no_buyable_capability" });

  const guardrail = evaluateGuardrails({
    capability: selectedCapability,
    policy: getSecurityPolicy(),
    requestedAmountUsd: selectedCapability.priceUsd,
    secureContext
  });
  const transaction = transactions.save(
    createExecutionQuote({ capability: selectedCapability, ...request.body, approvalRequired: guardrail.approvalRequired })
  );
  const responseBase = {
    role: "buyer",
    buyer,
    analysis: { ...analysis, sensitivity: secureContext.sensitivity, detectedSecrets: secureContext.detectedSecrets },
    secureContext,
    recommendations,
    sequence,
    selectedCapability,
    guardrail
  };

  if (selectedCapability.priceUsd > 0 && !guardrail.approvalRequired) {
    return paymentAdapter
      .createPaymentRequirement(transaction, selectedCapability)
      .then((requirement) => response.status(202).json({
        ...responseBase,
        transaction: transactions.save(requirement.transaction),
        paymentRequiredHeader: requirement.paymentRequiredHeader,
        purchaseInstructions: purchaseInstructions({
          transaction: requirement.transaction,
          approvalRequired: false,
          priceUsd: selectedCapability.priceUsd
        })
      }))
      .catch(() => response.status(502).json({ error: "x402_payment_requirement_failed" }));
  }

  return response.status(202).json({
    ...responseBase,
    transaction,
    purchaseInstructions: purchaseInstructions({
      transaction,
      approvalRequired: guardrail.approvalRequired,
      priceUsd: selectedCapability.priceUsd
    })
  });
}
