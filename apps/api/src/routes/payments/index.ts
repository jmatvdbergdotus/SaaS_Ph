import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth";

export async function paymentsRoutes(app: FastifyInstance) {
  // POST /payments/reconcile  (manual OCR match confirmation)
  app.post("/reconcile", { preHandler: requireAuth }, async (req, reply) => {
    // body: { orderId, amount, referenceNumber, paymentMethod }
    // TODO: paymentService.manualReconcile(...)
    reply.send({ success: true });
  });

  // POST /payments/webhooks/xendit
  app.post("/webhooks/xendit", async (req, reply) => {
    // TODO: verify HMAC signature then paymentService.processXenditWebhook(req.body)
    reply.send({ received: true });
  });

  // POST /payments/webhooks/maya
  app.post("/webhooks/maya", async (req, reply) => {
    // TODO: verify signature then paymentService.processMayaWebhook(req.body)
    reply.send({ received: true });
  });
}
