-- Deduplicate provider deliveries within one connected store integration.
-- Provider delivery identifiers are not guaranteed to be globally unique
-- across unrelated merchant accounts.

ALTER TABLE public.channel_webhook_events
  DROP CONSTRAINT IF EXISTS channel_webhook_events_provider_event_key;

ALTER TABLE public.channel_webhook_events
  ADD CONSTRAINT channel_webhook_events_integration_provider_event_key
    UNIQUE (integration_id, provider, external_event_id);
