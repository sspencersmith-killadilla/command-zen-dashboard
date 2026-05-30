import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Soft consequences engine — six nudges (never a stick):
 *  1. Streak freeze: one free miss per ISO-week before the streak breaks.
 *  2. XP penalty + recovery: -20 XP when an assignment is >24h overdue,
 *     +10 XP refunded when you finally submit it. Never goes negative.
 *  3. Companion mood: 'happy' | 'concerned' | 'sad' based on past-due count.
 *  4. Perfect-day lock: the +50 XP daily bonus is unavailable while anything
 *     is past due. Restored the moment you clear them.
 *  5. Cosmetic dust (tarnish flag): equipped cosmetics get a grey overlay
 *     while past-due > 0. Read by PlayerAvatar via useTarnishFlag().
 *  6. Quiet HUD warning: a small amber "Past due: N" chip — no modals.
 *
 * All state is local (localStorage). No server changes. Penalties are
 * tracked per-assignment so we never double-charge or double-refund.
 */

export const PENALTY_XP = 20;
export const REFUND_XP = 10;
export const PERFECT_DAY_XP = 50;
export const OVERDUE_GRACE_MS = 24 * 60 * 60 * 1000;

type PenaltyRecord = { penalizedAt: number; refundedAt?: number };
type PenaltyMap = Record<string, PenaltyRecord>;

const PENALTY_KEY = "winston.penalties.v1";
const FREEZE_KEY = "winston.freeze.v1";
const PERFECT_KEY = "winston.perfect-day.v1";
const TARNISH_KEY = "winston.tarnish.v1";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function weekKey() {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1); // Monday
  return d.toISOString().slice(0, 10);
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

/** Streak freeze: returns true if a freeze is available this week. */
export function isFreezeAvailable(): boolean {
  if (typeof window === "undefined") return true;
  const used = localStorage.getItem(FREEZE_KEY);
  return used !== weekKey();
}
/** Consume the weekly freeze. Idempotent within a week. */
export function consumeFreeze() {
  try {
    localStorage.setItem(FREEZE_KEY, weekKey());
  } catch {
    /* ignore */
  }
}

/** Has the user already claimed today's perfect-day bonus? */
export function perfectDayClaimedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PERFECT_KEY) === todayISO();
}
export function markPerfectDayClaimed() {
  try {
    localStorage.setItem(PERFECT_KEY, todayISO());
  } catch {
    /* ignore */
  }
}

/** Lightweight tarnish flag. PlayerAvatar reads this without needing the full hook. */
export function useTarnishFlag(): boolean {
  const [t, setT] = useState(false);
  useEffect(() => {
    const read = () => setT(localStorage.getItem(TARNISH_KEY) === "1");
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === TARNISH_KEY) read();
    };
    window.addEventListener("storage", onStorage);
    // Also poll on a microtask so same-tab writes update soon after.
    const id = window.setInterval(read, 2_000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(id);
    };
  }, []);
  return t;
}

export type ConsequenceAssignment = {
  id: string;
  dueAt: Date;
  submitted?: boolean;
};

export type Mood = "happy" | "concerned" | "sad";

export type ConsequenceFlavor = {
  mood: Mood;
  /** One-line in-character note shown under the companion name. */
  companionNote: string;
};

const FLAVOR: Record<Mood, string> = {
  happy: "",
  concerned: "Coach is checking the clock.",
  sad: "Coach is pacing the dugout.",
};

export function useConsequences({
  assignments,
  onXpDelta,
}: {
  assignments: ConsequenceAssignment[];
  /** Apply an XP delta to the gamification store. Use negative for penalty. */
  onXpDelta: (delta: number) => void;
}) {
  const penaltiesRef = useRef<PenaltyMap>(loadJSON<PenaltyMap>(PENALTY_KEY, {}));
  const [tick, setTick] = useState(0);

  const now = Date.now();

  const pastDue = useMemo(
    () =>
      assignments.filter(
        (a) => !a.submitted && a.dueAt.getTime() < now,
      ),
    [assignments, now, tick],
  );
  const pastDueCount = pastDue.length;

  // 1. Apply penalty for any assignment >24h overdue and not yet penalized.
  //    Refund for any previously-penalized assignment that's now submitted.
  useEffect(() => {
    const pen = penaltiesRef.current;
    let dirty = false;
    let totalDelta = 0;
    let penalized = 0;
    let refunded = 0;

    for (const a of assignments) {
      const rec = pen[a.id];
      const overdueMs = now - a.dueAt.getTime();

      if (a.submitted) {
        if (rec && !rec.refundedAt) {
          rec.refundedAt = now;
          totalDelta += REFUND_XP;
          refunded += 1;
          dirty = true;
        }
        continue;
      }

      if (!rec && overdueMs > OVERDUE_GRACE_MS) {
        pen[a.id] = { penalizedAt: now };
        totalDelta -= PENALTY_XP;
        penalized += 1;
        dirty = true;
      }
    }

    if (dirty) {
      saveJSON(PENALTY_KEY, pen);
      if (totalDelta !== 0) onXpDelta(totalDelta);
      // Toast feedback handled by caller via mood transitions; keep silent here
      // to avoid spam on first paint of many overdue items.
      void penalized;
      void refunded;
      setTick((t) => t + 1);
    }
  }, [assignments, now, onXpDelta]);

  // 5. Cosmetic dust flag — mirror past-due > 0 to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(TARNISH_KEY, pastDueCount > 0 ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [pastDueCount]);

  const mood: Mood =
    pastDueCount === 0 ? "happy" : pastDueCount <= 2 ? "concerned" : "sad";

  const flavor: ConsequenceFlavor = { mood, companionNote: FLAVOR[mood] };

  // 4. Perfect-day claim — gated on no past-due and not yet claimed today.
  const perfectDayLocked = pastDueCount > 0;
  const perfectDayClaimed = perfectDayClaimedToday();
  const canClaimPerfectDay = !perfectDayLocked && !perfectDayClaimed;

  const claimPerfectDay = useCallback(() => {
    if (perfectDayLocked || perfectDayClaimedToday()) return false;
    markPerfectDayClaimed();
    onXpDelta(PERFECT_DAY_XP);
    return true;
  }, [perfectDayLocked, onXpDelta]);

  return {
    pastDue,
    pastDueCount,
    mood,
    flavor,
    perfectDayLocked,
    perfectDayClaimed,
    canClaimPerfectDay,
    claimPerfectDay,
    freezeAvailable: isFreezeAvailable(),
  };
}
