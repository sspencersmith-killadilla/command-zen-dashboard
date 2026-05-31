import { useEffect, useState, useCallback } from "react";

// Video-game inspired progression. Universal RPG feel — no franchise lock-in.
export type Rank = {
  title: string;
  subtitle: string;
  minXp: number;
};

export const RANKS: Rank[] = [
  { title: "Rookie", subtitle: "Level 1 · Tutorial cleared", minXp: 0 },
  { title: "Scout", subtitle: "Level 2 · Side quests unlocked", minXp: 80 },
  { title: "Engineer", subtitle: "Level 3 · Workshop online", minXp: 200 },
  { title: "Specialist", subtitle: "Level 4 · Elite skill tree", minXp: 450 },
  { title: "Veteran", subtitle: "Level 5 · Boss-tier focus", minXp: 800 },
  { title: "Champion", subtitle: "Level 6 · Tournament ready", minXp: 1300 },
  { title: "Grandmaster", subtitle: "Level 7 · NG+ unlocked", minXp: 2000 },
  { title: "Legend", subtitle: "Level 8 · Speedrun the semester", minXp: 3000 },
];

export type Achievement = {
  id: string;
  name: string;
  hint: string;
  unlocked: (s: GameState) => boolean;
};

export type GameState = {
  xp: number;
  streak: number;
  lastActiveDay: string;
  copies: number;
  notebooksOpened: number;
  quests: Record<string, string>;
  /** ISO Monday → ISO date when rest day was used. One rest day per week. */
  restDays: Record<string, string>;
};

const KEY = "winston.gamification.v2";

const DEFAULT_STATE: GameState = {
  xp: 0,
  streak: 0,
  lastActiveDay: "",
  copies: 0,
  notebooksOpened: 0,
  quests: {},
  restDays: {},
};

export type StreakTier = "none" | "bronze" | "silver" | "gold" | "platinum";

export const STREAK_TIERS: { id: StreakTier; label: string; min: number }[] = [
  { id: "none", label: "Building", min: 0 },
  { id: "bronze", label: "Bronze", min: 3 },
  { id: "silver", label: "Silver", min: 7 },
  { id: "gold", label: "Gold", min: 14 },
  { id: "platinum", label: "Platinum", min: 30 },
];

export function tierForStreak(streak: number): { tier: StreakTier; label: string; next: number | null } {
  let current = STREAK_TIERS[0];
  let next: number | null = STREAK_TIERS[1]?.min ?? null;
  for (let i = 0; i < STREAK_TIERS.length; i++) {
    if (streak >= STREAK_TIERS[i].min) {
      current = STREAK_TIERS[i];
      next = STREAK_TIERS[i + 1]?.min ?? null;
    }
  }
  return { tier: current.id, label: current.label, next };
}

function dropOneTier(streak: number): number {
  // Find current tier, return previous tier's minimum (or 0)
  let prev = 0;
  for (const t of STREAK_TIERS) {
    if (streak >= t.min) {
      // keep moving up; prev becomes last min that's strictly less
    } else {
      break;
    }
    prev = t.min;
  }
  // step down one tier
  const idx = STREAK_TIERS.findIndex((t) => t.min === prev);
  return STREAK_TIERS[Math.max(0, idx - 1)]?.min ?? 0;
}

function weekKey(d = new Date()): string {
  const day = d.getUTCDay() || 7;
  const m = new Date(d);
  m.setUTCDate(m.getUTCDate() - day + 1);
  return m.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function load(): GameState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // migrate from v1 if present
      const v1 = localStorage.getItem("winston.gamification.v1");
      if (v1) return { ...DEFAULT_STATE, ...JSON.parse(v1) };
      return DEFAULT_STATE;
    }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(s: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", name: "First Blood", hint: "Earn your first 10 XP", unlocked: (s) => s.xp >= 10 },
  { id: "daily-reset", name: "Power-Up", hint: "Run the Daily Reset", unlocked: (s) => s.copies >= 1 },
  { id: "library-rat", name: "Loot Hunter", hint: "Open 5 notebooks", unlocked: (s) => s.notebooksOpened >= 5 },
  { id: "streak-3", name: "Combo x3", hint: "3-day streak", unlocked: (s) => s.streak >= 3 },
  { id: "streak-7", name: "Hot Streak", hint: "7-day streak", unlocked: (s) => s.streak >= 7 },
  { id: "streak-14", name: "Unstoppable", hint: "14-day streak", unlocked: (s) => s.streak >= 14 },
  { id: "level-5", name: "Veteran", hint: "Reach 800 XP", unlocked: (s) => s.xp >= 800 },
  { id: "level-7", name: "Grandmaster", hint: "Reach 2000 XP", unlocked: (s) => s.xp >= 2000 },
];

