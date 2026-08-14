import { createHmac } from "crypto";
import { config } from "../../config";
import type { PendingCredentials } from "./types";

interface TikTokResponse<T> {
  code?: number;
  message?: string;
  data?: T;
}

interface TikTokTokenData {
  access_token?: string;
  refresh_token?: string;
  access_token_expire_in?: number;
  refresh_token_expire_in?: number;
  granted_scopes?: string[];
  granted_permissions?: string[];
  open_id?: string;
}

interface TikTokShop {
  id?: string;
  cipher?: string;
  code?: string;
  name?: string;
  region?: string;
}

export function isTikTokConfigured(): boolean {
  return Boolean(
    config.SUPABASE_SERVICE_ROLE_KEY
    && config.INTEGRATION_TOKEN_ENCRYPTION_KEY
    && config.TIKTOK_APP_KEY
    && config.TIKTOK_APP_SECRET
    && config.TIKTOK_SERVICE_ID
  );
}

export function getTikTokCallbackUrl(): string {
  return new URL("/channels/oauth/tiktok/callback", config.API_URL).toString();
}

export function createTikTokAuthorizationUrl(state: string): string {
  if (!config.TIKTOK_SERVICE_ID) throw new Error("TikTok Shop is not configured");

  const url = new URL("/open/authorize", config.TIKTOK_AUTH_BASE_URL);
  url.searchParams.set("service_id", config.TIKTOK_SERVICE_ID);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeTikTokCode(code: string): Promise<PendingCredentials> {
  const { TIKTOK_APP_KEY: appKey, TIKTOK_APP_SECRET: appSecret } = config;
  if (!appKey || !appSecret) throw new Error("TikTok Shop is not configured");

  const tokenUrl = new URL("https://auth.tiktok-shops.com/api/v2/token/get");
  tokenUrl.searchParams.set("app_key", appKey);
  tokenUrl.searchParams.set("app_secret", appSecret);
  tokenUrl.searchParams.set("auth_code", code);
  tokenUrl.searchParams.set("grant_type", "authorized_code");

  const tokenResponse = await fetchJson<TikTokResponse<TikTokTokenData>>(tokenUrl);
  const token = tokenResponse.data;
  if (tokenResponse.code !== 0 || !token?.access_token || !token.refresh_token) {
    throw new Error(tokenResponse.message ?? "TikTok Shop did not return valid credentials");
  }

  const shops = await getAuthorizedShops(token.access_token);
  const accounts = shops.flatMap((shop) => {
    const id = shop.id ?? shop.cipher;
    if (!id || !shop.cipher) return [];
    return [{
      id,
      name: shop.name ?? shop.code ?? id,
      shopCipher: shop.cipher,
      shopCode: shop.code,
      region: shop.region,
    }];
  });

  if (accounts.length === 0) {
    throw new Error("TikTok Shop returned no authorized shops");
  }

  return {
    state: "PENDING_SELECTION",
    accounts,
    accessTokenExpiresAt: normalizeTikTokExpiry(token.access_token_expire_in),
    refreshTokenExpiresAt: normalizeTikTokExpiry(token.refresh_token_expire_in),
    providerData: {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      grantedScopes: token.granted_scopes ?? token.granted_permissions ?? [],
      openId: token.open_id,
    },
  };
}

export function createTikTokApiSignature(
  path: string,
  parameters: Record<string, string>,
  body = ""
): string {
  if (!config.TIKTOK_APP_SECRET) throw new Error("TikTok Shop is not configured");

  const parameterString = Object.entries(parameters)
    .filter(([key]) => key !== "sign" && key !== "access_token")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}${value}`)
    .join("");
  const signingInput = `${config.TIKTOK_APP_SECRET}${path}${parameterString}${body}${config.TIKTOK_APP_SECRET}`;

  return createHmac("sha256", config.TIKTOK_APP_SECRET)
    .update(signingInput)
    .digest("hex");
}

async function getAuthorizedShops(accessToken: string): Promise<TikTokShop[]> {
  if (!config.TIKTOK_APP_KEY) throw new Error("TikTok Shop is not configured");

  const path = "/authorization/202309/shops";
  const parameters = {
    app_key: config.TIKTOK_APP_KEY,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };
  const url = new URL(path, config.TIKTOK_API_BASE_URL);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("sign", createTikTokApiSignature(path, parameters));

  const response = await fetchJson<TikTokResponse<{ shops?: TikTokShop[] }>>(url, {
    "x-tts-access-token": accessToken,
  });
  if (response.code !== 0) {
    throw new Error(response.message ?? "TikTok Shop lookup failed");
  }
  return response.data?.shops ?? [];
}

function normalizeTikTokExpiry(value: number | undefined): string | undefined {
  if (!value) return undefined;
  const milliseconds = value > 10_000_000_000 ? value : value * 1000;
  const timestamp = value > Math.floor(Date.now() / 1000) ? milliseconds : Date.now() + milliseconds;
  return new Date(timestamp).toISOString();
}

async function fetchJson<T>(url: URL, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  const body = await response.json() as T;
  if (!response.ok) {
    throw new Error(`TikTok Shop request failed with status ${response.status}`);
  }
  return body;
}
