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
  app.post("/webhooks/xendit", async (_req, reply) => {
    reply.status(503).send({
      error: "Xendit webhooks are disabled until signature verification is configured.",
    });
  });

  // POST /payments/webhooks/maya
  app.post("/webhooks/maya", async (_req, reply) => {
    reply.status(503).send({
      error: "Maya webhooks are disabled until signature verification is configured.",
    });
  });
}
