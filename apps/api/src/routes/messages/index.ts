import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth";

export async function messagesRoutes(app: FastifyInstance) {
  // GET /messages  (unified feed)
  app.get("/", { preHandler: requireAuth }, async (_req, reply) => {
    // TODO: messageService.getUnifiedFeed(req.user.storeId)
    reply.send({ threads: [] });
  });

  // POST /messages/:threadId/reply
  app.post("/:threadId/reply", { preHandler: requireAuth }, async (req, reply) => {
    const { threadId } = req.params as { threadId: string };
    // TODO: messageService.sendReply(threadId, req.body.text)
    reply.send({ sent: true, threadId });
  });
}
