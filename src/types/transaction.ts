export type CapabilityTransactionStatus =
  | "quoted"
  | "awaiting_approval"
  | "payment_required"
  | "payment_pending"
  | "payment_settled"
  | "executing"
  | "delivered"
  | "failed"
  | "cancelled";

export type CapabilityTransaction = {
  id: string;
  requesterAgentId?: string;
  requesterWallet?: string;
  capabilityId: string;
  merchantId: string;
  amount: string;
  token: "USDC" | "USDT" | "FREE";
  status: CapabilityTransactionStatus;
  x402PaymentId?: string;
  txHash?: string;
  paymentRequiredHeader?: string;
  error?: string;
  createdAt: string;
  settledAt?: string;
  deliveredAt?: string;
};

export type PaymentRequiredResponse = {
  httpStatus: 402;
  canExecute: false;
  message: string;
  transaction: CapabilityTransaction;
  paymentRequiredHeader: string;
};
