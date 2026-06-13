import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth";

export async function ordersRoutes(app: FastifyInstance) {
  // GET /orders
  app.get("/", { preHandler: requireAuth }, async (req, reply) => {
    // TODO: orderService.listOrders(req.user.storeId)
    reply.send({ orders: [] });
  });

  // POST /orders
  app.post("/", { preHandler: requireAuth }, async (req, reply) => {
    // TODO: orderService.createOrder(req.user.storeId, req.body)
    reply.status(201).send({ order: {} });
  });

  // GET /orders/:id
  app.get("/:id", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    // TODO: orderService.getOrder(id, req.user.storeId)
    reply.send({ order: { id } });
  });

  // PATCH /orders/:id
  app.patch("/:id", { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    // TODO: orderService.updateOrder(id, req.body)
    reply.send({ order: { id } });
  });
}
