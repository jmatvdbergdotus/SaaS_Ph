import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { config } from "../../config";
import {
  createMetaAuthorizationUrl,
  exchangeMetaCode,
  isMetaConfigured,
} from "../../integrations/channels/meta";
import {
  createTikTokAuthorizationUrl,
  exchangeTikTokCode,
  isTikTokConfigured,
} from "../../integrations/channels/tiktok";
import {
  completeShopifyConnection,
  createShopifyAuthorizationUrl,
  isShopifyConfigured,
  normalizeShopifyDomain,
  verifyShopifyCallback,
  verifyShopifyWebhook,
} from "../../integrations/channels/shopify";
import {
  completeWooCommerceConnection,
  createWooCommerceAuthorizationUrl,
  isWooCommerceConfigured,
  normalizeWooCommerceStoreUrl,
  normalizeWooCommerceWebhookSource,
  parseWooCommerceKeyPayload,
  verifyWooCommerceWebhook,
  type WooCommerceCredentials,
} from "../../integrations/channels/woocommerce";
import {
  isOAuthProvider,
  type FinalCredentials,
  type OAuthProvider,
  type PendingCredentials,
} from "../../integrations/channels/types";
import { getSupabaseAdmin } from "../../lib/supabaseAdmin";
import { decryptCredentials, encryptCredentials } from "../../lib/tokenVault";
import { requireAuth } from "../../plugins/auth";

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
type SocialOAuthProvider = Extract<OAuthProvider, "FACEBOOK" | "INSTAGRAM" | "TIKTOK_SHOP">;

interface OAuthStateContext {
  storeUrl?: string;
  shop?: string;
}

const selectAccountSchema = z.object({
  accountId: z.string().min(1).max(255),
});

const callbackSchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(32).max(512),
  error: z.string().max(255).optional(),
  error_reason: z.string().max(255).optional(),
});

const storeConnectSchema = z.object({
  storeUrl: z.string().trim().min(4).max(2048),
});

const shopifyCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(32).max(512),
  shop: z.string().min(1).max(255),
  hmac: z.string().length(64),
}).passthrough();

const wooReturnSchema = z.object({
  success: z.enum(["0", "1"]),
  user_id: z.string().min(32).max(512),
});

