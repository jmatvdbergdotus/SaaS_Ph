import type { FastifyRequest, FastifyReply } from "fastify";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";

declare module "fastify" {
  interface FastifyRequest {
    authUser: User;
  }
}

function createAuthClient() {
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const authorization = req.headers.authorization;
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const { data, error } = await createAuthClient().auth.getUser(match[1]);

  if (error || !data.user) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  req.authUser = data.user;
  reply.header("Cache-Control", "private, no-store");
}
