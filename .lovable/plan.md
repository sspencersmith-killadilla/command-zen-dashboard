
## What you'll get

A single **Notifications** card in Settings where you opt into each channel independently, plus what triggers each one. Nothing fires until you turn it on. Then the guide gets a full refresh covering everything we've added (plain mode, parent share, focus, locker, themes, notifications).

## The three channels

```text
┌─────────────────────────┬─────────────────────────────────────────────┐
│ Channel                 │ Where it works                              │
├─────────────────────────┼─────────────────────────────────────────────┤
│ In-app                  │ Anywhere the tab is open. Toast + banner.   │
│ Browser push (OS-level) │ Published site only. iOS needs install.     │
│ Email digest            │ Always. Most reliable cross-device.         │
└─────────────────────────┴─────────────────────────────────────────────┘
```

## The two triggers

- **Due reminders** — for upcoming Canvas assignments. Fires at 24h, 2h, and at-due-time (in-app/push) or one rolled-up daily email.
- **Daily check-in** — one nudge per day at a time you pick (default 5pm). "You have 3 things due this week — clear what you can."

Each channel × trigger combo is its own switch. Default = all OFF.

## Plan

### 1. Schema (one migration)

- Extend `user_configs` with notification prefs (jsonb):
  ```json
  {
    "inapp":  { "due": false, "daily": false },
    "push":   { "due": false, "daily": false },
    "email":  { "due": false, "daily": false },
    "dailyCheckInTime": "17:00"
  }
  ```
- New `push_subscriptions` table — stores each browser's web-push endpoint + p256dh/auth keys per user (one user, many devices).
- New `notification_log` table — dedupes pings (so the 2h reminder doesn't fire twice if cron runs twice).

### 2. In-app reminders (no infra)

`useDueReminders()` hook on the dashboard. Polls assignments every 5 min, fires a `toast()` once per assignment+tier the first time it crosses 24h / 2h / overdue, persisted in localStorage so it doesn't re-toast on refresh.

### 3. Browser push (published site only)

- Add **public/sw.js** as a minimal push-only service worker (kill-switched in iframe per platform rules — only registers on the published domain).
- `src/lib/push.ts` — `subscribeToPush()` requests permission, registers SW, posts subscription to a server fn that stores it.
- `src/lib/notifications.functions.ts` — `subscribeToPush`, `unsubscribeFromPush`, `sendTestPush`.
- VAPID keys live in secrets (`VAPID_PUBLIC_KEY` public-OK, `VAPID_PRIVATE_KEY` secret, `VAPID_SUBJECT=mailto:...`).
- **Web push dispatch** uses pure-JS `web-push` via fetch (no Node native deps) so it runs in the Worker runtime.
- Settings UI: "Enable push on this device" button → requests permission → subscribes → shows ✓. Per device.

### 4. Email reminders (Lovable Cloud emails)

- Use Lovable Cloud's built-in email infra (setup_email_infra + scaffold_transactional_email). No Resend, no domain you have to verify yourself for the default flow.
- Two templates: `due-reminder-digest` (subject "3 items due this week"), `daily-check-in` (subject "Your 5pm check-in").
- Both render plain-mode-style (no game language) so they're safe for the parent-friendly inbox.

### 5. Cron jobs (pg_cron + pg_net hitting public TanStack routes)

- `/api/public/hooks/notifications-due` — every 30 min. Scans all users with any "due" channel on, checks their Canvas cache for items crossing thresholds, dispatches via the channels they opted into, logs to `notification_log`.
- `/api/public/hooks/notifications-daily-check-in` — every 15 min. Fires per-user when current UTC matches their `dailyCheckInTime` for their timezone (we'll store tz inferred from browser on first opt-in).
- Both endpoints authenticate with the Supabase anon key in `apikey` header (the standard public-route pattern).

### 6. Settings UI

New `<NotificationsPanel />` above the existing Integrations card:

```text
┌──────────────────────────────────────────────────────┐
│ Notifications                                        │
│ All off by default. You choose every channel.        │
│                                                      │
│  In-app reminders                                    │
│    [ ] Assignment due pings (24h / 2h / now)         │
│    [ ] Daily check-in                                │
│                                                      │
│  Browser push      [ Enable on this device ] ✓       │
│    [ ] Assignment due pings                          │
│    [ ] Daily check-in                                │
│                                                      │
│  Email digest                                        │
│    [ ] Weekly due-reminder digest                    │
│    [ ] Daily check-in email                          │
│                                                      │
│  Daily check-in time   [ 5:00 PM ▾ ]                 │
│                                                      │
│  [ Send a test notification ]                        │
└──────────────────────────────────────────────────────┘
```

Removes the old "Push / SMS alerts" toggle row in the Integrations card (it was never wired up).

### 7. Guide refresh

Rewrite `src/routes/guide.tsx` to cover:
- Dashboard, themes, companions, locker, XP/quests
- Plain mode (what it hides, what stays)
- Focus sessions
- Weekly recap
- Parent share — privacy model, modes, how to invite, what they see
- **Notifications — new section** explaining the three channels, the trade-offs, why iOS needs Install-to-Home, where to manage
- Canvas + Google Calendar setup (re-link to settings)
- FAQ + troubleshooting

Keep the visual style of the existing guide (cards, sections, anchors).

## What I'll need from you mid-flight

- Approve the migration before I write code (standard flow).
- Two VAPID keys — I'll generate them and request them via `add_secret`; you just click confirm. Takes 5 seconds.
- For Lovable Emails: I'll trigger `setup_email_infra` — you may be prompted to pick or add a sending domain. If you skip the domain step we can ship with `onboarding@resend.dev`-style fallback or postpone the email channel.

## What's intentionally out of scope

- **SMS** — Twilio adds cost + verification friction. Push + email cover the same ground.
- **iOS Safari push without install** — Apple doesn't allow it. We'll surface the "Add to Home Screen" hint when iOS users try to enable push.
- **Per-class** notification filters — keep it global for v1.
- **Quiet hours** — easy to add later if you find pings annoying; v1 just respects daily check-in time + the 2h/24h tier logic.

## File map

```text
supabase/migrations/<ts>_notifications.sql      ← new tables + user_configs col

public/sw.js                                    ← push-only SW (iframe-guarded)

src/lib/notifications.ts                        ← shared types/helpers
src/lib/notifications.functions.ts              ← serverFns (subscribe, send test, prefs)
src/lib/push.ts                                 ← client-side SW reg + perm request
src/lib/use-due-reminders.ts                    ← in-app toast hook
src/components/NotificationsPanel.tsx           ← settings UI

src/routes/api/public/hooks/notifications-due.ts
src/routes/api/public/hooks/notifications-daily-check-in.ts

src/routes/guide.tsx                            ← rewritten

Dashboard.tsx                                   ← mount useDueReminders()
settings.tsx                                    ← mount <NotificationsPanel />
```

## Approval

If the plan looks right, say go and I'll start with the migration. If you want to drop the email channel (skip the domain step), say so and I'll cut it from the build.
