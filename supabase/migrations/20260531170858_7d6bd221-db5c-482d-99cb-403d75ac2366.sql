
-- Parent links: one row per (student, parent_email) sharing relationship
CREATE TABLE public.parent_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  parent_email text NOT NULL,
  parent_name text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'minimal' CHECK (mode IN ('minimal','shared')),
  paused boolean NOT NULL DEFAULT false,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX parent_links_active_unique
  ON public.parent_links (user_id, lower(parent_email))
  WHERE revoked_at IS NULL;
CREATE INDEX parent_links_user_idx ON public.parent_links(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_links TO authenticated;
GRANT ALL ON public.parent_links TO service_role;

ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own parent links" ON public.parent_links
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own parent links" ON public.parent_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own parent links" ON public.parent_links
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own parent links" ON public.parent_links
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER parent_links_updated_at
  BEFORE UPDATE ON public.parent_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Parent share tokens: opaque token granting read-only view of a single weekly digest
CREATE TABLE public.parent_share_tokens (
  token text NOT NULL PRIMARY KEY,
  parent_link_id uuid NOT NULL REFERENCES public.parent_links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'weekly' CHECK (kind IN ('weekly','ping')),
  week_of date NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX parent_share_tokens_link_idx ON public.parent_share_tokens(parent_link_id);
CREATE INDEX parent_share_tokens_user_idx ON public.parent_share_tokens(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_share_tokens TO authenticated;
GRANT ALL ON public.parent_share_tokens TO service_role;

ALTER TABLE public.parent_share_tokens ENABLE ROW LEVEL SECURITY;

-- Only the owning student can see their own tokens through RLS.
-- The public parent-facing page goes through a server function using the service role.
CREATE POLICY "Users view own share tokens" ON public.parent_share_tokens
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own share tokens" ON public.parent_share_tokens
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own share tokens" ON public.parent_share_tokens
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own share tokens" ON public.parent_share_tokens
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Parent share audit: every send/pause/revoke is logged so the student can review
CREATE TABLE public.parent_share_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_link_id uuid NOT NULL REFERENCES public.parent_links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('invite','weekly','ping','pause','resume','revoke')),
  payload_preview jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX parent_share_audit_link_idx ON public.parent_share_audit(parent_link_id);
CREATE INDEX parent_share_audit_user_idx ON public.parent_share_audit(user_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.parent_share_audit TO authenticated;
GRANT ALL ON public.parent_share_audit TO service_role;

ALTER TABLE public.parent_share_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit" ON public.parent_share_audit
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own audit" ON public.parent_share_audit
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own audit" ON public.parent_share_audit
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Weekly recap: student-editable note + per-week send status
ALTER TABLE public.weekly_recaps
  ADD COLUMN IF NOT EXISTS parent_note text,
  ADD COLUMN IF NOT EXISTS parent_send_status text NOT NULL DEFAULT 'pending'
    CHECK (parent_send_status IN ('pending','approved','skipped','sent'));
