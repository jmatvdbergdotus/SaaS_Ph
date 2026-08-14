import { resolve } from "path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: resolve(__dirname, "../../../.env") });

function optionalEnv<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional()
  );
}

const envSchema = z.object({
  NODE_ENV:                z.enum(["development", "test", "production"]).default("development"),
  PORT:                    z.coerce.number().default(3001),
  APP_URL:                 z.string().url().default("http://localhost:3000"),
  API_URL:                 z.string().url().default("http://localhost:3001"),
  SUPABASE_URL:            z.string().url(),
  SUPABASE_ANON_KEY:       z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: optionalEnv(z.string().min(1)),
  INTEGRATION_TOKEN_ENCRYPTION_KEY: optionalEnv(z.string().min(1)),
  REDIS_URL:               z.string().default("redis://localhost:6379"),
  XENDIT_SECRET_KEY:       optionalEnv(z.string().min(1)),
  XENDIT_WEBHOOK_TOKEN:    optionalEnv(z.string().min(1)),
  MAYA_SECRET_KEY:         optionalEnv(z.string().min(1)),
  MAYA_WEBHOOK_SECRET:     optionalEnv(z.string().min(1)),
  SEMAPHORE_API_KEY:       optionalEnv(z.string().min(1)),
  ANTHROPIC_API_KEY:       optionalEnv(z.string().min(1)),
  META_GRAPH_API_VERSION:  z.string().regex(/^v\d+\.\d+$/).default("v25.0"),
  FACEBOOK_APP_ID:         optionalEnv(z.string().min(1)),
  FACEBOOK_APP_SECRET:     optionalEnv(z.string().min(1)),
  FACEBOOK_VERIFY_TOKEN:   optionalEnv(z.string().min(16)),
  FACEBOOK_OAUTH_SCOPES:   z.string().default(
    "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging"
  ),
  INSTAGRAM_APP_ID:        optionalEnv(z.string().min(1)),
  INSTAGRAM_APP_SECRET:    optionalEnv(z.string().min(1)),
  INSTAGRAM_OAUTH_SCOPES:  z.string().default(
    "pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages"
  ),
  TIKTOK_APP_KEY:          optionalEnv(z.string().min(1)),
  TIKTOK_APP_SECRET:       optionalEnv(z.string().min(1)),
  TIKTOK_SERVICE_ID:       optionalEnv(z.string().min(1)),
  TIKTOK_AUTH_BASE_URL:    z.string().url().default("https://services.tiktokshop.com"),
  TIKTOK_API_BASE_URL:     z.string().url().default("https://open-api.tiktokglobalshop.com"),
  WOOCOMMERCE_APP_NAME:    z.string().min(1).max(50).default("Sari-SaaS Hub"),
  WOOCOMMERCE_AUTH_SCOPE:  z.enum(["read", "write", "read_write"]).default("read_write"),
  SHOPIFY_CLIENT_ID:       optionalEnv(z.string().min(1)),
  SHOPIFY_CLIENT_SECRET:   optionalEnv(z.string().min(1)),
  SHOPIFY_API_VERSION:     z.string().regex(/^\d{4}-\d{2}$/).default("2026-07"),
  SHOPIFY_SCOPES:          z.string().default(
    "read_orders,read_products,read_inventory,read_locations"
  ),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
