-- Store channel connection metadata.
-- OAuth credentials belong in a separate server-only store and must not be exposed
-- through this browser-readable table.

CREATE TABLE public.store_integrations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id              UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  provider              TEXT NOT NULL
    CHECK (provider IN ('FACEBOOK', 'INSTAGRAM', 'TIKTOK_SHOP', 'RAKET_PH')),
  status                TEXT NOT NULL DEFAULT 'DISCONNECTED'
    CHECK (status IN ('DISCONNECTED', 'PENDING', 'CONNECTED', 'MANUAL', 'ERROR')),
  external_account_id   TEXT,
  external_account_name TEXT,
  connected_at          TIMESTAMPTZ,
  last_sync_at          TIMESTAMPTZ,
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_integrations_store_provider_key UNIQUE (store_id, provider)
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_store_integrations_updated_at
BEFORE UPDATE ON public.store_integrations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.store_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_integrations_select_owned_store" ON public.store_integrations;
CREATE POLICY "store_integrations_select_owned_store"
ON public.store_integrations
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "store_integrations_insert_owned_store" ON public.store_integrations;
CREATE POLICY "store_integrations_insert_owned_store"
ON public.store_integrations
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "store_integrations_update_owned_store" ON public.store_integrations;
CREATE POLICY "store_integrations_update_owned_store"
ON public.store_integrations
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "store_integrations_delete_owned_store" ON public.store_integrations;
CREATE POLICY "store_integrations_delete_owned_store"
ON public.store_integrations
FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);
