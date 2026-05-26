import { GoatX402Client } from "goatx402-sdk-server";
import type { CapabilityListing } from "../types/capability.js";
import type { CapabilityTransaction, PaymentVerification } from "../types/transaction.js";
import {
  createPaymentBinding,
  createPaymentRequiredResponse,
  markPaymentSettled
} from "./paymentGate.js";

export type PaymentAdapterMode = "goatx402" | "mock";

export type PaymentEnvironment = Partial<{
  ENABLE_MOCK_X402: string;
  GOATX402_API_URL: string;
  GOATX402_API_KEY: string;
  GOATX402_API_SECRET: string;
  GOATX402_MERCHANT_ID: string;
  GOAT_RECEIVING_WALLET: string;
  GOATX402_MERCHANT_NAME: string;
  GOATX402_ACCOUNT_EMAIL: string;
}>;

export type PaymentSettlementProof = {
  paymentId: string;
  txHash: string;
  capabilityId: string;
  amount: string;
  token: string;
  requesterWallet?: string;
  chainId: number;
};

export type PaymentRequirement = {
  transaction: CapabilityTransaction;
  paymentRequiredHeader: string;
  message: string;
};

export type PaymentAdapter = {
  mode: PaymentAdapterMode;
  createPaymentRequirement(
    transaction: CapabilityTransaction,
    capability: CapabilityListing
  ): Promise<PaymentRequirement>;
  settleMockPayment(
    transaction: CapabilityTransaction,
    payment: PaymentSettlementProof
  ): Promise<CapabilityTransaction>;
  getPaymentStatus(transaction: CapabilityTransaction): Promise<PaymentVerification>;
};

export function createPaymentAdapter(env: PaymentEnvironment = process.env): PaymentAdapter {
  return env.ENABLE_MOCK_X402 === "true" ? createMockAdapter() : createGoatX402Adapter(env);
}

function createMockAdapter(): PaymentAdapter {
  return {
    mode: "mock",
    async createPaymentRequirement(transaction, capability) {
      const response = createPaymentRequiredResponse(transaction, capability);
      return {
        transaction: response.transaction,
        paymentRequiredHeader: response.paymentRequiredHeader,
        message: "Payment required before paid capability execution."
      };
    },
    async settleMockPayment(transaction, payment) {
      assertPaymentBound(transaction, payment);
      return markPaymentSettled(transaction, payment);
    },
    async getPaymentStatus(transaction) {
      return verificationForTransaction(transaction);
    }
  };
}

function createGoatX402Adapter(env: PaymentEnvironment): PaymentAdapter {
  return {
    mode: "goatx402",
    async createPaymentRequirement(transaction, capability) {
      if (!hasGoatX402Credentials(env) || !transaction.requesterWallet) {
        const response = createPaymentRequiredResponse(transaction, capability);
        return {
          transaction: response.transaction,
          paymentRequiredHeader: response.paymentRequiredHeader,
          message: "Payment required. Configure real x402 credentials and payer wallet to settle."
        };
      }

      const client = new GoatX402Client({
        baseUrl: env.GOATX402_API_URL!,
        apiKey: env.GOATX402_API_KEY!,
        apiSecret: env.GOATX402_API_SECRET!
      });
      const order = await client.createOrder({
        dappOrderId: transaction.id,
        chainId: 2345,
        tokenSymbol: transaction.token,
        fromAddress: transaction.requesterWallet,
        amountWei: usdToSixDecimalAtomic(transaction.amount)
      });
      const paymentRequiredHeader = JSON.stringify({
        protocol: "x402",
        mode: "DIRECT",
        merchantId: env.GOATX402_MERCHANT_ID,
        capabilityId: capability.id,
        orderId: order.orderId,
        amount: transaction.amount,
        token: transaction.token,
        network: "goat-mainnet",
        chainId: 2345
      });
      return {
        transaction: {
          ...transaction,
          status: "payment_required",
          x402PaymentId: order.orderId,
          paymentRequiredHeader,
          paymentBinding: createPaymentBinding(transaction, order.orderId)
        },
        paymentRequiredHeader,
        message: "Payment required. Complete the x402 order before execution."
      };
    },
    async settleMockPayment() {
      throw new Error("Mock x402 is disabled");
    },
    async getPaymentStatus(transaction) {
      if (!hasGoatX402Credentials(env) || !transaction.x402PaymentId) {
        return verificationForTransaction(transaction);
      }
      const client = new GoatX402Client({
        baseUrl: env.GOATX402_API_URL!,
        apiKey: env.GOATX402_API_KEY!,
        apiSecret: env.GOATX402_API_SECRET!
      });
      const proof = await client.getOrderStatus(transaction.x402PaymentId);
      assertLiveProofBound(transaction, proof);
      if (proof.status === "PAYMENT_CONFIRMED" || proof.status === "INVOICED") {
        return {
          status: "payment_settled",
          canExecute: true,
          reason: proof.status,
          txHash: proof.txHash,
          checkedAt: new Date().toISOString()
        };
      }
      return {
        status: mapOrderStatus(proof.status),
        canExecute: false,
        reason: proof.status,
        txHash: proof.txHash,
        checkedAt: new Date().toISOString()
      };
    }
  };
}