export function rankFor(xp: number): { current: Rank; next: Rank | null; level: number; progress: number } {
  let current = RANKS[0];
  let next: Rank | null = RANKS[1] ?? null;
  let level = 1;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
      level = i + 1;
    }
  }
  const floor = current.minXp;
  const ceil = next?.minXp ?? floor + 1;
  const progress = Math.min(100, Math.max(0, ((xp - floor) / (ceil - floor)) * 100));
  return { current, next, level, progress };
}

export const DAILY_QUESTS = [
  { id: "check-timeline", label: "Scout the timeline", xp: 10 },
  { id: "open-notebook", label: "Crack open a notebook", xp: 15 },
  { id: "copy-prompt", label: "Run the Daily Reset", xp: 20 },
  { id: "chat-winston", label: "Strategize with Barnaby", xp: 15 },
  { id: "clear-assignment", label: "Knock out an assignment", xp: 40 },
];

import { isFreezeAvailable, consumeFreeze } from "./consequences";

export function useGamification() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [lastGain, setLastGain] = useState<{ xp: number; at: number } | null>(null);

  useEffect(() => {
    const loaded = load();
    const t = today();
    if (loaded.lastActiveDay && loaded.lastActiveDay !== t) {
      const last = new Date(loaded.lastActiveDay);
      const diff = Math.round((Date.now() - last.getTime()) / 86400000);
      const usedRest = !!loaded.restDays?.[weekKey()];
      if (diff > 1) {
        if (isFreezeAvailable()) {
          consumeFreeze();
        } else if (!usedRest) {
          // Soft-drop: lose one tier instead of zeroing.
          loaded.streak = dropOneTier(loaded.streak);
        }
      }
    }
    setState(loaded);
  }, []);

  const persist = useCallback((updater: (s: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const completeQuest = useCallback((questId: string) => {
    const quest = DAILY_QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    const t = today();
    persist((s) => {
      if (s.quests[questId] === t) return s;
      const newStreak = s.lastActiveDay === t ? s.streak : s.streak + 1;
      const patch: Partial<GameState> = {
        xp: s.xp + quest.xp,
        quests: { ...s.quests, [questId]: t },
        lastActiveDay: t,
        streak: newStreak,
      };
      if (questId === "copy-prompt") patch.copies = s.copies + 1;
      if (questId === "open-notebook") patch.notebooksOpened = s.notebooksOpened + 1;
      setLastGain({ xp: quest.xp, at: Date.now() });
      return { ...s, ...patch };
    });
  }, [persist]);

  /** Apply a raw XP delta (penalty or refund/bonus). Never goes negative. */
  const applyXpDelta = useCallback((delta: number) => {
    if (!delta) return;
    persist((s) => ({ ...s, xp: Math.max(0, s.xp + delta) }));
    setLastGain({ xp: delta, at: Date.now() });
  }, [persist]);

  const reset = useCallback(() => persist(() => DEFAULT_STATE), [persist]);

  const takeRestDay = useCallback(() => {
    const wk = weekKey();
    const t = today();
    let took = false;
    persist((s) => {
      if (s.restDays?.[wk]) return s;
      took = true;
      return {
        ...s,
        lastActiveDay: t,
        restDays: { ...(s.restDays ?? {}), [wk]: t },
      };
    });
    return took;
  }, [persist]);

  const t = today();
  const todayQuestsDone = DAILY_QUESTS.filter((q) => state.quests[q.id] === t).map((q) => q.id);
  const restDayUsedThisWeek = !!state.restDays?.[weekKey()];
  const streakTier = tierForStreak(state.streak);

  return {
    state,
    completeQuest,
    applyXpDelta,
    reset,
    todayQuestsDone,
    lastGain,
    takeRestDay,
    restDayUsedThisWeek,
    streakTier,
  };
}
