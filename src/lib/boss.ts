// "Boss" assignments — high-stakes work that deserves a multi-stage plan.
// Detect by title keyword (final/midterm/exam/capstone/project) OR by
// known-heavy weight when Canvas surfaces points_possible.

export type BossAssignmentInput = {
  id: string;
  title: string;
  dueAt: Date;
  pointsPossible?: number | null;
};

const KEYWORDS = /\b(final|midterm|exam|capstone|thesis|defense|presentation)\b/i;

export function isBoss(a: BossAssignmentInput): boolean {
  if (KEYWORDS.test(a.title)) return true;
  if (typeof a.pointsPossible === "number" && a.pointsPossible >= 100) return true;
  return false;
}

export type Checkpoint = {
  label: string;
  daysBefore: number;
  startsAt: Date;
  endsAt: Date;
  notes: string;
};

export function makeCheckpoints(a: BossAssignmentInput): Checkpoint[] {
  const due = a.dueAt.getTime();
  const day = 24 * 60 * 60 * 1000;
  return [
    { label: "Outline + sources", daysBefore: 7, notes: "Sketch the structure. Pull every source you'll need." },
    { label: "Draft the hard part", daysBefore: 3, notes: "Don't polish yet. Get the worst section on paper." },
    { label: "Final pass + submit", daysBefore: 1, notes: "Revise, proof, submit. No new work today." },
  ].map((c) => {
    const start = new Date(due - c.daysBefore * day);
    start.setHours(18, 0, 0, 0);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    return {
      label: `[${a.title}] ${c.label}`,
      daysBefore: c.daysBefore,
      startsAt: start,
      endsAt: end,
      notes: c.notes,
    };
  });
}
