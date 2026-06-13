import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth";

export async function logisticsRoutes(app: FastifyInstance) {
  // POST /logistics/quotes
  app.post("/quotes", { preHandler: requireAuth }, async (req, reply) => {
    // body: { orderId, pickupAddress, dropoffAddress }
    // TODO: logisticsService.fetchQuotes(...)
    reply.send({ quotes: [] });
  });

  // POST /logistics/book
  app.post("/book", { preHandler: requireAuth }, async (req, reply) => {
    // body: { orderId, provider, quoteId }
    // TODO: logisticsService.bookRider(...)
    reply.send({ shipment: {} });
  });
}