export async function channelsRoutes(app: FastifyInstance) {
  // Keeping the untouched JSON string is required for provider signature checks.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_request, body, done) => done(null, body)
  );

  app.get("/providers", { preHandler: requireAuth }, async (_request, reply) => {
    reply.send({
      providers: {
        FACEBOOK: providerAvailability("FACEBOOK"),
        INSTAGRAM: providerAvailability("INSTAGRAM"),
        TIKTOK_SHOP: providerAvailability("TIKTOK_SHOP"),
        WOOCOMMERCE: providerAvailability("WOOCOMMERCE"),
        SHOPIFY: providerAvailability("SHOPIFY"),
      },
    });
  });

  app.post("/:provider/connect", { preHandler: requireAuth }, async (request, reply) => {
    const provider = parseProvider((request.params as { provider: string }).provider);
    if (!provider) return reply.status(404).send({ error: "Unknown channel provider" });
    if (!isProviderConfigured(provider)) {
      return reply.status(503).send({
        error: "This channel is not configured on the server",
        code: "PROVIDER_NOT_CONFIGURED",
      });
    }

    try {
      const admin = getSupabaseAdmin();
      const storeId = await getStoreId(request.authUser.id);
      const state = randomBytes(32).toString("base64url");
      const stateHash = hash(state);
      let stateContext: OAuthStateContext | undefined;

      if (provider === "WOOCOMMERCE" || provider === "SHOPIFY") {
        const parsedBody = parseJsonBody(request.body, storeConnectSchema);
        if (!parsedBody.success) {
          return reply.status(400).send({ error: "Enter the store address before connecting" });
        }
        stateContext = provider === "WOOCOMMERCE"
          ? { storeUrl: await normalizeWooCommerceStoreUrl(parsedBody.data.storeUrl) }
          : { shop: normalizeShopifyDomain(parsedBody.data.storeUrl) };
      }

      await admin.from("channel_oauth_states").delete().lt("expires_at", new Date().toISOString());
      const { error: stateError } = await admin.from("channel_oauth_states").insert({
        state_hash: stateHash,
        user_id: request.authUser.id,
        store_id: storeId,
        provider,
        expires_at: new Date(Date.now() + OAUTH_STATE_TTL_MS).toISOString(),
        context_encrypted: stateContext
          ? encryptCredentials(stateContext, oauthStateContext(stateHash, provider))
          : null,
      });
      if (stateError) throw stateError;

      await upsertPendingIntegration(storeId, provider);
      const authorizationUrl = provider === "TIKTOK_SHOP"
        ? createTikTokAuthorizationUrl(state)
        : provider === "WOOCOMMERCE"
          ? createWooCommerceAuthorizationUrl(stateContext?.storeUrl ?? "", state)
          : provider === "SHOPIFY"
            ? createShopifyAuthorizationUrl(stateContext?.shop ?? "", state)
            : createMetaAuthorizationUrl(provider, state);

      reply.send({ authorizationUrl });
    } catch (error) {
      request.log.error({ err: error, provider }, "Could not begin channel authorization");
      reply.status(500).send({ error: publicError(error) });
    }
  });

  app.get("/:provider/accounts", { preHandler: requireAuth }, async (request, reply) => {
    const provider = parseProvider((request.params as { provider: string }).provider);
    if (!provider) return reply.status(404).send({ error: "Unknown channel provider" });
    if (!isSocialProvider(provider)) {
      return reply.status(400).send({ error: "This provider does not use account selection" });
    }

    try {
      const storeId = await getStoreId(request.authUser.id);
      const integration = await getIntegration(storeId, provider);
      if (!integration) return reply.status(404).send({ error: "Channel connection not found" });

      const credentials = await getPendingCredentials(integration.id, provider);
      reply.send({
        accounts: credentials.accounts.map(({ id, name }) => ({ id, name })),
      });
    } catch (error) {
      request.log.error({ err: error, provider }, "Could not load channel accounts");
      reply.status(409).send({ error: publicError(error) });
    }
  });

  app.post("/:provider/select", { preHandler: requireAuth }, async (request, reply) => {
    const provider = parseProvider((request.params as { provider: string }).provider);
    if (!provider) return reply.status(404).send({ error: "Unknown channel provider" });
    if (!isSocialProvider(provider)) {
      return reply.status(400).send({ error: "This provider does not use account selection" });
    }

    const parsedBody = parseJsonBody(request.body, selectAccountSchema);
    if (!parsedBody.success) {
      return reply.status(400).send({ error: "Select a valid channel account" });
    }

    try {
      const storeId = await getStoreId(request.authUser.id);
      const integration = await getIntegration(storeId, provider);
      if (!integration) return reply.status(404).send({ error: "Channel connection not found" });

      const pending = await getPendingCredentials(integration.id, provider);
      const account = pending.accounts.find(({ id }) => id === parsedBody.data.accountId);
      if (!account) return reply.status(400).send({ error: "That account is not available" });

      await saveConnectedCredentials(integration.id, storeId, provider, pending, account);
      reply.send({ connected: true });
    } catch (error) {
      request.log.error({ err: error, provider }, "Could not select channel account");
      reply.status(500).send({ error: publicError(error) });
    }
  });

  app.delete("/:provider", { preHandler: requireAuth }, async (request, reply) => {
    const provider = parseProvider((request.params as { provider: string }).provider);
    if (!provider) return reply.status(404).send({ error: "Unknown channel provider" });

    try {
      const admin = getSupabaseAdmin();
      const storeId = await getStoreId(request.authUser.id);
      const integration = await getIntegration(storeId, provider);
      if (!integration) return reply.send({ disconnected: true });

      const { error: credentialError } = await admin
        .from("store_integration_credentials")
        .delete()
        .eq("integration_id", integration.id);
      if (credentialError) throw credentialError;

      const { error: integrationError } = await admin
        .from("store_integrations")
        .update({
          status: "DISCONNECTED",
          external_account_id: null,
          external_account_name: null,
          connected_at: null,
          last_sync_at: null,
          error_message: null,
        })
        .eq("id", integration.id)
        .eq("store_id", storeId)
        .eq("provider", provider);
      if (integrationError) throw integrationError;

      reply.send({ disconnected: true });
    } catch (error) {
      request.log.error({ err: error, provider }, "Could not disconnect channel");
      reply.status(500).send({ error: publicError(error) });
    }
  });

  app.get("/oauth/facebook/callback", async (request, reply) => {
    await handleOAuthCallback("FACEBOOK", request.query, reply, app);
  });

  app.get("/oauth/instagram/callback", async (request, reply) => {
    await handleOAuthCallback("INSTAGRAM", request.query, reply, app);
  });

  app.get("/oauth/tiktok/callback", async (request, reply) => {
    await handleOAuthCallback("TIKTOK_SHOP", request.query, reply, app);
  });

  app.post("/oauth/woocommerce/callback", async (request, reply) => {
    const parsedBody = parseJsonBody(request.body, z.unknown());
    const key = parsedBody.success ? parseWooCommerceKeyPayload(parsedBody.data) : null;
    if (!key) return reply.status(400).send({ error: "Invalid WooCommerce key callback" });

    const state = await consumeOAuthState(key.user_id, "WOOCOMMERCE");
    if (!state?.context.storeUrl) {
      return reply.status(400).send({ error: "This WooCommerce connection is invalid or expired" });
    }

    try {
      const credentials = await completeWooCommerceConnection(state.context.storeUrl, key);
      const integration = await upsertPendingIntegration(state.store_id, "WOOCOMMERCE");
      const storeUrl = normalizeWooCommerceWebhookSource(credentials.storeUrl);
      if (!storeUrl) throw new Error("WooCommerce returned an invalid store address");

      await saveDirectConnectedCredentials(
        integration.id,
        state.store_id,
        "WOOCOMMERCE",
        {
          state: "CONNECTED",
          account: { id: storeUrl, name: new URL(storeUrl).hostname },
          providerData: credentials,
        }
      );
      reply.send({ connected: true });
    } catch (error) {
      request.log.error({ err: error }, "WooCommerce authorization callback failed");
      await markIntegrationError(state.store_id, "WOOCOMMERCE", publicError(error));
      reply.status(502).send({ error: "WooCommerce connection could not be completed" });
    }
  });

  app.get("/oauth/woocommerce/return", async (request, reply) => {
    const parsed = wooReturnSchema.safeParse(request.query);
    if (!parsed.success) return redirectToChannels(reply, "WOOCOMMERCE", "invalid_callback");

    const state = await findOAuthState(parsed.data.user_id, "WOOCOMMERCE");
    if (!state) return redirectToChannels(reply, "WOOCOMMERCE", "invalid_state");
    if (parsed.data.success === "0") {
      await markIntegrationError(state.store_id, "WOOCOMMERCE", "Authorization was cancelled or denied");
      return redirectToChannels(reply, "WOOCOMMERCE", "cancelled");
    }

    const integration = await getIntegration(state.store_id, "WOOCOMMERCE");
    const result = integration?.status === "CONNECTED"
      ? "connected"
      : integration?.status === "ERROR" ? "error" : "pending";
    return redirectToChannels(reply, "WOOCOMMERCE", result);
  });

  app.get("/oauth/shopify/callback", async (request, reply) => {
    const parsed = shopifyCallbackSchema.safeParse(request.query);
    if (!parsed.success || !verifyShopifyCallback(parsed.data)) {
      return redirectToChannels(reply, "SHOPIFY", "invalid_callback");
    }

    const state = await consumeOAuthState(parsed.data.state, "SHOPIFY");
    if (!state?.context.shop) return redirectToChannels(reply, "SHOPIFY", "invalid_state");

    let shop: string;
    try {
      shop = normalizeShopifyDomain(parsed.data.shop);
    } catch {
      return redirectToChannels(reply, "SHOPIFY", "invalid_callback");
    }
    if (shop !== state.context.shop) {
      await markIntegrationError(state.store_id, "SHOPIFY", "The authorized store did not match the requested store");
      return redirectToChannels(reply, "SHOPIFY", "invalid_callback");
    }

    try {
      const credentials = await completeShopifyConnection(shop, parsed.data.code);
      const integration = await upsertPendingIntegration(state.store_id, "SHOPIFY");
      await saveDirectConnectedCredentials(
        integration.id,
        state.store_id,
        "SHOPIFY",
        credentials
      );
      return redirectToChannels(reply, "SHOPIFY", "connected");
    } catch (error) {
      app.log.error({ err: error }, "Shopify OAuth callback failed");
      await markIntegrationError(state.store_id, "SHOPIFY", publicError(error));
      return redirectToChannels(reply, "SHOPIFY", "error");
    }
  });

  app.get("/webhooks/meta", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    if (
      query["hub.mode"] === "subscribe"
      && config.FACEBOOK_VERIFY_TOKEN
      && safeEqual(query["hub.verify_token"] ?? "", config.FACEBOOK_VERIFY_TOKEN)
    ) {
      return reply.type("text/plain").send(query["hub.challenge"] ?? "");
    }
    return reply.status(403).send({ error: "Webhook verification failed" });
  });

  app.post("/webhooks/meta", async (request, reply) => {
    const rawBody = typeof request.body === "string" ? request.body : "";
    const payload = parseWebhookBody(rawBody);
    if (!payload) return reply.status(400).send({ error: "Invalid webhook body" });

    const provider: OAuthProvider = payload.object === "instagram" ? "INSTAGRAM" : "FACEBOOK";
    const secret = provider === "INSTAGRAM"
      ? config.INSTAGRAM_APP_SECRET
      : config.FACEBOOK_APP_SECRET;
    const signature = request.headers["x-hub-signature-256"];
    if (!secret || typeof signature !== "string" || !verifyMetaSignature(rawBody, signature, secret)) {
      return reply.status(401).send({ error: "Invalid webhook signature" });
    }

    try {
      const entry = objectValue(arrayValue(payload.entry)[0]);
      const firstChange = objectValue(arrayValue(entry?.changes)[0]);
      const externalAccountId = stringValue(entry?.id);
      if (externalAccountId) {
        await saveWebhookEvent(
          provider,
          externalAccountId,
          hash(rawBody),
          stringValue(firstChange?.field) ?? "notification",
          payload
        );
      }
      reply.send({ received: true });
    } catch (error) {
      app.log.error({ err: error, provider }, "Could not store Meta webhook");
      reply.status(500).send({ error: "Webhook processing failed" });
    }
  });

  app.post("/webhooks/tiktok", async (request, reply) => {
    const rawBody = typeof request.body === "string" ? request.body : "";
    const signature = request.headers.authorization;
    if (!config.TIKTOK_APP_KEY || !config.TIKTOK_APP_SECRET || typeof signature !== "string") {
      return reply.status(401).send({ error: "Invalid webhook signature" });
    }
    const expected = createHmac("sha256", config.TIKTOK_APP_SECRET)
      .update(`${config.TIKTOK_APP_KEY}${rawBody}`)
      .digest("hex");
    if (!safeEqual(signature, expected)) {
      return reply.status(401).send({ error: "Invalid webhook signature" });
    }

    const payload = parseWebhookBody(rawBody);
    if (!payload) return reply.status(400).send({ error: "Invalid webhook body" });

    try {
      const externalAccountId = stringValue(payload.shop_id);
      if (externalAccountId) {
        await saveWebhookEvent(
          "TIKTOK_SHOP",
          externalAccountId,
          stringValue(payload.tts_notification_id) ?? hash(rawBody),
          stringValue(payload.type) ?? "notification",
          payload
        );
      }
      reply.send({ code: 0, message: "Success" });
    } catch (error) {
      app.log.error({ err: error }, "Could not store TikTok Shop webhook");
      reply.status(500).send({ code: 1, message: "Webhook processing failed" });
    }
  });

  app.post("/webhooks/woocommerce", async (request, reply) => {
    const rawBody = typeof request.body === "string" ? request.body : "";
    const signature = request.headers["x-wc-webhook-signature"];
    const sourceHeader = request.headers["x-wc-webhook-source"];
    if (typeof signature !== "string" || typeof sourceHeader !== "string") {
      return reply.status(401).send({ error: "Invalid webhook signature" });
    }

    const source = normalizeWooCommerceWebhookSource(sourceHeader);
    if (!source) return reply.status(401).send({ error: "Invalid webhook source" });
    const integration = await getIntegrationByExternalAccount("WOOCOMMERCE", source);
    if (!integration) return reply.send({ received: true });

    try {
      const credentials = await getConnectedCredentials(integration.id, "WOOCOMMERCE");
      const woo = credentials.providerData as Partial<WooCommerceCredentials> | undefined;
      if (!woo?.webhookSecret || !verifyWooCommerceWebhook(rawBody, signature, woo.webhookSecret)) {
        return reply.status(401).send({ error: "Invalid webhook signature" });
      }

      const payload = parseWebhookBody(rawBody);
      if (!payload) return reply.status(400).send({ error: "Invalid webhook body" });
      const deliveryId = request.headers["x-wc-webhook-delivery-id"];
      const topic = request.headers["x-wc-webhook-topic"];
      await saveWebhookEventForIntegration(
        integration,
        "WOOCOMMERCE",
        typeof deliveryId === "string" ? deliveryId : hash(rawBody),
        typeof topic === "string" ? topic : "notification",
        payload
      );
      reply.send({ received: true });
    } catch (error) {
      app.log.error({ err: error }, "Could not process WooCommerce webhook");
      reply.status(500).send({ error: "Webhook processing failed" });
    }
  });

  app.post("/webhooks/shopify", async (request, reply) => {
    const rawBody = typeof request.body === "string" ? request.body : "";
    const signature = request.headers["x-shopify-hmac-sha256"];
    const shopHeader = request.headers["x-shopify-shop-domain"];
    if (
      typeof signature !== "string"
      || typeof shopHeader !== "string"
      || !verifyShopifyWebhook(rawBody, signature)
    ) {
      return reply.status(401).send({ error: "Invalid webhook signature" });
    }

    let shop: string;
    try {
      shop = normalizeShopifyDomain(shopHeader);
    } catch {
      return reply.status(401).send({ error: "Invalid webhook source" });
    }
    const integration = await getIntegrationByExternalAccount("SHOPIFY", shop);
    if (!integration) return reply.send({ received: true });

    const payload = parseWebhookBody(rawBody);
    if (!payload) return reply.status(400).send({ error: "Invalid webhook body" });
    const webhookId = request.headers["x-shopify-webhook-id"];
    const topic = request.headers["x-shopify-topic"];

    try {
      await saveWebhookEventForIntegration(
        integration,
        "SHOPIFY",
        typeof webhookId === "string" ? webhookId : hash(rawBody),
        typeof topic === "string" ? topic : "notification",
        payload
      );
      if (topic === "app/uninstalled") await disconnectIntegration(integration.id, integration.store_id);
      reply.send({ received: true });
    } catch (error) {
      app.log.error({ err: error }, "Could not process Shopify webhook");
      reply.status(500).send({ error: "Webhook processing failed" });
    }
  });
}

