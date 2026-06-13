import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth";

export async function syncRoutes(app: FastifyInstance) {
  // POST /sync/delta  — upload pending offline changes
  app.post("/delta", { preHandler: requireAuth }, async (req, reply) => {
    // body: { events: SyncEvent[] }
    // TODO: syncService.processDelta(req.user.storeId, req.body.events)
    reply.send({ processed: 0, errors: [] });
  });
}
