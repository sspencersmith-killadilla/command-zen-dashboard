## Goal
Turn the command center from "calm dashboard" into an end-to-end academic success coach: plan the work, surface what matters next, drill it into long-term memory, and protect the body that has to do it.

## What we'll add

### 1. Smart Study Planner
- New route `/_authenticated/plan` with a daily "Today" view and a weekly grid.
- Pulls Canvas assignments (already wired) + course weights from `user_configs.courses`, then auto-generates study blocks sized by `weight × days_until_due × estimated_effort`.
- Drag-to-reschedule; blocks sync to Google Calendar via the existing `google_calendar_tokens` connection.
- Companion (Barnaby/etc.) greets with "Here's your 3 most important blocks today."

### 2. Assignment Triage + Grade Forecast
- New route `/_authenticated/triage`: one ranked inbox of every open Canvas item.
  Score = `weight × urgency × (1 − completion)`, with one-click "Start now" → opens a Focus session pre-loaded with that assignment.
- Per-course grade card with a "what do I need on the final?" calculator and end-of-term GPA projection.
- Color-coded risk: green / amber / red so the user instantly sees which class is slipping.

### 3. Flashcards & Active Recall
- New route `/_authenticated/recall` + `flashcard_decks` and `flashcard_cards` tables (user-scoped, RLS by `auth.uid()`).
- "Generate deck from notes" action calls a `createServerFn` that pipes pasted notes / NotebookLM exports through Lovable AI (`google/gemini-2.5-flash`) to produce Q/A cards.
- SM-2 spaced-repetition review queue; each completed review awards XP through the existing gamification system and contributes to a daily streak.

### 4. Focus Sessions + Wellness Coaching (incl. nutrition & exercise)
- Focus: Pomodoro-style timer (25/5 default, configurable), session log in a new `focus_sessions` table, optional "block distracting sites" reminder, companion check-in on completion.
- Weekly Sunday reflection: companion asks 4 questions (wins, slips, blockers, top 3 goals), stored in `weekly_reflections`.
- Wellness panel on the dashboard with daily nudges:
  - **Sleep**: target bedtime based on first class tomorrow.
  - **Movement**: 20–30 min/day goal, simple log (walk / gym / sport), streak.
  - **Nutrition**: hydration counter (8 cups), 3 meals + protein/veg check-in, "fuel before exam" reminders the morning of any high-weight assignment.
  - **Burnout guardrail**: if >3 focus sessions/day for 4+ days with poor sleep logs, companion suggests a rest day.
- All wellness data stored in `wellness_logs` (date, sleep_hours, water_cups, meals_logged, movement_minutes, mood 1–5).

## New routes
```text
/_authenticated/plan          Study planner
/_authenticated/triage        Assignment triage + grade forecast
/_authenticated/recall        Flashcards (decks list + review)
/_authenticated/recall/$deck  Single deck review session
/_authenticated/focus         Focus timer + session history
/_authenticated/wellness      Wellness dashboard + logging
```
Nav entry points added to the existing Dashboard sidebar/cards.

## New tables (all RLS by `auth.uid() = user_id`, GRANTs for authenticated + service_role)
- `study_blocks` — id, user_id, course_id, title, starts_at, ends_at, source ('auto'|'manual'), gcal_event_id, completed_at
- `flashcard_decks` — id, user_id, title, course_id, source, created_at
- `flashcard_cards` — id, deck_id, user_id, front, back, ease, interval, due_at, last_reviewed_at
- `focus_sessions` — id, user_id, started_at, ended_at, planned_minutes, actual_minutes, assignment_ref, notes
- `weekly_reflections` — id, user_id, week_of, wins, slips, blockers, goals jsonb
- `wellness_logs` — id, user_id, log_date (unique per user), sleep_hours, water_cups, meals jsonb, movement_minutes, mood

## Server functions (TanStack `createServerFn`, all `requireSupabaseAuth`)
- `lib/planner.functions.ts` — `generateWeeklyPlan`, `rescheduleBlock`, `syncBlockToGoogleCalendar`
- `lib/triage.functions.ts` — `getTriageInbox`, `forecastGrade`
- `lib/recall.functions.ts` — `generateDeckFromText` (Lovable AI), `gradeCard` (SM-2 update)
- `lib/focus.functions.ts` — `startSession`, `endSession`, `getStreak`
- `lib/wellness.functions.ts` — `upsertWellnessLog`, `getWellnessTrends`, `getNudges`

## Gamification hooks
Reuse existing `user_inventory` + on-time count: award items for finishing focus sessions, hitting recall streaks, logging wellness 7 days running.

## Out of scope (ask later if wanted)
- Office hours / tutoring finder
- Study-group matcher
- Professor email drafter
- Mobile push notifications (browser-only nudges for now)
