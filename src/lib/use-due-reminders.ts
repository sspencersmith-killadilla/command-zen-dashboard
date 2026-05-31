import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { CanvasAssignment } from "./canvas.functions";
import { dueDedupeKey } from "./notifications";

const STORAGE_KEY = "winston.inapp-due-fired.v1";

function loadFired(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function saveFired(s: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

type Tier = "24h" | "2h" | "now";

function tierFor(dueAt: Date, now: number): Tier | null {
  const ms = dueAt.getTime() - now;
  if (ms <= 0 && ms > -12 * 60 * 60 * 1000) return "now"; // within 12h overdue
  if (ms > 0 && ms <= 2 * 60 * 60 * 1000) return "2h";
  if (ms > 0 && ms <= 24 * 60 * 60 * 1000 && ms > 2 * 60 * 60 * 1000) return "24h";
  return null;
}

function copyFor(a: CanvasAssignment, tier: Tier): { title: string; body: string } {
  if (tier === "now")
    return { title: `Due now: ${a.title}`, body: `${a.courseCode} — submit when ready.` };
  if (tier === "2h")
    return { title: `Due in ~2 hours`, body: `${a.title} (${a.courseCode}).` };
  return { title: `Due tomorrow`, body: `${a.title} (${a.courseCode}).` };
}

export function useDueReminders(opts: {
  enabled: boolean;
  assignments: CanvasAssignment[];
}) {
  const { enabled, assignments } = opts;
  const firedRef = useRef<Set<string>>(loadFired());

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    const fire = () => {
      const now = Date.now();
      const fired = firedRef.current;
      let changed = false;
      for (const a of assignments) {
        if (a.submitted) continue;
        const due = new Date(a.dueAt);
        const t = tierFor(due, now);
        if (!t) continue;
        const key = dueDedupeKey(a.id, t);
        if (fired.has(key)) continue;
        fired.add(key);
        changed = true;
        const c = copyFor(a, t);
        toast(c.title, {
          description: c.body,
          action: a.htmlUrl
            ? { label: "Open", onClick: () => window.open(a.htmlUrl, "_blank") }
            : undefined,
        });
      }
      if (changed) saveFired(fired);
    };
    fire();
    const interval = setInterval(fire, 5 * 60 * 1000); // every 5 min while tab open
    return () => clearInterval(interval);
  }, [enabled, assignments]);
}
