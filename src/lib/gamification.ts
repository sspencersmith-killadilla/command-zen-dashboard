import { useEffect, useState, useCallback } from "react";

// FMA-flavored alchemist ranks. XP-gated.
export type Rank = {
  title: string;
  subtitle: string;
  minXp: number;
};

export const RANKS: Rank[] = [
  { title: "Apprentice", subtitle: "Novice Transmuter", minXp: 0 },
  { title: "Certified Alchemist", subtitle: "Equivalent Exchange Initiate", minXp: 100 },
  { title: "State Alchemist", subtitle: "Silver Pocketwatch Earned", minXp: 300 },
  { title: "Crystal Alchemist", subtitle: "Master of Form", minXp: 600 },
  { title: "Flame Alchemist", subtitle: "Snap Ignition Approved", minXp: 1000 },
  { title: "Fullmetal Alchemist", subtitle: "Hero of the People", minXp: 1500 },
  { title: "Philosopher", subtitle: "Truth Glimpsed", minXp: 2500 },
];

export type Achievement = {
  id: string;
  name: string;
  hint: string;
  // condition is evaluated against the GameState
  unlocked: (s: GameState) => boolean;
};

export type GameState = {
  xp: number;
  streak: number;
  lastActiveDay: string; // YYYY-MM-DD
  copies: number; // Gemini prompt copies
  notebooksOpened: number;
  quests: Record<string, string>; // questId -> YYYY-MM-DD completed
};

const KEY = "winston.gamification.v1";

const DEFAULT_STATE: GameState = {
  xp: 0,
  streak: 0,
  lastActiveDay: "",
  copies: 0,
  notebooksOpened: 0,
  quests: {},
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function load(): GameState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
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
  { id: "first-step", name: "First Transmutation", hint: "Earn your first 10 XP", unlocked: (s) => s.xp >= 10 },
  { id: "daily-reset", name: "Equivalent Exchange", hint: "Copy the Daily Reset prompt", unlocked: (s) => s.copies >= 1 },
  { id: "library-rat", name: "Central Library Rat", hint: "Open 5 notebooks", unlocked: (s) => s.notebooksOpened >= 5 },
  { id: "streak-3", name: "Three-Day Array", hint: "3-day streak", unlocked: (s) => s.streak >= 3 },
  { id: "streak-7", name: "Briggs Discipline", hint: "7-day streak", unlocked: (s) => s.streak >= 7 },
  { id: "flame", name: "Flame Alchemist", hint: "Reach 1000 XP", unlocked: (s) => s.xp >= 1000 },
  { id: "fullmetal", name: "Fullmetal", hint: "Reach 1500 XP", unlocked: (s) => s.xp >= 1500 },
];

export function rankFor(xp: number): { current: Rank; next: Rank | null; progress: number } {
  let current = RANKS[0];
  let next: Rank | null = RANKS[1] ?? null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  const floor = current.minXp;
  const ceil = next?.minXp ?? floor + 1;
  const progress = Math.min(100, Math.max(0, ((xp - floor) / (ceil - floor)) * 100));
  return { current, next, progress };
}

export const DAILY_QUESTS = [
  { id: "open-notebook", label: "Open a notebook", xp: 15 },
  { id: "copy-prompt", label: "Run the Daily Reset", xp: 20 },
  { id: "check-timeline", label: "Review your timeline", xp: 10 },
];

export function useGamification() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);

  useEffect(() => {
    const loaded = load();
    // Streak rollover on mount
    const t = today();
    if (loaded.lastActiveDay && loaded.lastActiveDay !== t) {
      const last = new Date(loaded.lastActiveDay);
      const diff = Math.round((Date.now() - last.getTime()) / 86400000);
      if (diff > 1) loaded.streak = 0;
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
      if (s.quests[questId] === t) return s; // already done today
      const newStreak = s.lastActiveDay === t ? s.streak : s.streak + 1;
      const patch: Partial<GameState> = {
        xp: s.xp + quest.xp,
        quests: { ...s.quests, [questId]: t },
        lastActiveDay: t,
        streak: newStreak,
      };
      if (questId === "copy-prompt") patch.copies = s.copies + 1;
      if (questId === "open-notebook") patch.notebooksOpened = s.notebooksOpened + 1;
      return { ...s, ...patch };
    });
  }, [persist]);

  const reset = useCallback(() => persist(() => DEFAULT_STATE), [persist]);

  const t = today();
  const todayQuestsDone = DAILY_QUESTS.filter((q) => state.quests[q.id] === t).map((q) => q.id);

  return { state, completeQuest, reset, todayQuestsDone };
}
