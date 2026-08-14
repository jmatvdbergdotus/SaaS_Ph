# Channel Integrations

This guide covers the secure connection layer for Facebook, Instagram, TikTok
Shop, WooCommerce, and Shopify.

## What is implemented

- Authenticated connect, account selection, reconnect, and disconnect actions.
- One-time OAuth state with a ten-minute expiry and replay protection.
- AES-256-GCM encryption for provider access and refresh tokens.
- Server-only database tables protected by Row Level Security and revoked grants.
- Meta, TikTok Shop, WooCommerce, and Shopify callback handlers.
- Provider-specific webhook signature verification.
- Deduplicated webhook storage linked to a known store integration.
- Per-integration event deduplication so unrelated merchant stores cannot
  suppress one another's provider deliveries.
- Automatic WooCommerce and Shopify webhook registration after authorization.
- Public-host validation for merchant-entered WooCommerce URLs to block private
  network access from the API server.

The webhook queue is the secure intake layer. Translating each approved event
into Sari-SaaS orders, inventory changes, and message threads is a separate
processor step because the event shapes and permissions depend on the APIs that
each provider approves for the app.

## 1. Apply the database migration

From the repository root in Git Bash:

```bash
pnpm db:migrate
```

This applies the channel migrations through
`012_scope_channel_webhook_deduplication.sql`. Verify that every local migration
has a matching remote version:

```bash
pnpm --dir packages/db supabase migration list --linked
```

Then regenerate database types after any migration that changes columns or
tables:

```bash
pnpm --filter=@sari-saas/db generate-types
```

## 2. Configure the local environment

Create or update the root `.env` file. Generate the token encryption key and a
separate webhook verification token:

```bash
openssl rand -base64 32
openssl rand -hex 24
```

Put the first output in `INTEGRATION_TOKEN_ENCRYPTION_KEY` and the second in
`FACEBOOK_VERIFY_TOKEN`. Never use a `NEXT_PUBLIC_` prefix for either value or
for any provider secret.

The web app also needs this value in `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production, set `APP_URL` to the public HTTPS web address and `API_URL` to
the public HTTPS API address. OAuth providers cannot deliver callbacks or
webhooks to a private localhost address in a production setup.

The Channels page asks the API which providers are ready. A connection button
remains unavailable until the provider's complete server-side configuration is
present. WooCommerce and Shopify additionally require a public HTTPS `API_URL`;
the localhost defaults are suitable for ordinary app development but not for a
live authorization callback.

## 3. Configure Meta

1. Create a Meta Developer App for the business integration.
2. Configure these exact OAuth redirect addresses:
   - `{API_URL}/channels/oauth/facebook/callback`
   - `{API_URL}/channels/oauth/instagram/callback`
3. Set the webhook callback to `{API_URL}/channels/webhooks/meta`.
4. Enter the same value used for `FACEBOOK_VERIFY_TOKEN` when Meta asks for the
   webhook verification token.
5. Add only the permissions used by the product. Current defaults request Page
   listing, Page engagement, Page metadata, Facebook messaging, Instagram basic
   access, and Instagram messaging.
6. Put the App ID and App Secret in the matching Facebook and Instagram
   environment variables. The same Meta app values may be used for both flows.
7. Link the Instagram professional account to a Facebook Page before testing
   the Instagram flow.
8. Add app-role test users while the Meta app is in development mode. Complete
   Business Verification and App Review before connecting merchants who are
   not app-role users.

The Meta Graph API version is configurable through `META_GRAPH_API_VERSION` so
it can be upgraded without changing source code.

## 4. Configure TikTok Shop

1. Register in TikTok Shop Partner Center and create an app or service.
2. Enable the smallest seller scopes needed for the first release. Shop
   authorization is required; order, product, and webhook scopes should only be
   added when their processors are implemented.
3. Copy the App Key, App Secret, and Service ID into the API environment.
4. Copy the regional authorization and API hosts shown by Partner Center into
   `TIKTOK_AUTH_BASE_URL` and `TIKTOK_API_BASE_URL`.
5. Set the redirect address to `{API_URL}/channels/oauth/tiktok/callback`.
6. Set the webhook address to `{API_URL}/channels/webhooks/tiktok` and select
   only the approved event types the app processes.
7. Use a Development Shop first. Publish the TikTok app before attempting to
   authorize unrelated production sellers.

TikTok authorization codes are short-lived and single-use. The API exchanges
them immediately and stores access and refresh expiry dates with the encrypted
credentials.

## 5. Configure WooCommerce

WooCommerce issues a different REST API key for each connected merchant, so
there is no shared WooCommerce client secret to put in `.env`.

1. Deploy or expose the API at a public HTTPS `API_URL`. WooCommerce requires an
   HTTPS callback URL; `http://localhost:3001` cannot receive a live connection.
2. Set `WOOCOMMERCE_APP_NAME` to the name shown on the WordPress approval page.
3. Keep `WOOCOMMERCE_AUTH_SCOPE=read_write`. Read access is used to validate and
   sync store data; write access is required to register the webhooks.
4. On the Channels page, enter the store's HTTPS root address, including any
   WordPress subdirectory, then select **Connect WooCommerce**.
5. Sign in to WordPress as an administrator and approve the requested access.

The callback receives the generated consumer key and secret directly from the
store. The API validates them, registers order and product webhooks, encrypts
the keys, and never returns them to the browser. Merchant-entered URLs are
restricted to public HTTPS hosts, redirects are rejected, and DNS results are
checked before server-side requests.

## 6. Configure Shopify

1. Create an app in the Shopify Partner Dashboard.
2. Set the app URL to the public web application URL.
3. Add this exact allowed redirection URL:
   - `{API_URL}/channels/oauth/shopify/callback`
4. Copy the Client ID and Client Secret into `SHOPIFY_CLIENT_ID` and
   `SHOPIFY_CLIENT_SECRET` on the API server.
5. Configure the same Admin API scopes listed in `SHOPIFY_SCOPES`. The defaults
   are read-only order, product, inventory, and location scopes.
6. Keep `SHOPIFY_API_VERSION` on a supported stable Shopify Admin API version
   and review it during Shopify's scheduled version upgrades.
7. On the Channels page, enter the store's permanent domain, such as
   `my-store.myshopify.com`, then select **Connect Shopify**.

The callback HMAC, one-time state, and requested shop domain are all checked
before the authorization code is exchanged. The API then verifies the shop,
registers order, product, inventory, and uninstall webhooks, and encrypts the
offline access token. Shopify webhook HMACs are checked before payloads enter
the queue.

## 7. Run and test

Start both services from the repository root:

```bash
pnpm dev
```

Open `http://localhost:3000/channels`. A provider button becomes active only
when its full server configuration is present. Test this sequence for each
provider:

1. Select Connect.
2. Approve access on the provider's own page.
3. For Meta or TikTok, choose the correct Page or shop when more than one is
   returned. WooCommerce and Shopify connect the store entered on the card.
4. Confirm that the card shows Connected and the external account name.
5. Send a provider test webhook and confirm a row appears in the server-only
   `channel_webhook_events` table.
6. Select Disconnect and confirm both the status and encrypted credential row
   are removed.

## Processing scope

Signed webhook events are safely accepted and queued, but they are not yet
translated into local orders or inventory movements. Build that processor with
provider event fixtures, idempotent order mapping, inventory conflict rules,
retry limits, and a dead-letter workflow before treating channel data as fully
synced.
