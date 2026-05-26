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

export type PaymentBinding = {
  transactionId: string;
  capabilityId: string;
  amount: string;
  token: "USDC" | "USDT" | "FREE";
  requesterWallet?: string;
  chainId: number;
  expiresAt: string;
  idempotencyKey: string;
  orderId?: string;
};

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
  paymentBinding?: PaymentBinding;
  error?: string;
  createdAt: string;
  settledAt?: string;
  deliveredAt?: string;
};

export type PaymentVerificationStatus =
  | "not_required"
  | "payment_required"
  | "payment_pending"
  | "payment_settled"
  | "failed"
  | "expired"
  | "cancelled";

export type PaymentVerification = {
  status: PaymentVerificationStatus;
  canExecute: boolean;
  reason: string;
  txHash?: string;
  checkedAt: string;
};

export type PaymentRequiredResponse = {
  httpStatus: 402;
  canExecute: false;
  message: string;
  transaction: CapabilityTransaction;
  paymentRequiredHeader: string;
};
