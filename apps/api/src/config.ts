import { z } from "zod";

const envSchema = z.object({
  NODE_ENV:                z.enum(["development", "test", "production"]).default("development"),
  PORT:                    z.coerce.number().default(3001),
  APP_URL:                 z.string().url().default("http://localhost:3000"),
  SUPABASE_URL:            z.string().url(),
  SUPABASE_ANON_KEY:       z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  REDIS_URL:               z.string().default("redis://localhost:6379"),
  XENDIT_SECRET_KEY:       z.string().optional(),
  XENDIT_WEBHOOK_TOKEN:    z.string().optional(),
  MAYA_SECRET_KEY:         z.string().optional(),
  MAYA_WEBHOOK_SECRET:     z.string().optional(),
  SEMAPHORE_API_KEY:       z.string().optional(),
  ANTHROPIC_API_KEY:       z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
