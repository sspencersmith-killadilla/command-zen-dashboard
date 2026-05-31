## 1. Simplify companion language (keep personalities)

In `src/lib/companions.ts`, rewrite the five persona archetypes (`SAGE`, `CHILL`, `HYPE`, `GUARDIAN`, `TRICKSTER`) so the **voice cues stay** but the language is plainer for students:

- Cap responses at ~2–3 short sentences (or a 3-item list) by default.
- Target ~8th-grade reading level: short words, no archaic phrasing, no jargon, no theatrical filler.
- Keep one signature tic per archetype so personality survives:
  - Sage: one calm, direct question, then the answer. Drop "Indeed."/"the old texts."
  - Chill: short, low-key, contractions, no slang stacking.
  - Hype: one short pep line + one concrete 5-minute step. No em-dash chains.
  - Guardian: one warm line + the single most important next deadline.
  - Trickster: one light tease + the real plan. No "boss/champ" sarcasm.
- Add a global rule in `src/routes/api/chat.ts` system prompt: "Use plain language. Avoid filler, theatrics, and long openers. Bold the one next action."

The per-companion `tagline` and `species` stay untouched, so the roster still feels distinct.

## 2. "Plan my day" quick action

In `src/components/ChatPanel.tsx`, add a fourth quick-action button next to **Daily Reset / What's due this week? / Break down my next assignment**:

- Label: **"Plan my day"** (icon: `CalendarCheck`).
- Prompt: "Build me a realistic plan for today. Use my real Canvas list. Give me 3 time-boxed blocks I can actually finish before bed, in priority order. Bold the first one."
- Wire to `quickAsk` like the others; mark a new `plan-day` quest as complete.

## 3. Silent, static closeup (no sound, no motion)

- **`src/components/ChatPanel.tsx`**: remove the `useMumble` import + hook, the `speak`/`stop`/`speakingId` wiring, both `unlockAudio()` calls, and the `onToggleSpeak` prop on `CompanionCloseup`. Drive `closeup.open` purely from "new assistant message arrived" — open on arrival, auto-close after ~6 seconds.
- **`src/components/CompanionCloseup.tsx`**: drop `canSpeak`, `isSpeaking`, `onToggleSpeak`, the speak/stop button, the `closeup-jaw` animation class, and the "speaking" dot indicator. Bump the frame from 180px → ~240px so the face reads larger. Remove the `closeup-bob` class so the portrait sits still.
- Leave `src/lib/use-mumble.ts` and `src/lib/mumble.ts` in place (unused) so we don't churn other files; they can be deleted in a follow-up if you'd like.

## 4. Assignment window: 7 / 14 / 30 days (default 30)

- In `src/lib/canvas.functions.ts` / `src/lib/canvas.server.ts`, cap returned assignments at **30 days out** from today (currently 60).
- In `src/components/Dashboard.tsx`, above the "Up Next" list, add a small segmented control: **1 week · 2 weeks · 30 days**, defaulting to 30 days, persisted to `useWinstonConfig` as `assignmentWindowDays`. The filter applies on the client to the already-fetched list, so switching is instant.
- Same window is passed into the chat context block in `src/routes/api/chat.ts` so the companion only references assignments inside the chosen window.

## 5. Long-term engagement (anti-mastery) — proposed roadmap

The current loop (daily quests + XP + cosmetics + companion unlocks per level) is great for week 1–3 but plateaus once a student has seen every theme and hit max level. To stay sticky for a full semester:

1. **Seasonal arcs (4-week cycles).** Each arc introduces a new theme rotation, a limited-time cosmetic, and an arc-only daily quest ("Citations Week", "Finals Sprint"). Old themes remain unlocked; the *featured* rotation changes. Prevents "I've already collected everything."
2. **Difficulty that scales with the student, not the calendar.** Track 7-day rolling on-time submission rate. If it stays >85%, daily quests get harder (more blocks, tighter focus sessions, "no quick-action chat today"). If it drops, they get gentler. Mastery never sticks because the bar moves.
3. **Streak depth, not streak length.** Replace pure day-streaks with a **streak ladder** (Bronze 3d → Silver 7d → Gold 14d → Platinum 30d). Each tier unlocks a permanent tone trait on the companion ("Gold streak: Barnaby now remembers your worst class and checks in on it unprompted"). Breaking a streak drops one tier, not to zero — punishment without despair.
4. **Companion memory & callbacks.** Persist 3–5 facts per user (worst class, best study time, last big win) in `user_configs.companion_memory` and inject into the system prompt. After ~2 weeks the companion sounds like it actually knows them — extremely hard to replicate by re-reading a guide.
5. **End-of-week ritual.** Sunday 9pm: companion DMs a 60-second recap (what you crushed, what slipped, the one thing for Monday). One-shot card on the dashboard — closing it grants the week's XP. Anchors the app to a weekly habit, not just daily.
6. **"Boss" assignments.** Auto-detect assignments worth >20% of the grade (or flagged "exam"/"final" in the title) and surface a multi-stage quest line with checkpoint deadlines a week out, three days out, the night before. These take real planning to clear — not gameable by spamming chat.
7. **Quiet days are wins too.** A "rest day" mechanic: students can spend one rest day per week without breaking their streak, but only if they've cleared that week's must-do list. Rewards finishing early instead of grinding.

I'd recommend shipping **#1 (seasonal arcs)**, **#3 (streak ladder)**, and **#5 (Sunday recap)** first — they're the highest engagement-per-line-of-code and don't require new AI behavior. #2 and #4 are a second sprint.

## Technical notes

- The `assignmentWindowDays` filter is purely a UI/context concern; no DB schema change.
- Removing audio doesn't require touching `src/lib/mumble.ts` — just unwire it from `ChatPanel`.
- Persona rewrite is the only change that affects the model output; everything else is presentational.
