// GrabExpress API client stub
export const grabExpressClient = {
  async getDeliveryQuote(_payload: unknown) {
    // TODO: implement GrabExpress quote endpoint
    return { quotes: [] };
  },
  async createDelivery(_payload: unknown) {
    // TODO: implement delivery creation
    return { deliveryID: "", trackingURL: "" };
  },
};
