import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY = "test-anon-key";
process.env.SHOPIFY_CLIENT_SECRET = "shopify-test-secret";
process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

test("Shopify accepts only permanent myshopify.com store domains", async () => {
  const { normalizeShopifyDomain } = await import("./shopify.js");

  assert.equal(normalizeShopifyDomain("my-store.myshopify.com"), "my-store.myshopify.com");
  assert.equal(
    normalizeShopifyDomain("https://my-store.myshopify.com"),
    "my-store.myshopify.com"
  );
  assert.throws(() => normalizeShopifyDomain("https://shop.example.com"));
  assert.throws(() => normalizeShopifyDomain("myshopify.com.attacker.example"));
  assert.throws(() => normalizeShopifyDomain("https://my-store.myshopify.com/admin"));
});

test("WooCommerce rejects non-HTTPS and private network store addresses", async () => {
  const { normalizeWooCommerceStoreUrl } = await import("./woocommerce.js");

  await assert.rejects(normalizeWooCommerceStoreUrl("http://store.example.com"));
  await assert.rejects(normalizeWooCommerceStoreUrl("https://localhost"));
  await assert.rejects(normalizeWooCommerceStoreUrl("https://127.0.0.1"));
  await assert.rejects(normalizeWooCommerceStoreUrl("https://10.0.0.1"));
  await assert.rejects(normalizeWooCommerceStoreUrl("https://[::1]"));
});

test("Shopify webhook verification checks the raw body HMAC", async () => {
  const { verifyShopifyWebhook } = await import("./shopify.js");
  const body = JSON.stringify({ id: 123, topic: "orders/create" });
  const signature = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!)
    .update(body)
    .digest("base64");

  assert.equal(verifyShopifyWebhook(body, signature), true);
  assert.equal(verifyShopifyWebhook(`${body} `, signature), false);
});

test("Shopify callback verification rejects altered OAuth parameters", async () => {
  const { verifyShopifyCallback } = await import("./shopify.js");
  const query = {
    code: "single-use-code",
    shop: "my-store.myshopify.com",
    state: "state-value-with-sufficient-entropy",
    timestamp: "1786700000",
  };
  const message = Object.entries(query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const hmac = createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!)
    .update(message)
    .digest("hex");

  assert.equal(verifyShopifyCallback({ ...query, hmac }), true);
  assert.equal(verifyShopifyCallback({ ...query, shop: "other.myshopify.com", hmac }), false);
});

test("WooCommerce webhook verification checks the per-store HMAC", async () => {
  const { verifyWooCommerceWebhook } = await import("./woocommerce.js");
  const body = JSON.stringify({ id: 456, status: "processing" });
  const secret = "woocommerce-test-secret";
  const signature = createHmac("sha256", secret).update(body).digest("base64");

  assert.equal(verifyWooCommerceWebhook(body, signature, secret), true);
  assert.equal(verifyWooCommerceWebhook(body, signature, `${secret}-wrong`), false);
});

test("integration credentials require the matching authenticated context", async () => {
  const { decryptCredentials, encryptCredentials } = await import("../../lib/tokenVault.js");
  const credentials = { accessToken: "provider-secret", refreshToken: "refresh-secret" };
  const encrypted = encryptCredentials(credentials, "integration-a:SHOPIFY");

  assert.equal(encrypted.includes("provider-secret"), false);
  assert.deepEqual(
    decryptCredentials(encrypted, "integration-a:SHOPIFY"),
    credentials
  );
  assert.throws(() => decryptCredentials(encrypted, "integration-b:SHOPIFY"));

  const parts = encrypted.split(".");
  parts[3] = `${parts[3]?.startsWith("A") ? "B" : "A"}${parts[3]?.slice(1)}`;
  assert.throws(() => decryptCredentials(parts.join("."), "integration-a:SHOPIFY"));
});
