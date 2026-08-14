import { createHmac, timingSafeEqual } from "crypto";
import { config } from "../../config";
import type { FinalCredentials } from "./types";

interface ShopifyTokenResponse {
  access_token?: string;
  scope?: string;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

export function isShopifyConfigured(): boolean {
  return Boolean(
    config.SUPABASE_SERVICE_ROLE_KEY
    && config.INTEGRATION_TOKEN_ENCRYPTION_KEY
    && config.SHOPIFY_CLIENT_ID
    && config.SHOPIFY_CLIENT_SECRET
    && new URL(config.API_URL).protocol === "https:"
  );
}

export function normalizeShopifyDomain(value: string): string {
  const candidate = value.trim().toLowerCase();
  let hostname = candidate;
  if (candidate.includes("://")) {
    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      throw new Error("Enter a valid Shopify store domain");
    }
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
      throw new Error("Use only the HTTPS myshopify.com store address");
    }
    hostname = url.hostname;
  }

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(hostname)) {
    throw new Error("Enter the store's .myshopify.com domain, such as my-store.myshopify.com");
  }
  return hostname;
}

export function createShopifyAuthorizationUrl(shop: string, state: string): string {
  if (!config.SHOPIFY_CLIENT_ID) throw new Error("Shopify is not configured");
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", config.SHOPIFY_CLIENT_ID);
  url.searchParams.set("scope", config.SHOPIFY_SCOPES);
  url.searchParams.set(
    "redirect_uri",
    new URL("/channels/oauth/shopify/callback", config.API_URL).toString()
  );
  url.searchParams.set("state", state);
  return url.toString();
}

export function verifyShopifyCallback(query: Record<string, unknown>): boolean {
  if (!config.SHOPIFY_CLIENT_SECRET || typeof query.hmac !== "string") return false;
  const message = Object.keys(query)
    .filter((key) => key !== "hmac" && key !== "signature")
    .sort()
    .map((key) => `${key}=${stringifyQueryValue(query[key])}`)
    .join("&");
  const expected = createHmac("sha256", config.SHOPIFY_CLIENT_SECRET)
    .update(message)
    .digest("hex");
  return safeEqual(query.hmac, expected);
}

export async function completeShopifyConnection(
  shopValue: string,
  code: string
): Promise<FinalCredentials> {
  const shop = normalizeShopifyDomain(shopValue);
  if (!config.SHOPIFY_CLIENT_ID || !config.SHOPIFY_CLIENT_SECRET) {
    throw new Error("Shopify is not configured");
  }

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: config.SHOPIFY_CLIENT_ID,
      client_secret: config.SHOPIFY_CLIENT_SECRET,
      code,
    }),
    redirect: "error",
  });
  const token = await tokenResponse.json().catch(() => null) as ShopifyTokenResponse | null;
  if (!tokenResponse.ok || !token?.access_token) {
    throw new Error("Shopify did not return valid store credentials");
  }

  const shopResult = await shopifyGraphql<{
    shop: { name: string; myshopifyDomain: string };
  }>(shop, token.access_token, "query ConnectedShop { shop { name myshopifyDomain } }");
  const connectedShop = shopResult.shop;
  if (normalizeShopifyDomain(connectedShop.myshopifyDomain) !== shop) {
    throw new Error("Shopify returned a different store than the one authorized");
  }

  await ensureShopifyWebhooks(shop, token.access_token);

  return {
    state: "CONNECTED",
    account: { id: shop, name: connectedShop.name || shop },
    accessToken: token.access_token,
    grantedScopes: token.scope?.split(",").map((scope) => scope.trim()).filter(Boolean),
    providerData: { shop },
  };
}

export function verifyShopifyWebhook(body: string, signature: string): boolean {
  if (!config.SHOPIFY_CLIENT_SECRET) return false;
  const expected = createHmac("sha256", config.SHOPIFY_CLIENT_SECRET)
    .update(body)
    .digest("base64");
  return safeEqual(signature, expected);
}

async function ensureShopifyWebhooks(shop: string, accessToken: string): Promise<void> {
  const webhookUrl = new URL("/channels/webhooks/shopify", config.API_URL).toString();
  const existing = await shopifyGraphql<{
    webhookSubscriptions: { nodes: Array<{ topic: string; uri: string }> };
  }>(
    shop,
    accessToken,
    "query ExistingWebhooks { webhookSubscriptions(first: 100) { nodes { topic uri } } }"
  );
  const topics = [
    "APP_UNINSTALLED",
    "ORDERS_CREATE",
    "ORDERS_UPDATED",
    "PRODUCTS_UPDATE",
    "INVENTORY_LEVELS_UPDATE",
  ];

  for (const topic of topics) {
    if (existing.webhookSubscriptions.nodes.some((item) => item.topic === topic && item.uri === webhookUrl)) {
      continue;
    }

    const result = await shopifyGraphql<{
      webhookSubscriptionCreate: {
        webhookSubscription: { id: string } | null;
        userErrors: Array<{ message: string }>;
      };
    }>(
      shop,
      accessToken,
      `mutation AddWebhook($topic: WebhookSubscriptionTopic!, $subscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $subscription) {
          webhookSubscription { id }
          userErrors { message }
        }
      }`,
      { topic, subscription: { uri: webhookUrl } }
    );
    const mutation = result.webhookSubscriptionCreate;
    if (!mutation.webhookSubscription || mutation.userErrors.length > 0) {
      throw new Error(mutation.userErrors[0]?.message ?? `Could not register Shopify ${topic} webhook`);
    }
  }
}

async function shopifyGraphql<T>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `https://${shop}/admin/api/${config.SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
      redirect: "error",
    }
  );
  const body = await response.json().catch(() => null) as GraphqlResponse<T> | null;
  if (!response.ok || !body?.data || body.errors?.length) {
    throw new Error(body?.errors?.[0]?.message ?? `Shopify request failed with status ${response.status}`);
  }
  return body.data;
}

function stringifyQueryValue(value: unknown): string {
  return Array.isArray(value) ? value.map(String).join(",") : String(value ?? "");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
