export type PaymentProvider = "XENDIT" | "MAYA" | "GCASH_DIRECT";

export interface PaymentWebhookPayload {
  provider: PaymentProvider;
  referenceNumber: string;
  amount: number;
  currency: "PHP";
  timestamp: string;
  merchantId?: string;
  rawPayload: Record<string, unknown>;
}

export interface OcrExtractedPayment {
  referenceNumber?: string;
  amount?: number;
  timestamp?: string;
  provider?: "GCASH" | "MAYA";
  confidence: number;
}

export interface ReconciliationResult {
  matched: boolean;
  orderId?: string;
  confidence: number;
  candidateOrders?: Array<{ orderId: string; score: number }>;
}
