import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { lookup } from "dns/promises";
import { request as httpsRequest } from "https";
import { isIP } from "net";
import { config } from "../../config";

export interface WooCommerceCredentials extends Record<string, unknown> {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  webhookSecret: string;
}

interface WooCommerceKeyPayload {
  key_id: number | string;
  user_id: string;
  consumer_key: string;
  consumer_secret: string;
  key_permissions: string;
}

export function isWooCommerceConfigured(): boolean {
  return Boolean(
    config.SUPABASE_SERVICE_ROLE_KEY
    && config.INTEGRATION_TOKEN_ENCRYPTION_KEY
    && new URL(config.API_URL).protocol === "https:"
  );
}

export async function normalizeWooCommerceStoreUrl(value: string): Promise<string> {
  const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Enter a valid WooCommerce store address");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("WooCommerce store addresses must use HTTPS and cannot contain credentials or query parameters");
  }

  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/+$/, "");
  await assertPublicHostname(url.hostname);
  return url.toString().replace(/\/$/, "");
}

export function createWooCommerceAuthorizationUrl(storeUrl: string, state: string): string {
  const url = new URL(`${storeUrl}/wc-auth/v1/authorize`);
  url.searchParams.set("app_name", config.WOOCOMMERCE_APP_NAME);
  url.searchParams.set("scope", config.WOOCOMMERCE_AUTH_SCOPE);
  url.searchParams.set("user_id", state);
  url.searchParams.set(
    "return_url",
    new URL("/channels/oauth/woocommerce/return", config.API_URL).toString()
  );
  url.searchParams.set(
    "callback_url",
    new URL("/channels/oauth/woocommerce/callback", config.API_URL).toString()
  );
  return url.toString();
}

export function parseWooCommerceKeyPayload(value: unknown): WooCommerceKeyPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as Partial<WooCommerceKeyPayload>;
  if (
    (typeof payload.key_id !== "string" && typeof payload.key_id !== "number")
    || typeof payload.user_id !== "string"
    || typeof payload.consumer_key !== "string"
    || typeof payload.consumer_secret !== "string"
    || typeof payload.key_permissions !== "string"
    || !payload.consumer_key.startsWith("ck_")
    || !payload.consumer_secret.startsWith("cs_")
  ) {
    return null;
  }
  return payload as WooCommerceKeyPayload;
}

export async function completeWooCommerceConnection(
  storeUrl: string,
  key: WooCommerceKeyPayload
): Promise<WooCommerceCredentials> {
  await wooRequest(storeUrl, "/wp-json/wc/v3/orders?per_page=1&_fields=id", key);

  const webhookSecret = randomBytes(32).toString("base64url");
  const deliveryUrl = new URL("/channels/webhooks/woocommerce", config.API_URL).toString();
  const topics = ["order.created", "order.updated", "product.updated"];

  for (const topic of topics) {
    await wooRequest(storeUrl, "/wp-json/wc/v3/webhooks", key, {
      method: "POST",
      body: JSON.stringify({
        name: `${config.WOOCOMMERCE_APP_NAME}: ${topic}`,
        topic,
        delivery_url: deliveryUrl,
        secret: webhookSecret,
        status: "active",
      }),
    });
  }

  return {
    storeUrl,
    consumerKey: key.consumer_key,
    consumerSecret: key.consumer_secret,
    webhookSecret,
  };
}

export function verifyWooCommerceWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function normalizeWooCommerceWebhookSource(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    url.hostname = url.hostname.toLowerCase();
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function wooRequest(
  storeUrl: string,
  path: string,
  key: Pick<WooCommerceKeyPayload, "consumer_key" | "consumer_secret">,
  init: { method?: "POST"; body?: string } = {}
): Promise<unknown> {
  const base = await normalizeWooCommerceStoreUrl(storeUrl);
  const target = new URL(`${base}${path}`);
  const resolved = await resolvePublicHostname(target.hostname);
  const response = await pinnedHttpsRequest(target, resolved, {
    method: init.method ?? "GET",
    body: init.body,
    authorization: `Basic ${Buffer.from(`${key.consumer_key}:${key.consumer_secret}`).toString("base64")}`,
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error("WooCommerce returned an unexpected redirect");
  }

  let body: { message?: string } | null = null;
  try {
    body = JSON.parse(response.body) as { message?: string };
  } catch {
    body = null;
  }
  if (response.status < 200 || response.status >= 300) {
    throw new Error(body?.message ?? `WooCommerce request failed with status ${response.status}`);
  }
  return body;
}

async function assertPublicHostname(hostname: string): Promise<void> {
  await resolvePublicHostname(hostname);
}

async function resolvePublicHostname(
  hostname: string
): Promise<{ address: string; family: 4 | 6 }> {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (
    normalized === "localhost"
    || normalized.endsWith(".localhost")
    || normalized.endsWith(".local")
    || normalized.endsWith(".internal")
    || !normalized.includes(".")
  ) {
    throw new Error("The WooCommerce store must use a public internet address");
  }

  const literalVersion = isIP(normalized);
  if (literalVersion && !isPublicIp(normalized)) {
    throw new Error("Private network addresses cannot be used for WooCommerce stores");
  }
  if (literalVersion) {
    return { address: normalized, family: literalVersion as 4 | 6 };
  }

  const addresses = await lookup(normalized, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new Error("The WooCommerce store address does not resolve to a public server");
  }
  const first = addresses[0];
  return { address: first.address, family: first.family as 4 | 6 };
}

function pinnedHttpsRequest(
  url: URL,
  resolved: { address: string; family: 4 | 6 },
  options: { method: string; body?: string; authorization: string }
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(url, {
      method: options.method,
      headers: {
        Accept: "application/json",
        Authorization: options.authorization,
        ...(options.body ? {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(options.body).toString(),
        } : {}),
      },
      lookup: (_hostname, _lookupOptions, callback) => {
        callback(null, resolved.address, resolved.family);
      },
    }, (response) => {
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > 2 * 1024 * 1024) {
          request.destroy(new Error("WooCommerce response was too large"));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => resolve({
        status: response.statusCode ?? 500,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });

    request.setTimeout(15_000, () => request.destroy(new Error("WooCommerce request timed out")));
    request.on("error", reject);
    if (options.body) request.write(options.body);
    request.end();
  });
}

function isPublicIp(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(
      a === 0
      || a === 10
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 198 && (b === 18 || b === 19))
      || a >= 224
    );
  }

  if (isIP(address) === 6) {
    const value = address.toLowerCase().split("%")[0];
    if (value.startsWith("::ffff:")) return isPublicIp(value.slice(7));
    return !(
      value === "::"
      || value === "::1"
      || value.startsWith("fc")
      || value.startsWith("fd")
      || /^fe[89ab]/.test(value)
      || value.startsWith("2001:db8:")
      || value.startsWith("ff")
    );
  }

  return false;
}
