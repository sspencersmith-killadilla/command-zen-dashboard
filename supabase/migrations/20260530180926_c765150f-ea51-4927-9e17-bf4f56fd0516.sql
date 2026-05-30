ALTER TABLE public.user_configs
  ADD COLUMN IF NOT EXISTS canvas_api_token text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS canvas_domain text NOT NULL DEFAULT '';