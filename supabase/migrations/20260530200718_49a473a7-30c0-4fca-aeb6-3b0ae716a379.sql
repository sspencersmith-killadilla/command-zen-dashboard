
-- Player avatar profile (one per user)
CREATE TABLE public.user_avatar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  body_type TEXT NOT NULL DEFAULT 'standard',
  skin_tone TEXT NOT NULL DEFAULT 'tone-3',
  hair_style TEXT NOT NULL DEFAULT 'short',
  hair_color TEXT NOT NULL DEFAULT 'brown',
  eye_style TEXT NOT NULL DEFAULT 'round',
  brow_style TEXT NOT NULL DEFAULT 'neutral',
  mouth_style TEXT NOT NULL DEFAULT 'smile',
  outfit_base TEXT NOT NULL DEFAULT 'tee-navy',
  background TEXT NOT NULL DEFAULT 'sky',
  equipped JSONB NOT NULL DEFAULT '{}'::jsonb,
  on_time_count INTEGER NOT NULL DEFAULT 0,
  mastery_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_avatar TO authenticated;
GRANT ALL ON public.user_avatar TO service_role;

ALTER TABLE public.user_avatar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own avatar"   ON public.user_avatar FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own avatar" ON public.user_avatar FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own avatar" ON public.user_avatar FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own avatar" ON public.user_avatar FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_avatar_updated
  BEFORE UPDATE ON public.user_avatar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Earned cosmetics inventory
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'on_time',
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX idx_user_inventory_user ON public.user_inventory(user_id);

GRANT SELECT, INSERT, DELETE ON public.user_inventory TO authenticated;
GRANT ALL ON public.user_inventory TO service_role;

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own inventory"   ON public.user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own inventory" ON public.user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own inventory" ON public.user_inventory FOR DELETE TO authenticated USING (auth.uid() = user_id);
