# Long-term engagement + Plain mode

Two parallel tracks. Plain mode is a single toggle in Settings; engagement features all read it and degrade gracefully (no XP, no companion, no cosmetics, no quests — just deadlines, plans, and streaks described literally).

## A. Plain mode (new)

- Add `plainMode: boolean` to `user_configs` (migration).
- New toggle in `src/routes/_authenticated/settings.tsx`: "Plain mode — no avatars, no XP, no game".
- When `plainMode` is on:
  - `Dashboard.tsx` hides: GamificationPanel, PlayerAvatar, CompanionAvatar, CompanionCloseup, quests, XP toasts, cosmetic dust.
  - ChatPanel keeps assistant replies but drops persona flavor — system prompt switches to a plain "study planner assistant" voice.
  - Streak shown as a literal counter: "On-time submissions: 7 days in a row" (no Bronze/Gold tier names, no badges).
  - Locker, Focus rewards, mastery sets — routes still exist but Dashboard nav hides their entry points.
- Onboarding wizard gets a final step: "Game-style or Plain?" — defaults to game-style for new users.

## B. Engagement mechanics (all 7)

### 1. Seasonal arcs (4-week cycles)
- `src/lib/seasons.ts`: arc registry (id, name, theme rotation, arc-only quest, limited cosmetic). 4 arcs hardcoded to rotate by ISO week mod.
- Dashboard banner shows current arc + days remaining + arc quest progress.
- Arc-only cosmetic is added to inventory on arc completion (clear ≥80% of arc quests).
- Hidden in plain mode.

### 2. Adaptive difficulty
- `src/lib/difficulty.ts`: compute 7-day rolling on-time rate from `flashcard_cards`/Canvas-derived completions stored locally (we don't have submissions table — use existing `winston.gamification` `lastActiveDay` + assignment due dates + a new `winston.completions.v1` local log written when user marks an assignment cleared via quest `clear-assignment`).
- Daily quest count: rate >85% → 6 quests, 65–85% → 5, <65% → 4 easier ones.
- Surfaced as "Today's load: light/standard/stretch" chip on Dashboard.
- Plain mode: ignored (no quests).

### 3. Streak ladder
- Extend `gamification.ts`: derive tier from `state.streak` (Bronze 3, Silver 7, Gold 14, Platinum 30).
- Breaking a streak drops one tier (set streak to previous tier's minimum) instead of zero.
- Tier persisted as `state.streakTier`; tier-up toast.
- Tier injected into system prompt as a tone trait ("Gold tier: remember the user's worst class and check in unprompted").
- Plain mode: tier hidden, raw day count shown.

### 4. Companion memory
- Add `companion_memory jsonb` to `user_configs` (array of {key, value, updatedAt}, capped at 5).
- New server fn `updateCompanionMemory` (auth) — called when chat assistant emits a `[remember: …]` tag (parse server-side in `src/routes/api/chat.ts`).
- Memory injected into system prompt block.
- Plain mode: disabled.

### 5. Sunday recap ritual
- New table `weekly_recaps` (user_id, week_of, summary jsonb, viewed_at, xp_awarded).
- Server fn `getOrCreateThisWeekRecap`: if today is Sun ≥9pm local (or any time on Mon before recap viewed), compose recap from `chat_messages`, `focus_sessions`, `flashcard_cards`, on-time count.
- Dashboard one-shot card "This week" — dismissing awards +50 XP (skipped in plain mode; card still shows summary text).

### 6. Boss assignments
- `src/lib/boss.ts`: detect from Canvas list — points_possible / course_points >20% OR title regex /\b(final|midterm|exam|capstone)\b/i.
- Boss tag rendered on the assignment row.
- Auto-generated checkpoint plan: T-7, T-3, T-1 study blocks inserted into `study_blocks` when user clicks "Plan boss".
- Plain mode: still shown — checkpoints are the value, not gamification.

### 7. Rest days
- `restDayUsed: Record<isoWeek, dateISO>` in gamification state.
- "Take a rest day" button on Dashboard, enabled only if (a) no past-due AND (b) all of THIS week's must-do quests done AND (c) not used this week.
- Spending it sets `lastActiveDay` to today without breaking streak and shows a calm confirmation.
- Plain mode: relabeled "Skip today without breaking your streak" — no game framing.

## Files touched

New:
- `src/lib/seasons.ts`
- `src/lib/difficulty.ts`
- `src/lib/boss.ts`
- `src/components/SeasonalArcBanner.tsx`
- `src/components/StreakTierBadge.tsx`
- `src/components/WeeklyRecapCard.tsx`
- `src/components/BossAssignmentRow.tsx` (or inline into Dashboard)
- `src/lib/recap.functions.ts`
- `src/lib/memory.functions.ts`

Edited:
- `src/lib/gamification.ts` (tier, rest day, soft-drop streak)
- `src/lib/companions.ts` (memory injection helper exported)
- `src/routes/api/chat.ts` (memory + tier + plain-mode system prompts, [remember:] parser)
- `src/components/Dashboard.tsx` (arc banner, difficulty chip, recap card, rest day, boss rows, plain-mode gates)
- `src/components/ChatPanel.tsx` (plain-mode label tweaks)
- `src/components/GamificationPanel.tsx` (tier badge, hidden in plain mode)
- `src/routes/_authenticated/settings.tsx` (plain mode toggle)
- `src/components/OnboardingWizard.tsx` (mode step)
- `src/lib/winston-store.ts` (expose plainMode)

DB migrations:
- ALTER TABLE user_configs ADD COLUMN plain_mode boolean NOT NULL DEFAULT false, ADD COLUMN companion_memory jsonb NOT NULL DEFAULT '[]'::jsonb
- CREATE TABLE weekly_recaps (id, user_id, week_of date, summary jsonb, viewed_at timestamptz, xp_awarded int DEFAULT 0, unique(user_id, week_of)) with RLS + grants

## Order of operations

1. Migrations (plain_mode + companion_memory + weekly_recaps).
2. `winston-store` + Settings toggle + Onboarding step (so plain mode exists and gates everything that follows).
3. Gamification: streak tier + rest day + soft-drop.
4. Seasons + difficulty + boss libs (pure logic, no DB).
5. Dashboard wiring (arc banner, difficulty chip, rest-day button, boss rows, plain-mode gates).
6. Recap server fn + card.
7. Companion memory server fn + chat.ts integration (memory, tier, plain-mode prompt).

Will ship in this order in one pass, then verify build.
