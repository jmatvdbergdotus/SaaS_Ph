import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth";

export async function inventoryRoutes(app: FastifyInstance) {
  app.get("/",    { preHandler: requireAuth }, async (_req, reply) => { reply.send({ items: [] }); });
  app.post("/",   { preHandler: requireAuth }, async (_req, reply) => { reply.status(201).send({ item: {} }); });
  app.patch("/:id",{ preHandler: requireAuth }, async (req, reply) => { reply.send({ item: {} }); });
  app.delete("/:id",{ preHandler: requireAuth }, async (req, reply) => { reply.send({ deleted: true }); });
}
