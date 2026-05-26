import type { CapabilityTransaction, ClawCompassStore } from "../types/domain.js";
import { findCapability } from "./store.js";

type TransactionInput = {
  store: ClawCompassStore;
  capabilityId: string;
  requesterAgentId?: string;
  requesterWallet?: string;
};

type SettlementInput = {
  store: ClawCompassStore;
  transactionId: string;
  paymentId: string;
  txHash?: string;
};

export function createTransaction(input: TransactionInput): CapabilityTransaction {
  const capability = findCapability(input.store, input.capabilityId);
  if (!capability) {
    throw new Error(`Capability not found: ${input.capabilityId}`);
  }

  const transaction: CapabilityTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    requesterAgentId: input.requesterAgentId,
    requesterWallet: input.requesterWallet,
    capabilityId: capability.id,
    merchantId: process.env.GOATX402_MERCHANT_ID ?? "pending-merchant",
    amount: capability.priceUsd.toFixed(2),
    token: capability.priceToken === "USDT" ? "USDT" : "USDC",
    status: capability.priceUsd > 0 ? "payment_required" : "quoted",
    paymentRequiredHeader:
      capability.priceUsd > 0
        ? `x402 amount=${capability.priceUsd.toFixed(2)} symbol=${capability.priceToken}`
        : undefined,
    createdAt: new Date().toISOString()
  };

  input.store.transactions.push(transaction);
  return transaction;
}

export function getTransaction(store: ClawCompassStore, transactionId: string): CapabilityTransaction {
  const transaction = store.transactions.find((item) => item.id === transactionId);
  if (!transaction) throw new Error(`Transaction not found: ${transactionId}`);
  return transaction;
}

export function markPaymentSettled(input: SettlementInput): CapabilityTransaction {
  const transaction = getTransaction(input.store, input.transactionId);
  transaction.status = "payment_settled";
  transaction.x402PaymentId = input.paymentId;
  transaction.txHash = input.txHash;
  transaction.settledAt = new Date().toISOString();
  return transaction;
}

export function markTransactionDelivered(
  store: ClawCompassStore,
  transactionId: string
): CapabilityTransaction {
  const transaction = getTransaction(store, transactionId);
  transaction.status = "delivered";
  transaction.deliveredAt = new Date().toISOString();
  return transaction;
}

export function markTransactionFailed(
  store: ClawCompassStore,
  transactionId: string,
  error: string
): CapabilityTransaction {
  const transaction = getTransaction(store, transactionId);
  transaction.status = "failed";
  transaction.error = error;
  return transaction;
}

export function assertPaymentVerified(transaction: CapabilityTransaction): void {
  if (transaction.amount !== "0.00" && transaction.status !== "payment_settled") {
    throw new Error("No verified x402 payment");
  }
}

export function isMockX402Enabled(): boolean {
  return process.env.ENABLE_MOCK_X402 === "true" || process.env.NODE_ENV === "test";
}

export async function createGoatX402Middleware() {
  const required = [
    "GOATX402_API_URL",
    "GOATX402_API_KEY",
    "GOATX402_API_SECRET",
    "GOATX402_MERCHANT_ID"
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing x402 env vars: ${missing.join(", ")}`);
  }

  const { GoatX402 } = await import("goatx402-sdk-server");
  const x402 = new GoatX402({
    apiUrl: process.env.GOATX402_API_URL,
    apiKey: process.env.GOATX402_API_KEY,
    apiSecret: process.env.GOATX402_API_SECRET,
    merchantId: process.env.GOATX402_MERCHANT_ID
  });

  return x402.middleware({ amount: "0.1", symbol: "USDC" });
}