function providerAvailability(provider: OAuthProvider) {
  return {
    configured: isProviderConfigured(provider),
    mode: provider === "WOOCOMMERCE" || provider === "SHOPIFY" ? "STORE_AUTH" : "OAUTH",
  };
}

function isProviderConfigured(provider: OAuthProvider): boolean {
  switch (provider) {
    case "FACEBOOK":
    case "INSTAGRAM":
      return isMetaConfigured(provider);
    case "TIKTOK_SHOP":
      return isTikTokConfigured();
    case "WOOCOMMERCE":
      return isWooCommerceConfigured();
    case "SHOPIFY":
      return isShopifyConfigured();
  }
}

function parseProvider(value: string): OAuthProvider | null {
  const normalized = value.replaceAll("-", "_").toUpperCase();
  const mapped = normalized === "TIKTOK" ? "TIKTOK_SHOP" : normalized;
  return isOAuthProvider(mapped) ? mapped : null;
}

function isSocialProvider(provider: OAuthProvider): provider is SocialOAuthProvider {
  return provider === "FACEBOOK" || provider === "INSTAGRAM" || provider === "TIKTOK_SHOP";
}

async function getStoreId(userId: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("store_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.store_id) throw new Error("Complete store setup before connecting a channel");
  return data.store_id as string;
}

async function getIntegration(storeId: string, provider: OAuthProvider) {
  const { data, error } = await getSupabaseAdmin()
    .from("store_integrations")
    .select("id,status")
    .eq("store_id", storeId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; status: string } | null;
}

async function upsertPendingIntegration(storeId: string, provider: OAuthProvider) {
  const { data, error } = await getSupabaseAdmin()
    .from("store_integrations")
    .upsert({
      store_id: storeId,
      provider,
      status: "PENDING",
      external_account_id: null,
      external_account_name: null,
      connected_at: null,
      error_message: null,
    }, { onConflict: "store_id,provider" })
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: string };
}

