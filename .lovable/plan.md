## Goal

Replace the fake "Google connected" toggle with real Google sign-in **and** real per-user Google Calendar access (read + write), and move config off `localStorage` into Lovable Cloud so phone and laptop stay in sync.

## What changes

### 1. Authentication (Lovable Cloud + Google)
- New `/login` route: email-magic-link OR "Continue with Google" (managed by Lovable, no API keys needed).
- New `_authenticated` layout route — everything (dashboard, settings, onboarding) moves inside it so unauthed visitors get bounced to `/login`.
- Wire `attachSupabaseAuth` in `src/start.ts` and add an `onAuthStateChange` listener in `__root.tsx` to invalidate queries on sign-in/out.

### 2. Per-user Google Calendar (read + write)
- Use Lovable's **app-user OAuth flow** for the `google_calendar` connector. This is a separate consent screen from sign-in — the user signs in (gets an account), then explicitly clicks "Connect Google Calendar" and grants read+write Calendar scopes.
- After consent, Lovable returns a `connection_id` which we store on the user's row in `user_configs.google_connection_id`.
- Server function `callAsAppUser(...)` makes Calendar API calls using that connection_id.
- The onboarding "Connect Google Calendar" step becomes a real button that kicks off the OAuth round-trip and lands back on the wizard.

### 3. Cloud-synced config (replaces localStorage)
New `user_configs` table:
```
id              uuid pk
user_id         uuid unique references auth.users
display_name    text
canvas_feed_url text
courses         jsonb         -- [{id,name,notebookUrl}]
google_connection_id text     -- set after Calendar OAuth
notifications_enabled boolean
onboarded       boolean
updated_at      timestamptz
```
- RLS: user can read/update only their own row.
- Auto-create row on signup via trigger.
- `useWinstonConfig` hook rewritten to read/write through a `createServerFn` (TanStack Query), with optimistic updates.
- On first sign-in, if `localStorage` has a config, migrate it into the row, then clear it.

### 4. Files touched

**New**
- `supabase/migrations/<ts>_user_configs.sql` — table, RLS, trigger
- `src/routes/login.tsx` — sign-in page
- `src/routes/_authenticated.tsx` — auth gate layout
- `src/routes/oauth/google-calendar/return.tsx` — OAuth callback landing
- `src/lib/winston-store.functions.ts` — `getMyConfig`, `updateMyConfig` server fns
- `src/lib/google-calendar.functions.ts` — `startGoogleCalendarConnect`, server fn that calls `authorizeAppUserOAuth`
- `src/integrations/lovable/appUserConnector.ts` — server-only helper (from Lovable knowledge)

**Modified**
- `src/start.ts` — append `attachSupabaseAuth` to `functionMiddleware`
- `src/routes/__root.tsx` — `onAuthStateChange` query invalidation
- `src/routes/index.tsx` → moves to `src/routes/_authenticated/index.tsx`
- `src/routes/settings.tsx` → moves to `src/routes/_authenticated/settings.tsx` (drop the "set up your own Supabase" walkthrough; add Sign out + "Reconnect Google Calendar" buttons)
- `src/components/OnboardingWizard.tsx` — Google step becomes real OAuth button
- `src/components/Dashboard.tsx` — name pulled from cloud config
- `src/lib/winston-store.ts` — hook becomes thin wrapper around React Query

### 5. What I need from you to finish

I'll need to link the **Google app-user connector** to this project (a one-time setup that gives Lovable permission to broker per-user Google OAuth for Calendar scopes). I'll prompt you to confirm that when I get to that step.

## Caveats
- Google sign-in itself does NOT grant Calendar API access — that's why there are two steps (sign in, then connect Calendar). Standard OAuth pattern, but worth knowing.
- The simulated assignments stay as-is in this pass; wiring the real Canvas `.ics` parser is a separate change.

Approve and I'll build it.