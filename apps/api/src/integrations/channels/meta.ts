import { config } from "../../config";
import type { OAuthProvider, PendingCredentials } from "./types";

type MetaProvider = Extract<OAuthProvider, "FACEBOOK" | "INSTAGRAM">;

interface MetaTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: { message?: string };
}

interface MetaPage {
  id?: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: {
    id?: string;
    name?: string;
    username?: string;
  };
}

interface MetaPagesResponse {
  data?: MetaPage[];
  error?: { message?: string };
}

function getMetaCredentials(provider: MetaProvider) {
  const appId = provider === "FACEBOOK" ? config.FACEBOOK_APP_ID : config.INSTAGRAM_APP_ID;
  const appSecret = provider === "FACEBOOK"
    ? config.FACEBOOK_APP_SECRET
    : config.INSTAGRAM_APP_SECRET;
  const scopes = (provider === "FACEBOOK"
    ? config.FACEBOOK_OAUTH_SCOPES
    : config.INSTAGRAM_OAUTH_SCOPES)
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!appId || !appSecret) {
    throw new Error(`${provider} is not configured`);
  }

  return { appId, appSecret, scopes };
}

export function isMetaConfigured(provider: MetaProvider): boolean {
  const { SUPABASE_SERVICE_ROLE_KEY, INTEGRATION_TOKEN_ENCRYPTION_KEY } = config;
  const appId = provider === "FACEBOOK" ? config.FACEBOOK_APP_ID : config.INSTAGRAM_APP_ID;
  const secret = provider === "FACEBOOK"
    ? config.FACEBOOK_APP_SECRET
    : config.INSTAGRAM_APP_SECRET;

  return Boolean(SUPABASE_SERVICE_ROLE_KEY && INTEGRATION_TOKEN_ENCRYPTION_KEY && appId && secret);
}

export function getMetaCallbackUrl(provider: MetaProvider): string {
  const slug = provider === "FACEBOOK" ? "facebook" : "instagram";
  return new URL(`/channels/oauth/${slug}/callback`, config.API_URL).toString();
}

export function createMetaAuthorizationUrl(provider: MetaProvider, state: string): string {
  const { appId, scopes } = getMetaCredentials(provider);
  const url = new URL(`https://www.facebook.com/${config.META_GRAPH_API_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", getMetaCallbackUrl(provider));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeMetaCode(
  provider: MetaProvider,
  code: string
): Promise<PendingCredentials> {
  const { appId, appSecret } = getMetaCredentials(provider);
  const tokenUrl = new URL(
    `https://graph.facebook.com/${config.META_GRAPH_API_VERSION}/oauth/access_token`
  );
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", getMetaCallbackUrl(provider));
  tokenUrl.searchParams.set("code", code);

  const shortToken = await fetchJson<MetaTokenResponse>(tokenUrl);
  if (!shortToken.access_token) {
    throw new Error(shortToken.error?.message ?? "Meta did not return an access token");
  }

  const longTokenUrl = new URL(
    `https://graph.facebook.com/${config.META_GRAPH_API_VERSION}/oauth/access_token`
  );
  longTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
  longTokenUrl.searchParams.set("client_id", appId);
  longTokenUrl.searchParams.set("client_secret", appSecret);
  longTokenUrl.searchParams.set("fb_exchange_token", shortToken.access_token);

  const longToken = await fetchJson<MetaTokenResponse>(longTokenUrl);
  if (!longToken.access_token) {
    throw new Error(longToken.error?.message ?? "Meta token exchange failed");
  }

  const pagesUrl = new URL(
    `https://graph.facebook.com/${config.META_GRAPH_API_VERSION}/me/accounts`
  );
  pagesUrl.searchParams.set(
    "fields",
    "id,name,access_token,instagram_business_account{id,name,username}"
  );
  pagesUrl.searchParams.set("access_token", longToken.access_token);

  const pages = await fetchJson<MetaPagesResponse>(pagesUrl);
  if (pages.error) throw new Error(pages.error.message ?? "Meta account lookup failed");

  const accounts = (pages.data ?? []).flatMap((page) => {
    if (!page.id || !page.name || !page.access_token) return [];

    if (provider === "FACEBOOK") {
      return [{
        id: page.id,
        name: page.name,
        pageId: page.id,
        accessToken: page.access_token,
      }];
    }

    const instagram = page.instagram_business_account;
    if (!instagram?.id) return [];

    return [{
      id: instagram.id,
      name: instagram.username ? `@${instagram.username}` : (instagram.name ?? page.name),
      pageId: page.id,
      accessToken: page.access_token,
    }];
  });

  if (accounts.length === 0) {
    throw new Error(
      provider === "INSTAGRAM"
        ? "No eligible Instagram professional account is linked to an accessible Facebook Page"
        : "No eligible Facebook Page was returned by Meta"
    );
  }

  const accessTokenExpiresAt = longToken.expires_in
    ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
    : undefined;

  return {
    state: "PENDING_SELECTION",
    accounts,
    accessTokenExpiresAt,
  };
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await response.json() as T;
  if (!response.ok) {
    throw new Error(`Meta request failed with status ${response.status}`);
  }
  return body;
}