function hasGoatX402Credentials(env: PaymentEnvironment): boolean {
  return Boolean(
    env.GOATX402_API_URL &&
    env.GOATX402_API_KEY &&
    env.GOATX402_API_SECRET &&
    env.GOATX402_MERCHANT_ID &&
    env.GOATX402_MERCHANT_NAME &&
    env.GOATX402_ACCOUNT_EMAIL &&
    env.GOAT_RECEIVING_WALLET
  );
}

function usdToSixDecimalAtomic(amount: string): string {
  const [whole, fraction = ""] = amount.split(".");
  return `${whole}${fraction.padEnd(6, "0").slice(0, 6)}`.replace(/^0+(?=\d)/, "");
}

function assertPaymentBound(transaction: CapabilityTransaction, proof: PaymentSettlementProof): void {
  if (proof.capabilityId !== transaction.capabilityId) throw new Error("Payment proof capability mismatch");
  if (proof.amount !== transaction.amount) throw new Error("Payment proof amount mismatch");
  if (proof.token !== transaction.token) throw new Error("Payment proof token mismatch");
  if (proof.chainId !== 2345) throw new Error("Payment proof chain mismatch");
  if (transaction.requesterWallet && proof.requesterWallet && proof.requesterWallet !== transaction.requesterWallet) {
    throw new Error("Payment proof requester wallet mismatch");
  }
  if (transaction.status === "payment_settled" || transaction.status === "delivered") {
    throw new Error("Payment proof already used");
  }
  if (transaction.paymentBinding && Date.parse(transaction.paymentBinding.expiresAt) < Date.now()) {
    throw new Error("Payment proof expired");
  }
}

function assertLiveProofBound(transaction: CapabilityTransaction, proof: Awaited<ReturnType<GoatX402Client["getOrderStatus"]>>): void {
  if (proof.dappOrderId !== transaction.id) throw new Error("x402 order transaction mismatch");
  if (proof.chainId !== 2345) throw new Error("x402 order chain mismatch");
  if (proof.tokenSymbol !== transaction.token) throw new Error("x402 order token mismatch");
  if (proof.fromAddress && transaction.requesterWallet && proof.fromAddress !== transaction.requesterWallet) {
    throw new Error("x402 order requester wallet mismatch");
  }
}

function verificationForTransaction(transaction: CapabilityTransaction): PaymentVerification {
  if (transaction.token === "FREE") {
    return { status: "not_required", canExecute: true, reason: "free_capability", checkedAt: new Date().toISOString() };
  }
  if (transaction.status === "payment_settled" || transaction.status === "delivered" || transaction.status === "executing") {
    return {
      status: "payment_settled",
      canExecute: true,
      reason: "settled_transaction_state",
      txHash: transaction.txHash,
      checkedAt: new Date().toISOString()
    };
  }
  if (transaction.status === "failed") {
    return { status: "failed", canExecute: false, reason: transaction.error ?? "failed", checkedAt: new Date().toISOString() };
  }
  if (transaction.status === "cancelled") {
    return { status: "cancelled", canExecute: false, reason: "cancelled", checkedAt: new Date().toISOString() };
  }
  if (transaction.paymentBinding && Date.parse(transaction.paymentBinding.expiresAt) < Date.now()) {
    return { status: "expired", canExecute: false, reason: "payment_requirement_expired", checkedAt: new Date().toISOString() };
  }
  return {
    status: transaction.status === "payment_pending" ? "payment_pending" : "payment_required",
    canExecute: false,
    reason: transaction.x402PaymentId ? "awaiting_x402_settlement" : "payment_required",
    checkedAt: new Date().toISOString()
  };
}

function mapOrderStatus(status: string): PaymentVerification["status"] {
  if (status === "CHECKOUT_VERIFIED") return "payment_pending";
  if (status === "EXPIRED") return "expired";
  if (status === "CANCELLED") return "cancelled";
  if (status === "FAILED") return "failed";
  return "payment_required";
}
