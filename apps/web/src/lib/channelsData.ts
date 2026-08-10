import { supabase } from "./supabase";

export type ChannelProvider = "FACEBOOK" | "INSTAGRAM" | "TIKTOK_SHOP" | "RAKET_PH";
export type ChannelStatus = "DISCONNECTED" | "PENDING" | "CONNECTED" | "MANUAL" | "ERROR";

export interface ChannelIntegration {
  id: string;
  provider: ChannelProvider;
  status: ChannelStatus;
  externalAccountName: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
}

export interface ChannelData {
  authState: "ready" | "unauthenticated" | "needs_onboarding";
  storeId: string | null;
  integrations: ChannelIntegration[];
}

export async function loadChannelData(): Promise<ChannelData> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError || !userResult.user) {
    return { authState: "unauthenticated", storeId: null, integrations: [] };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("store_id")
    .eq("id", userResult.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.store_id) {
    return { authState: "needs_onboarding", storeId: null, integrations: [] };
  }

  const { data, error } = await supabase
    .from("store_integrations")
    .select("id,provider,status,external_account_name,connected_at,last_sync_at,error_message")
    .eq("store_id", profile.store_id);

  if (error) throw error;

  return {
    authState: "ready",
    storeId: profile.store_id,
    integrations: (data ?? [])
      .filter((integration) => isProvider(integration.provider) && isStatus(integration.status))
      .map((integration) => ({
        id: integration.id,
        provider: integration.provider as ChannelProvider,
        status: integration.status as ChannelStatus,
        externalAccountName: integration.external_account_name,
        connectedAt: integration.connected_at,
        lastSyncAt: integration.last_sync_at,
        errorMessage: integration.error_message,
      })),
  };
}

export async function setRaketManualTracking(
  storeId: string,
  integration: ChannelIntegration | undefined,
  enabled: boolean
): Promise<ChannelIntegration> {
  const status: ChannelStatus = enabled ? "MANUAL" : "DISCONNECTED";
  const query = integration
    ? supabase
        .from("store_integrations")
        .update({ status })
        .eq("id", integration.id)
        .eq("store_id", storeId)
        .eq("provider", "RAKET_PH")
    : supabase
        .from("store_integrations")
        .insert({ store_id: storeId, provider: "RAKET_PH", status });

  const { data, error } = await query
    .select("id,provider,status,external_account_name,connected_at,last_sync_at,error_message")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    provider: data.provider as ChannelProvider,
    status: data.status as ChannelStatus,
    externalAccountName: data.external_account_name,
    connectedAt: data.connected_at,
    lastSyncAt: data.last_sync_at,
    errorMessage: data.error_message,
  };
}

function isProvider(value: string): value is ChannelProvider {
  return ["FACEBOOK", "INSTAGRAM", "TIKTOK_SHOP", "RAKET_PH"].includes(value);
}

function isStatus(value: string): value is ChannelStatus {
  return ["DISCONNECTED", "PENDING", "CONNECTED", "MANUAL", "ERROR"].includes(value);
}
