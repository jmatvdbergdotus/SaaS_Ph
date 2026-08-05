-- Support email-based Supabase Auth profiles.
--
-- Magic-link auth creates an auth.users row with an email address. The app profile
-- mirrors auth.users.id in public.users.id so RLS policies can use auth.uid().

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

ALTER TABLE public.users
  ALTER COLUMN phone_number DROP NOT NULL;