async function handleOAuthCallback(
  provider: SocialOAuthProvider,
  query: unknown,
  reply: FastifyReply,
  app: FastifyInstance
) {
  const parsed = callbackSchema.safeParse(query);
  if (!parsed.success) return redirectToChannels(reply, provider, "invalid_callback");

  const state = await consumeOAuthState(parsed.data.state, provider);
  if (!state) return redirectToChannels(reply, provider, "invalid_state");

  if (parsed.data.error || !parsed.data.code) {
    await markIntegrationError(state.store_id, provider, "Authorization was cancelled or denied");
    return redirectToChannels(reply, provider, "cancelled");
  }

  try {
    const pending = provider === "TIKTOK_SHOP"
      ? await exchangeTikTokCode(parsed.data.code)
      : await exchangeMetaCode(provider, parsed.data.code);
    const integration = await upsertPendingIntegration(state.store_id, provider);

    if (pending.accounts.length === 1) {
      await saveConnectedCredentials(
        integration.id,
        state.store_id,
        provider,
        pending,
        pending.accounts[0]
      );
      return redirectToChannels(reply, provider, "connected");
    }

    await savePendingCredentials(integration.id, provider, pending);
    return redirectToChannels(reply, provider, "select_account");
  } catch (error) {
    app.log.error({ err: error, provider }, "Channel OAuth callback failed");
    await markIntegrationError(state.store_id, provider, publicError(error));
    return redirectToChannels(reply, provider, "error");
  }
}

