-- Replace manual Raket.ph tracking with server-managed WooCommerce and Shopify connections.

-- Raket.ph is no longer a supported provider. Cascades remove any server-only
-- credentials and webhook events associated with a legacy integration.
DELETE FROM public.store_integrations
WHERE provider = 'RAKET_PH';

ALTER TABLE public.store_integrations
  DROP CONSTRAINT IF EXISTS store_integrations_provider_check,
  ADD CONSTRAINT store_integrations_provider_check
    CHECK (provider IN (
      'FACEBOOK',
      'INSTAGRAM',
      'TIKTOK_SHOP',
      'WOOCOMMERCE',
      'SHOPIFY'
    ));

ALTER TABLE public.store_integrations
  DROP CONSTRAINT IF EXISTS store_integrations_status_check,
  ADD CONSTRAINT store_integrations_status_check
    CHECK (status IN ('DISCONNECTED', 'PENDING', 'CONNECTED', 'ERROR'));

ALTER TABLE public.channel_oauth_states
  ADD COLUMN context_encrypted TEXT;

ALTER TABLE public.channel_oauth_states
  DROP CONSTRAINT IF EXISTS channel_oauth_states_provider_check,
  ADD CONSTRAINT channel_oauth_states_provider_check
    CHECK (provider IN (
      'FACEBOOK',
      'INSTAGRAM',
      'TIKTOK_SHOP',
      'WOOCOMMERCE',
      'SHOPIFY'
    ));

ALTER TABLE public.channel_webhook_events
  DROP CONSTRAINT IF EXISTS channel_webhook_events_provider_check,
  ADD CONSTRAINT channel_webhook_events_provider_check
    CHECK (provider IN (
      'FACEBOOK',
      'INSTAGRAM',
      'TIKTOK_SHOP',
      'WOOCOMMERCE',
      'SHOPIFY'
    ));

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_channel_check,
  ADD CONSTRAINT orders_channel_check
    CHECK (channel IN (
      'FACEBOOK',
      'TIKTOK',
      'INSTAGRAM',
      'WOOCOMMERCE',
      'SHOPIFY',
      'DIRECT',
      'WALK_IN'
    ));

-- Every supported integration now carries provider credentials. Only the API
-- service role may create or change integration metadata.
REVOKE INSERT, UPDATE, DELETE ON public.store_integrations FROM authenticated;

DROP POLICY IF EXISTS "store_integrations_insert_owned_store" ON public.store_integrations;
DROP POLICY IF EXISTS "store_integrations_update_owned_store" ON public.store_integrations;
DROP POLICY IF EXISTS "store_integrations_delete_owned_store" ON public.store_integrations;
