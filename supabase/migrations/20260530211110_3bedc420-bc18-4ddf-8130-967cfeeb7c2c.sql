-- =========================================
-- study_blocks
-- =========================================
CREATE TABLE public.study_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  notes TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  gcal_event_id TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_blocks TO authenticated;
GRANT ALL ON public.study_blocks TO service_role;

ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own study blocks" ON public.study_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own study blocks" ON public.study_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own study blocks" ON public.study_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own study blocks" ON public.study_blocks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_study_blocks_user_starts ON public.study_blocks(user_id, starts_at);

CREATE TRIGGER update_study_blocks_updated_at
BEFORE UPDATE ON public.study_blocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- flashcard_decks
-- =========================================
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  course_id TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_decks TO authenticated;
GRANT ALL ON public.flashcard_decks TO service_role;

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own decks" ON public.flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own decks" ON public.flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own decks" ON public.flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own decks" ON public.flashcard_decks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_flashcard_decks_updated_at
BEFORE UPDATE ON public.flashcard_decks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- flashcard_cards
-- =========================================
CREATE TABLE public.flashcard_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_cards TO authenticated;
GRANT ALL ON public.flashcard_cards TO service_role;

ALTER TABLE public.flashcard_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cards" ON public.flashcard_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cards" ON public.flashcard_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cards" ON public.flashcard_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cards" ON public.flashcard_cards FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_flashcard_cards_due ON public.flashcard_cards(user_id, due_at);
CREATE INDEX idx_flashcard_cards_deck ON public.flashcard_cards(deck_id);

CREATE TRIGGER update_flashcard_cards_updated_at
BEFORE UPDATE ON public.flashcard_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- focus_sessions
-- =========================================
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  planned_minutes INTEGER NOT NULL DEFAULT 25,
  actual_minutes INTEGER,
  assignment_ref TEXT,
  course_id TEXT,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_sessions TO authenticated;
GRANT ALL ON public.focus_sessions TO service_role;

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own focus sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own focus sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own focus sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own focus sessions" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_focus_sessions_user_started ON public.focus_sessions(user_id, started_at DESC);

-- =========================================
-- weekly_reflections
-- =========================================
CREATE TABLE public.weekly_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_of DATE NOT NULL,
  wins TEXT,
  slips TEXT,
  blockers TEXT,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_of)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reflections TO authenticated;
GRANT ALL ON public.weekly_reflections TO service_role;

ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reflections" ON public.weekly_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reflections" ON public.weekly_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reflections" ON public.weekly_reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reflections" ON public.weekly_reflections FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_reflections_updated_at
BEFORE UPDATE ON public.weekly_reflections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- wellness_logs
-- =========================================
CREATE TABLE public.wellness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  sleep_hours REAL,
  water_cups INTEGER NOT NULL DEFAULT 0,
  meals JSONB NOT NULL DEFAULT '{}'::jsonb,
  movement_minutes INTEGER NOT NULL DEFAULT 0,
  movement_type TEXT,
  mood INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_logs TO authenticated;
GRANT ALL ON public.wellness_logs TO service_role;

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wellness logs" ON public.wellness_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wellness logs" ON public.wellness_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own wellness logs" ON public.wellness_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own wellness logs" ON public.wellness_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_wellness_logs_user_date ON public.wellness_logs(user_id, log_date DESC);

CREATE TRIGGER update_wellness_logs_updated_at
BEFORE UPDATE ON public.wellness_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();