import { supabase } from "./supabase";

export type ChannelProvider =
  | "FACEBOOK"
  | "INSTAGRAM"
  | "TIKTOK_SHOP"
  | "WOOCOMMERCE"
  | "SHOPIFY";
export type ChannelStatus = "DISCONNECTED" | "PENDING" | "CONNECTED" | "ERROR";

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

export interface ChannelAccount {
  id: string;
  name: string;
}

export interface ProviderAvailability {
  configured: boolean;
  mode: "OAUTH" | "STORE_AUTH";
}

export type ProviderAvailabilityMap = Record<ChannelProvider, ProviderAvailability>;

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

export async function loadProviderAvailability(): Promise<ProviderAvailabilityMap> {
  const response = await authenticatedApiRequest<{
    providers: ProviderAvailabilityMap;
  }>("/channels/providers");
  return response.providers;
}

export async function beginChannelConnection(
  provider: ChannelProvider,
  storeUrl?: string
): Promise<string> {
  const usesStoreAuthorization = provider === "WOOCOMMERCE" || provider === "SHOPIFY";
  const response = await authenticatedApiRequest<{ authorizationUrl: string }>(
    `/channels/${providerSlug(provider)}/connect`,
    {
      method: "POST",
      ...(usesStoreAuthorization ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl }),
      } : {}),
    }
  );
  const authorizationUrl = new URL(response.authorizationUrl);
  if (authorizationUrl.protocol !== "https:") {
    throw new Error("The channel returned an invalid authorization address");
  }
  return authorizationUrl.toString();
}

export async function loadAvailableChannelAccounts(
  provider: ChannelProvider
): Promise<ChannelAccount[]> {
  if (!isSocialProvider(provider)) return [];
  const response = await authenticatedApiRequest<{ accounts: ChannelAccount[] }>(
    `/channels/${providerSlug(provider)}/accounts`
  );
  return response.accounts;
}

export async function selectChannelAccount(provider: ChannelProvider, accountId: string) {
  if (!isSocialProvider(provider)) throw new Error("This provider does not use account selection");
  await authenticatedApiRequest(`/channels/${providerSlug(provider)}/select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId }),
  });
}

export async function disconnectChannel(provider: ChannelProvider) {
  await authenticatedApiRequest(`/channels/${providerSlug(provider)}`, {
    method: "DELETE",
  });
}

function isProvider(value: string): value is ChannelProvider {
  return ["FACEBOOK", "INSTAGRAM", "TIKTOK_SHOP", "WOOCOMMERCE", "SHOPIFY"].includes(value);
}

function isStatus(value: string): value is ChannelStatus {
  return ["DISCONNECTED", "PENDING", "CONNECTED", "ERROR"].includes(value);
}

function isSocialProvider(provider: ChannelProvider): boolean {
  return provider === "FACEBOOK" || provider === "INSTAGRAM" || provider === "TIKTOK_SHOP";
}

function providerSlug(provider: ChannelProvider): string {
  return provider === "TIKTOK_SHOP" ? "tiktok" : provider.toLowerCase();
}

async function authenticatedApiRequest<T = Record<string, never>>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Your session has expired");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const response = await fetch(new URL(path, apiUrl), {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${data.session.access_token}`,
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(body?.error ?? "The channel service could not complete this request");
  }
  return (body ?? {}) as T;
}
