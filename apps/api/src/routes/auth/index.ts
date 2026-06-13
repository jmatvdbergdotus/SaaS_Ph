import type { FastifyInstance } from "fastify";
import { z } from "zod";

const requestOtpSchema = z.object({ phoneNumber: z.string().regex(/^\+639\d{9}$/) });
const verifyOtpSchema  = z.object({ phoneNumber: z.string(), otp: z.string().length(6) });

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/otp/request
  app.post("/otp/request", async (req, reply) => {
    const { phoneNumber } = requestOtpSchema.parse(req.body);
    // TODO: call authService.sendOtp(phoneNumber)
    reply.send({ message: "OTP sent", expiresIn: 300 });
  });

  // POST /auth/otp/verify
  app.post("/otp/verify", async (req, reply) => {
    const { phoneNumber, otp } = verifyOtpSchema.parse(req.body);
    // TODO: call authService.verifyOtp(phoneNumber, otp) => { user, store }
    const token = app.jwt.sign({ phoneNumber, sub: "user-id-placeholder" });
    reply.send({ token, user: { phoneNumber } });
  });
}
