// Adaptive difficulty — derives a "load" label from the user's 7-day on-time rate.
// The rate is computed locally from a small completion log we maintain when
// Canvas reports an assignment as submitted.

const KEY = "winston.completions.v1";

type Entry = { id: string; dueAt: number; submittedAt: number };

function load(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}
function save(entries: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-200)));
  } catch {
    /* ignore */
  }
}

export function recordCompletion(id: string, dueAt: Date) {
  const entries = load();
  if (entries.some((e) => e.id === id)) return;
  entries.push({ id, dueAt: dueAt.getTime(), submittedAt: Date.now() });
  save(entries);
}

export type LoadLevel = "light" | "standard" | "stretch";

export function computeLoad(): { onTimeRate: number; load: LoadLevel; sample: number } {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = load().filter((e) => e.submittedAt >= cutoff);
  if (recent.length === 0) return { onTimeRate: 1, load: "standard", sample: 0 };
  const onTime = recent.filter((e) => e.submittedAt <= e.dueAt).length;
  const rate = onTime / recent.length;
  const level: LoadLevel = rate > 0.85 ? "stretch" : rate < 0.65 ? "light" : "standard";
  return { onTimeRate: rate, load: level, sample: recent.length };
}

export const LOAD_COPY: Record<LoadLevel, { label: string; description: string }> = {
  light: { label: "Light", description: "Easier targets this week — rebuild momentum." },
  standard: { label: "Standard", description: "Normal load. Keep the pattern." },
  stretch: { label: "Stretch", description: "You're crushing it — quests get harder." },
};