async function consumeOAuthState(state: string, provider: OAuthProvider) {
  const now = new Date().toISOString();
  const stateHash = hash(state);
  const { data, error } = await getSupabaseAdmin()
    .from("channel_oauth_states")
    .update({ consumed_at: now })
    .eq("state_hash", stateHash)
    .eq("provider", provider)
    .is("consumed_at", null)
    .gt("expires_at", now)
    .select("store_id,user_id,context_encrypted")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    store_id: data.store_id as string,
    user_id: data.user_id as string,
    context: data.context_encrypted
      ? decryptCredentials<OAuthStateContext>(
          data.context_encrypted as string,
          oauthStateContext(stateHash, provider)
        )
      : {},
  };
}

async function findOAuthState(state: string, provider: OAuthProvider) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("channel_oauth_states")
    .select("store_id")
    .eq("state_hash", hash(state))
    .eq("provider", provider)
    .gt("expires_at", now)
    .maybeSingle();
  if (error) throw error;
  return data as { store_id: string } | null;
}

async function savePendingCredentials(
  integrationId: string,
  provider: OAuthProvider,
  pending: PendingCredentials
) {
  const { error } = await getSupabaseAdmin()
    .from("store_integration_credentials")
    .upsert({
      integration_id: integrationId,
      encrypted_credentials: encryptCredentials(pending, credentialContext(integrationId, provider)),
      access_token_expires_at: pending.accessTokenExpiresAt ?? null,
      refresh_token_expires_at: pending.refreshTokenExpiresAt ?? null,
    }, { onConflict: "integration_id" });
  if (error) throw error;
}

