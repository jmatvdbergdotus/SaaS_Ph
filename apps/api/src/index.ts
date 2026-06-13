import Fastify from "fastify";
import { config } from "./config";

const app = Fastify({ logger: true });

// ── Plugins ─────────────────────────────────────────────────────────────────
async function registerPlugins() {
  const cors = await import("@fastify/cors");
  const jwt  = await import("@fastify/jwt");
  const rateLimit = await import("@fastify/rate-limit");

  await app.register(cors.default, {
    origin: [config.APP_URL, /\.pages\.dev$/],
    credentials: true,
  });

  await app.register(jwt.default, {
    secret: config.JWT_SECRET,
  });

  await app.register(rateLimit.default, {
    max: 100,
    timeWindow: "1 minute",
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────
async function registerRoutes() {
  const { authRoutes }      = await import("./routes/auth/index.js");
  const { ordersRoutes }    = await import("./routes/orders/index.js");
  const { paymentsRoutes }  = await import("./routes/payments/index.js");
  const { messagesRoutes }  = await import("./routes/messages/index.js");
  const { inventoryRoutes } = await import("./routes/inventory/index.js");
  const { logisticsRoutes } = await import("./routes/logistics/index.js");
  const { syncRoutes }      = await import("./routes/sync/index.js");

  app.register(authRoutes,      { prefix: "/auth" });
  app.register(ordersRoutes,    { prefix: "/orders" });
  app.register(paymentsRoutes,  { prefix: "/payments" });
  app.register(messagesRoutes,  { prefix: "/messages" });
  app.register(inventoryRoutes, { prefix: "/inventory" });
  app.register(logisticsRoutes, { prefix: "/logistics" });
  app.register(syncRoutes,      { prefix: "/sync" });

  app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));
}

async function start() {
  await registerPlugins();
  await registerRoutes();
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
