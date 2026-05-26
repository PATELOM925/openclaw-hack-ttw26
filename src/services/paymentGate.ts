import { nanoid } from "nanoid";
import type { CapabilityListing } from "../types/capability.js";
import type { CapabilityTransaction, PaymentRequiredResponse } from "../types/transaction.js";

const merchantId = "clawcompass-demo-merchant";

export function createExecutionQuote(input: {
  capability: CapabilityListing;
  requesterAgentId?: string;
  requesterWallet?: string;
}): CapabilityTransaction {
  return {
    id: `txn_${nanoid(10)}`,
    requesterAgentId: input.requesterAgentId,
    requesterWallet: input.requesterWallet,
    capabilityId: input.capability.id,
    merchantId,
    amount: input.capability.priceUsd.toFixed(2),
    token: input.capability.priceToken === "FREE" ? "FREE" : input.capability.priceToken,
    status: input.capability.priceUsd > 0 ? "awaiting_approval" : "quoted",
    createdAt: new Date().toISOString()
  };
}

export function createPaymentRequiredResponse(
  transaction: CapabilityTransaction,
  capability: CapabilityListing
): PaymentRequiredResponse {
  const header = buildPaymentRequiredHeader(transaction, capability);
  return {
    httpStatus: 402,
    canExecute: false,
    message: "Payment required before paid capability execution.",
    transaction: { ...transaction, status: "payment_required", paymentRequiredHeader: header },
    paymentRequiredHeader: header
  };
}

export function markPaymentSettled(
  transaction: CapabilityTransaction,
  payment: { paymentId: string; txHash: string }
): CapabilityTransaction {
  return {
    ...transaction,
    status: "payment_settled",
    x402PaymentId: payment.paymentId,
    txHash: payment.txHash,
    settledAt: new Date().toISOString()
  };
}

export function createTransactionStore() {
  const transactions = new Map<string, CapabilityTransaction>();
  return {
    save(transaction: CapabilityTransaction) {
      transactions.set(transaction.id, transaction);
      return transaction;
    },
    get(id: string) {
      return transactions.get(id);
    },
    list() {
      return Array.from(transactions.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  };
}

function buildPaymentRequiredHeader(
  transaction: CapabilityTransaction,
  capability: CapabilityListing
): string {
  return JSON.stringify({
    protocol: "x402",
    mode: "DIRECT",
    merchantId,
    capabilityId: capability.id,
    amount: transaction.amount,
    token: transaction.token,
    network: "goat-mainnet",
    chainId: 2345
  });
}
