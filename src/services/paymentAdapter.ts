import { GoatX402Client } from "goatx402-sdk-server";
import type { CapabilityListing } from "../types/capability.js";
import type { CapabilityTransaction } from "../types/transaction.js";
import {
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
}>;

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
    payment: { paymentId: string; txHash: string }
  ): Promise<CapabilityTransaction>;
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
      return markPaymentSettled(transaction, payment);
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
          paymentRequiredHeader
        },
        paymentRequiredHeader,
        message: "Payment required. Complete the x402 order before execution."
      };
    },
    async settleMockPayment() {
      throw new Error("Mock x402 is disabled");
    }
  };
}

function hasGoatX402Credentials(env: PaymentEnvironment): boolean {
  return Boolean(env.GOATX402_API_URL && env.GOATX402_API_KEY && env.GOATX402_API_SECRET);
}

function usdToSixDecimalAtomic(amount: string): string {
  const [whole, fraction = ""] = amount.split(".");
  return `${whole}${fraction.padEnd(6, "0").slice(0, 6)}`.replace(/^0+(?=\d)/, "");
}
