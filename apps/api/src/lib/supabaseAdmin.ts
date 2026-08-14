import { createClient } from "@supabase/supabase-js";
import { config } from "../config";

const client = config.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export function getSupabaseAdmin() {
  if (!client) {
    throw new Error("The Supabase service role is not configured");
  }

  return client;
}
