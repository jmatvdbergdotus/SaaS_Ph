import type { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.post("/otp/request", async (_req, reply) => {
    reply.status(501).send({
      error: "Phone OTP sign-in is not configured. Use Supabase Auth before enabling this endpoint.",
    });
  });

  app.post("/otp/verify", async (_req, reply) => {
    reply.status(501).send({
      error: "Phone OTP sign-in is not configured. No access token was issued.",
    });
  });
}
