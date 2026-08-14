-- Server-only storage for OAuth handshakes, channel credentials, and webhooks.
-- Browser clients must never be able to read provider tokens or raw event payloads.

CREATE TABLE public.channel_oauth_states (
  state_hash  TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id    UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL
    CHECK (provider IN ('FACEBOOK', 'INSTAGRAM', 'TIKTOK_SHOP')),
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_channel_oauth_states_expires_at
ON public.channel_oauth_states(expires_at);

ALTER TABLE public.channel_oauth_states ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.channel_oauth_states FROM PUBLIC, anon, authenticated;

CREATE TABLE public.store_integration_credentials (
  integration_id              UUID PRIMARY KEY
    REFERENCES public.store_integrations(id) ON DELETE CASCADE,
  encrypted_credentials       TEXT NOT NULL,
  access_token_expires_at     TIMESTAMPTZ,
  refresh_token_expires_at    TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_store_integration_credentials_updated_at
BEFORE UPDATE ON public.store_integration_credentials
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.store_integration_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.store_integration_credentials FROM PUBLIC, anon, authenticated;

CREATE TABLE public.channel_webhook_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id      UUID NOT NULL
    REFERENCES public.store_integrations(id) ON DELETE CASCADE,
  store_id            UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  provider            TEXT NOT NULL
    CHECK (provider IN ('FACEBOOK', 'INSTAGRAM', 'TIKTOK_SHOP')),
  external_event_id   TEXT NOT NULL,
  external_account_id TEXT,
  event_type          TEXT,
  payload             JSONB NOT NULL,
  status              TEXT NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED')),
  error_message       TEXT,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at        TIMESTAMPTZ,
  CONSTRAINT channel_webhook_events_provider_event_key
    UNIQUE (provider, external_event_id)
);

CREATE INDEX idx_channel_webhook_events_status_received_at
ON public.channel_webhook_events(status, received_at);

CREATE INDEX idx_channel_webhook_events_store_id
ON public.channel_webhook_events(store_id);

ALTER TABLE public.channel_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.channel_webhook_events FROM PUBLIC, anon, authenticated;
