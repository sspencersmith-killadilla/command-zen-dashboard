
# Share with parents — privacy-first parent portal

Student owns the connection. Parent never sees assignment names, grades, chat, or wellness data. They see a weekly traffic light, an optional student-written note, and a "how to help" hint. Magic-link only — no parent account.

## User-facing flow

**Student side (Settings → "Share with parents"):**
1. Toggle on → enter parent name + email → app sends parent an intro email
2. Always-visible banner on dashboard: "Sharing weekly status with [parent name] · Pause · Revoke"
3. Sunday at 6pm local: app generates the week's status. Student gets a notification: "Your weekly recap is ready to share. Review before it sends Monday 8am." They can edit the optional note, toggle the streak number on/off, or skip the week entirely.
4. Button anywhere on dashboard: "Send parent a heads-up" → optional one-line note → fires immediately

**Parent side:**
- Weekly email from `notify.<yourdomain>`: "Weekly check-in from [student]" → magic link
- Link opens a read-only web page at `/p/[token]`:
  - Big traffic light (green / yellow / red) for the week
  - One-line status: "On track this week" / "A little behind — could use encouragement" / "Struggling — consider checking in"
  - Optional student note (italic, in quotes)
  - "How to help" tip matched to the status (e.g. yellow → "Ask 'what's the hardest thing on your plate?' instead of 'did you do your homework?'")
  - Footer: "Shared with [student]'s consent. Last shared [date]. Reply STOP to unsubscribe."
- Tokens rotate weekly — old links stop working after the next send

## Status calculation (no personal data leaks)

Traffic light is derived locally from existing signals — never names of assignments:
- **Green**: on-time % ≥ 80, planning sessions completed ≥ 2, streak intact
- **Yellow**: on-time % 50–79, OR planning skipped 3+ days, OR streak broken once
- **Red**: on-time % < 50, OR 2+ missed bosses/minibosses, OR streak broken multiple times

## Two modes (student picks at setup)

- **College / minimal** (default for plain mode users, 18+): traffic light + note only. No streak number. No "ask for help" auto-ping. Student must explicitly approve each send.
- **Family / shared**: traffic light + streak day count + "ask for help" button enabled. Sunday recap auto-sends Monday unless student skips. Same privacy ceiling — still no assignment data.

## Privacy guarantees enforced in code

- Parent payload is built from a whitelist of 4 fields: `status`, `streakDays?`, `note?`, `tip`. Schema is locked — never serialize raw assignments, grades, chat, or wellness.
- Parent token is opaque, single-purpose (read this week's digest only), expires when the next week's token is issued.
- "Pause sharing" toggle does not notify the parent. They just stop getting emails. (Escape hatch for coercive situations.)
- "Revoke" invalidates all tokens and removes the parent contact.
- All parent-facing routes log to `parent_share_audit` so the student can see what was sent and when.

## Technical plan

### Database (new migration)
```
parent_links (
  id uuid pk, user_id uuid, parent_email citext, parent_name text,
  mode text check (mode in ('minimal','shared')),
  paused boolean default false, created_at, revoked_at nullable,
  unique (user_id, parent_email) where revoked_at is null
)
parent_share_tokens (
  token text pk, parent_link_id uuid, week_of date,
  payload jsonb,            -- the locked 4-field shape, frozen at send time
  expires_at timestamptz, viewed_at timestamptz nullable
)
parent_share_audit (
  id uuid pk, parent_link_id uuid, kind text,  -- 'weekly'|'ping'|'pause'|'revoke'
  payload_preview jsonb, sent_at timestamptz
)
weekly_recaps.parent_note text   -- new column, student-edited
weekly_recaps.parent_send_status text default 'pending'  -- pending|approved|skipped|sent
```
All RLS scoped to `auth.uid()`. Public read of `parent_share_tokens` is via server route only (token in URL, not RLS).

### Server functions (`src/lib/parent.functions.ts`)
- `inviteParent({ email, name, mode })` — creates link, sends intro email
- `previewWeeklyShare()` — returns what the parent will see, for student review
- `updateWeeklyShare({ note, includeStreak, skip })` — student edits
- `sendParentPing({ note })` — manual heads-up
- `pauseParentShare()` / `revokeParentShare()`

### Public route (`src/routes/p/$token.tsx`)
- No auth, opaque token lookup, marks `viewed_at`
- Renders traffic-light card matching site visual style (works in both themed and plain modes — parent always sees plain)
- Includes generic "How to help" copy library keyed by status

### Email infrastructure
- Lovable Emails (built-in) — need to set up sender domain + transactional templates
- 3 templates: parent intro, weekly digest, manual ping
- Token magic link, no parent account, one-tap STOP/unsubscribe

### Cron
- Sunday 6pm per-user local time → compute status, create `parent_share_token` (status `pending`)
- Monday 8am local → if status `approved` or mode=shared and not `skipped`, send email

### UI
- `src/routes/_authenticated/settings.tsx` — new "Share with parents" card (invite, mode, pause, revoke, audit log)
- `src/components/Dashboard.tsx` — sharing banner when active; "Send parent a heads-up" in overflow menu
- `src/components/ParentSharePreview.tsx` — Sunday-night review modal launched from `WeeklyRecapCard`

## Out of scope (intentionally)
- Parent accounts, parent dashboards beyond the weekly page, push notifications to parents, real-time anything, multi-parent (v1: one parent per student)
- Exposing grades, course names, assignment titles, chat history, wellness logs, focus sessions — ever, in any mode

## Notes on the original question

Is it a bad idea? No, with these constraints. The product is "a status page the student curates," not "a parent dashboard." Three things make this work over time:
1. Student always sees what was sent (audit log) and can pause without notification
2. Parent never sees raw data, only a curated signal — removes the urge to micromanage
3. Weekly cadence, not real-time — turns the relationship into "Sunday conversation" instead of "live surveillance"

If the student is a minor in a coercive situation, the "pause without notify" escape hatch matters more than any feature.
