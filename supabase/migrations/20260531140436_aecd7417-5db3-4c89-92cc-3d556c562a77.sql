
ALTER TABLE public.user_configs
  ADD COLUMN IF NOT EXISTS plain_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS companion_memory jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.weekly_recaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_of date NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  viewed_at timestamptz,
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_of)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_recaps TO authenticated;
GRANT ALL ON public.weekly_recaps TO service_role;

ALTER TABLE public.weekly_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own recaps" ON public.weekly_recaps
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own recaps" ON public.weekly_recaps
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own recaps" ON public.weekly_recaps
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own recaps" ON public.weekly_recaps
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_recaps_updated_at
  BEFORE UPDATE ON public.weekly_recaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
