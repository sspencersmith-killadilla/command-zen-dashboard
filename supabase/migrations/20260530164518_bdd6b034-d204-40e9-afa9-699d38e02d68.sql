ALTER TABLE public.user_configs
  ADD COLUMN IF NOT EXISTS companion_id text NOT NULL DEFAULT 'barnaby';