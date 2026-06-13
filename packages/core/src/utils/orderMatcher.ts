import type { Order } from "../types/order";
import type { OcrExtractedPayment, ReconciliationResult } from "../types/payment";

/**
 * Fuzzy-match an OCR-extracted payment against a list of open orders.
 * Returns matched orderId and confidence score (0–1).
 */
export function matchPaymentToOrder(
  extracted: OcrExtractedPayment,
  openOrders: Order[]
): ReconciliationResult {
  if (!extracted.amount || openOrders.length === 0) {
    return { matched: false, confidence: 0 };
  }

  const candidates = openOrders
    .filter((o) => o.status === "PENDING_PAYMENT")
    .map((order) => {
      let score = 0;

      // Amount match (exact = 0.7, within 1 peso = 0.5)
      const amountDiff = Math.abs(order.totalAmount - extracted.amount!);
      if (amountDiff === 0) score += 0.7;
      else if (amountDiff <= 1) score += 0.5;
      else if (amountDiff <= 5) score += 0.2;

      // Reference number match
      if (
        extracted.referenceNumber &&
        order.paymentReference &&
        order.paymentReference === extracted.referenceNumber
      ) {
        score += 0.3;
      }

      return { orderId: order.id, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return { matched: false, confidence: 0 };
  }

  const best = candidates[0];
  return {
    matched: best.score >= 0.7,
    orderId: best.score >= 0.7 ? best.orderId : undefined,
    confidence: best.score,
    candidateOrders: candidates.slice(0, 3),
  };
}
