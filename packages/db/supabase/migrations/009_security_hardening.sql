-- Harden merchant-controlled writes and make onboarding atomic.

CREATE OR REPLACE FUNCTION public.create_store_profile(
  p_store_name TEXT,
  p_owner_name TEXT,
  p_contact_number TEXT,
  p_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_email TEXT;
  v_store_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_store_name IS NULL OR char_length(btrim(p_store_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Store name must be between 1 and 120 characters';
  END IF;

  IF p_owner_name IS NULL OR char_length(btrim(p_owner_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Owner name must be between 1 and 120 characters';
  END IF;

  IF p_contact_number IS NULL OR btrim(p_contact_number) !~ '^\+?[0-9]{7,15}$' THEN
    RAISE EXCEPTION 'Contact number must contain 7 to 15 digits';
  END IF;

  IF p_address IS NOT NULL AND char_length(btrim(p_address)) > 500 THEN
    RAISE EXCEPTION 'Address must not exceed 500 characters';
  END IF;

  SELECT email
  INTO v_email
  FROM auth.users
  WHERE id = v_user_id;

  INSERT INTO public.users (id, email, last_login_at)
  VALUES (v_user_id, v_email, now())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      last_login_at = EXCLUDED.last_login_at;

  SELECT store_id
  INTO v_store_id
  FROM public.users
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_store_id IS NOT NULL THEN
    RETURN v_store_id;
  END IF;

  -- Recover a store left behind by an interrupted legacy onboarding attempt.
  SELECT id
  INTO v_store_id
  FROM public.stores
  WHERE owner_id = v_user_id
  ORDER BY created_at
  LIMIT 1;

  IF v_store_id IS NULL THEN
    INSERT INTO public.stores (
      owner_id,
      name,
      owner_name,
      contact_number,
      address
    )
    VALUES (
      v_user_id,
      btrim(p_store_name),
      btrim(p_owner_name),
      btrim(p_contact_number),
      NULLIF(btrim(p_address), '')
    )
    RETURNING id INTO v_store_id;
  END IF;

  UPDATE public.users
  SET store_id = v_store_id
  WHERE id = v_user_id;

  RETURN v_store_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_store_profile(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_store_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Profiles and stores are created only through the atomic onboarding function.
REVOKE INSERT, UPDATE ON public.users FROM authenticated;
REVOKE INSERT, UPDATE ON public.stores FROM authenticated;
GRANT UPDATE (
  name,
  owner_name,
  address,
  contact_number,
  dti_registration_number,
  bir_tin
) ON public.stores TO authenticated;

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
CREATE POLICY "users_insert_own_profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = id
  AND (
    store_id IS NULL
    OR store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "stores_insert_owned" ON public.stores;
CREATE POLICY "stores_insert_owned"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = (SELECT auth.uid())
  AND plan = 'FREE'
  AND monthly_order_count = 0
  AND trustmark_verified = false
  AND trustmark_badge_url IS NULL
);

DROP TRIGGER IF EXISTS set_stores_updated_at ON public.stores;
CREATE TRIGGER set_stores_updated_at
BEFORE UPDATE ON public.stores
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Browser clients can read every channel state, but can only toggle manual
-- Raket.ph tracking. OAuth-backed states are written by the server service role.
REVOKE INSERT, UPDATE ON public.store_integrations FROM authenticated;
GRANT INSERT (store_id, provider, status) ON public.store_integrations TO authenticated;
GRANT UPDATE (status) ON public.store_integrations TO authenticated;

DROP POLICY IF EXISTS "store_integrations_insert_owned_store" ON public.store_integrations;
CREATE POLICY "store_integrations_insert_owned_store"
ON public.store_integrations
FOR INSERT
TO authenticated
WITH CHECK (
  provider = 'RAKET_PH'
  AND status IN ('DISCONNECTED', 'MANUAL')
  AND external_account_id IS NULL
  AND external_account_name IS NULL
  AND connected_at IS NULL
  AND last_sync_at IS NULL
  AND error_message IS NULL
  AND store_id IN (
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
  provider = 'RAKET_PH'
  AND store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  provider = 'RAKET_PH'
  AND status IN ('DISCONNECTED', 'MANUAL')
  AND external_account_id IS NULL
  AND external_account_name IS NULL
  AND connected_at IS NULL
  AND last_sync_at IS NULL
  AND error_message IS NULL
  AND store_id IN (
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
  provider = 'RAKET_PH'
  AND store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);
