// Lalamove API v3 client stub
// Docs: https://developers.lalamove.com/
export const lalamoveClient = {
  async getQuotation(payload: {
    pickupAddress: string;
    dropoffAddress: string;
    serviceType: string;
  }) {
    // TODO: implement HMAC-signed request to Lalamove /v3/quotations
    return { quotationId: "", totalFee: { amount: "0", currency: "PHP" } };
  },
  async placeOrder(quotationId: string, _details: Record<string, unknown>) {
    // TODO: implement POST /v3/orders
    return { orderId: "", shareLink: "" };
  },
};