async function getPendingCredentials(
  integrationId: string,
  provider: OAuthProvider
): Promise<PendingCredentials> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_integration_credentials")
    .select("encrypted_credentials")
    .eq("integration_id", integrationId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.encrypted_credentials) throw new Error("No pending account selection was found");

  const credentials = decryptCredentials<PendingCredentials>(
    data.encrypted_credentials as string,
    credentialContext(integrationId, provider)
  );
  if (credentials.state !== "PENDING_SELECTION" || !Array.isArray(credentials.accounts)) {
    throw new Error("This channel is not waiting for account selection");
  }
  return credentials;
}

async function saveConnectedCredentials(
  integrationId: string,
  storeId: string,
  provider: OAuthProvider,
  pending: PendingCredentials,
  selected: PendingCredentials["accounts"][number]
) {
  const { accessToken: accountAccessToken, ...account } = selected;
  const providerAccessToken = pending.providerData?.accessToken;
  const accessToken = typeof accountAccessToken === "string"
    ? accountAccessToken
    : providerAccessToken;
  if (typeof accessToken !== "string") throw new Error("Provider access token is missing");

  const refreshToken = pending.providerData?.refreshToken;
  const grantedScopes = pending.providerData?.grantedScopes;
  const finalCredentials: FinalCredentials = {
    state: "CONNECTED",
    account,
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    accessTokenExpiresAt: pending.accessTokenExpiresAt,
    refreshTokenExpiresAt: pending.refreshTokenExpiresAt,
    grantedScopes: Array.isArray(grantedScopes)
      ? grantedScopes.filter((scope): scope is string => typeof scope === "string")
      : undefined,
  };

  const admin = getSupabaseAdmin();
  const { error: credentialsError } = await admin
    .from("store_integration_credentials")
    .upsert({
      integration_id: integrationId,
      encrypted_credentials: encryptCredentials(
        finalCredentials,
        credentialContext(integrationId, provider)
      ),
      access_token_expires_at: pending.accessTokenExpiresAt ?? null,
      refresh_token_expires_at: pending.refreshTokenExpiresAt ?? null,
    }, { onConflict: "integration_id" });
  if (credentialsError) throw credentialsError;

  const { error: integrationError } = await admin
    .from("store_integrations")
    .update({
      status: "CONNECTED",
      external_account_id: selected.id,
      external_account_name: selected.name,
      connected_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", integrationId)
    .eq("store_id", storeId)
    .eq("provider", provider);
  if (integrationError) throw integrationError;
}

async function saveDirectConnectedCredentials(
  integrationId: string,
  storeId: string,
  provider: OAuthProvider,
  credentials: FinalCredentials
) {
  const admin = getSupabaseAdmin();
  const { error: credentialsError } = await admin
    .from("store_integration_credentials")
    .upsert({
      integration_id: integrationId,
      encrypted_credentials: encryptCredentials(
        credentials,
        credentialContext(integrationId, provider)
      ),
      access_token_expires_at: credentials.accessTokenExpiresAt ?? null,
      refresh_token_expires_at: credentials.refreshTokenExpiresAt ?? null,
    }, { onConflict: "integration_id" });
  if (credentialsError) throw credentialsError;

  const { error: integrationError } = await admin
    .from("store_integrations")
    .update({
      status: "CONNECTED",
      external_account_id: credentials.account.id,
      external_account_name: credentials.account.name,
      connected_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", integrationId)
    .eq("store_id", storeId)
    .eq("provider", provider);
  if (integrationError) throw integrationError;
}

async function getConnectedCredentials(
  integrationId: string,
  provider: OAuthProvider
): Promise<FinalCredentials> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_integration_credentials")
    .select("encrypted_credentials")
    .eq("integration_id", integrationId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.encrypted_credentials) throw new Error("Connected channel credentials were not found");

  const credentials = decryptCredentials<FinalCredentials>(
    data.encrypted_credentials as string,
    credentialContext(integrationId, provider)
  );
  if (credentials.state !== "CONNECTED") throw new Error("Connected channel credentials are invalid");
  return credentials;
}

async function markIntegrationError(storeId: string, provider: OAuthProvider, message: string) {
  const { error } = await getSupabaseAdmin()
    .from("store_integrations")
    .update({ status: "ERROR", error_message: message.slice(0, 500) })
    .eq("store_id", storeId)
    .eq("provider", provider);
  if (error) throw error;
}

async function saveWebhookEvent(
  provider: OAuthProvider,
  externalAccountId: string,
  externalEventId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  const admin = getSupabaseAdmin();
  const { data: integration, error: integrationError } = await admin
    .from("store_integrations")
    .select("id,store_id")
    .eq("provider", provider)
    .eq("external_account_id", externalAccountId)
    .eq("status", "CONNECTED")
    .maybeSingle();
  if (integrationError) throw integrationError;
  if (!integration) return;

  await saveWebhookEventForIntegration(
    integration as { id: string; store_id: string },
    provider,
    externalEventId,
    eventType,
    payload,
    externalAccountId
  );
}

async function getIntegrationByExternalAccount(
  provider: OAuthProvider,
  externalAccountId: string
) {
  const { data, error } = await getSupabaseAdmin()
    .from("store_integrations")
    .select("id,store_id,external_account_id")
    .eq("provider", provider)
    .eq("external_account_id", externalAccountId)
    .eq("status", "CONNECTED")
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; store_id: string; external_account_id: string } | null;
}

async function saveWebhookEventForIntegration(
  integration: { id: string; store_id: string; external_account_id?: string },
  provider: OAuthProvider,
  externalEventId: string,
  eventType: string,
  payload: Record<string, unknown>,
  externalAccountId = integration.external_account_id ?? null
) {
  const admin = getSupabaseAdmin();

  const { error } = await admin.from("channel_webhook_events").upsert({
    integration_id: integration.id,
    store_id: integration.store_id,
    provider,
    external_event_id: externalEventId,
    external_account_id: externalAccountId,
    event_type: eventType,
    payload,
  }, {
    onConflict: "integration_id,provider,external_event_id",
    ignoreDuplicates: true,
  });
  if (error) throw error;
}

async function disconnectIntegration(integrationId: string, storeId: string) {
  const admin = getSupabaseAdmin();
  const { error: credentialError } = await admin
    .from("store_integration_credentials")
    .delete()
    .eq("integration_id", integrationId);
  if (credentialError) throw credentialError;

  const { error: integrationError } = await admin
    .from("store_integrations")
    .update({
      status: "DISCONNECTED",
      external_account_id: null,
      external_account_name: null,
      connected_at: null,
      last_sync_at: null,
      error_message: null,
    })
    .eq("id", integrationId)
    .eq("store_id", storeId);
  if (integrationError) throw integrationError;
}

function redirectToChannels(reply: FastifyReply, provider: OAuthProvider, result: string) {
  const url = new URL("/channels", config.APP_URL);
  url.searchParams.set("provider", provider);
  url.searchParams.set("result", result);
  reply.header("Cache-Control", "no-store");
  return reply.redirect(url.toString());
}

function parseJsonBody<T extends z.ZodTypeAny>(body: unknown, schema: T) {
  if (typeof body !== "string") return schema.safeParse(body);
  try {
    return schema.safeParse(JSON.parse(body));
  } catch {
    return schema.safeParse(undefined);
  }
}

function parseWebhookBody(body: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(body) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function verifyMetaSignature(body: string, signature: string, secret: string): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  return safeEqual(signature, expected);
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (typeof value === "number" && Number.isFinite(value)) return value.toString();
  return null;
}

function credentialContext(integrationId: string, provider: OAuthProvider): string {
  return `${integrationId}:${provider}`;
}

function oauthStateContext(stateHash: string, provider: OAuthProvider): string {
  return `oauth-state:${stateHash}:${provider}`;
}

function publicError(error: unknown): string {
  return error instanceof Error ? error.message : "Channel operation failed";
}
