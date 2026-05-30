import { useCallback, useEffect, useState } from "react";
import barnabyImg from "@/assets/companions/barnaby.png";
import roxieImg from "@/assets/companions/roxie.png";
import beanImg from "@/assets/companions/bean.png";
import mentoImg from "@/assets/companions/mento.png";
import pipImg from "@/assets/companions/pip.png";

export type CompanionId = "barnaby" | "roxie" | "bean" | "mento" | "pip";

export type Companion = {
  id: CompanionId;
  name: string;
  species: string;
  tagline: string;
  personality: string; // injected into system prompt
  sprite: string;
  glow: string; // oklch color for halo
  unlockHint: string;
  isUnlocked: (s: { xp: number; streak: number }) => boolean;
};

export const COMPANIONS: Companion[] = [
  {
    id: "barnaby",
    name: "Barnaby",
    species: "Owl",
    tagline: "The wise night-shift scholar.",
    personality:
      "calm, sharp, scholarly. Speaks like a wise mentor who has seen many semesters. Occasional dry humor.",
    sprite: barnabyImg,
    glow: "oklch(0.7 0.2 260 / 0.55)",
    unlockHint: "Starter pick",
    isUnlocked: () => true,
  },
  {
    id: "roxie",
    name: "Roxie",
    species: "Road Runner",
    tagline: "Speedrunner of deadlines.",
    personality:
      "fast, energetic, momentum-obsessed. Pushes for quick wins, time-boxing, and getting started NOW.",
    sprite: roxieImg,
    glow: "oklch(0.72 0.2 30 / 0.55)",
    unlockHint: "Starter pick",
    isUnlocked: () => true,
  },
  {
    id: "bean",
    name: "Bean",
    species: "Bobcat",
    tagline: "Stealthy focus coach.",
    personality:
      "cool, calm, focused. Speaks in short confident sentences. Loves deep work and silencing distractions.",
    sprite: beanImg,
    glow: "oklch(0.75 0.15 70 / 0.55)",
    unlockHint: "Starter pick",
    isUnlocked: () => true,
  },
  {
    id: "mento",
    name: "Mento",
    species: "Mouse",
    tagline: "Detail-hunting study buddy.",
    personality:
      "curious, precise, loves breaking things into tiny steps. Quizzes you, double-checks definitions, asks great questions.",
    sprite: mentoImg,
    glow: "oklch(0.75 0.15 320 / 0.55)",
    unlockHint: "Starter pick",
    isUnlocked: () => true,
  },
  {
    id: "pip",
    name: "Pip",
    species: "Terrier",
    tagline: "Loyal hype squad.",
    personality:
      "warm, loyal, endlessly encouraging. Celebrates every small win and reframes setbacks as XP.",
    sprite: pipImg,
    glow: "oklch(0.75 0.15 140 / 0.55)",
    unlockHint: "Starter pick",
    isUnlocked: () => true,
  },
];

export function getCompanion(id: CompanionId | null | undefined): Companion {
  return COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0];
}

const KEY = "companions.v1";

type CompanionState = {
  active: CompanionId | null;
  unlocked: CompanionId[];
};

const DEFAULT: CompanionState = { active: null, unlocked: [] };

function load(): CompanionState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function save(s: CompanionState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function useCompanions() {
  const [state, setState] = useState<CompanionState>(DEFAULT);

  useEffect(() => {
    setState(load());
  }, []);

  const choose = useCallback((id: CompanionId) => {
    setState((s) => {
      const next: CompanionState = {
        active: id,
        unlocked: s.unlocked.includes(id) ? s.unlocked : [...s.unlocked, id],
      };
      save(next);
      return next;
    });
  }, []);

  const unlock = useCallback((id: CompanionId) => {
    setState((s) => {
      if (s.unlocked.includes(id)) return s;
      const next = { ...s, unlocked: [...s.unlocked, id] };
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    save(DEFAULT);
    setState(DEFAULT);
  }, []);

  return {
    active: state.active ? getCompanion(state.active) : null,
    activeId: state.active,
    unlocked: state.unlocked,
    choose,
    unlock,
    reset,
    hasChosen: state.active !== null,
  };
}
