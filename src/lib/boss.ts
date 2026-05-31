// Boss / miniboss tiering — high-stakes work that deserves a multi-stage plan.
//
// Tiers:
//   "boss"  — final/midterm/exam/capstone/thesis/defense titles, OR
//             an assignment worth ≥25% of all visible points in its course.
//   "mini"  — quiz/project/paper/essay/report/lab/presentation titles, OR
//             an assignment worth >10% (and <25%) of its course's visible points.
//   "none"  — everything else.
//
// Relative weighting uses the visible upcoming-assignment total per course
// (Canvas rarely exposes true grade weights), which gives a reasonable proxy
// for "this one matters more than the rest."

export type BossAssignmentInput = {
  id: string;
  title: string;
  dueAt: Date;
  courseCode?: string;
  pointsPossible?: number | null;
};

export type BossTier = "none" | "mini" | "boss";

const BOSS_KEYWORDS = /\b(final|midterm|exam|capstone|thesis|defense)\b/i;
const MINI_KEYWORDS = /\b(quiz|project|paper|essay|report|lab|presentation|midproject)\b/i;

const BOSS_SHARE = 0.25; // ≥25% of course points → boss
const MINI_SHARE = 0.10; // >10% of course points → miniboss

/**
 * Compute per-course point totals so an assignment's share can be evaluated.
 * Only counts assignments that actually report points_possible.
 */
export function courseTotals(
  items: { courseCode?: string; pointsPossible?: number | null }[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const a of items) {
    const code = a.courseCode ?? "";
    const pts = typeof a.pointsPossible === "number" ? a.pointsPossible : 0;
    if (pts > 0) totals[code] = (totals[code] ?? 0) + pts;
  }
  return totals;
}

export function bossTier(
  a: BossAssignmentInput,
  courseTotal?: number,
): BossTier {
  // 1) Title keywords win first — most reliable signal.
  if (BOSS_KEYWORDS.test(a.title)) return "boss";

  // 2) Weight-based, when points are available and course total is meaningful.
  if (
    typeof a.pointsPossible === "number" &&
    a.pointsPossible > 0 &&
    typeof courseTotal === "number" &&
    courseTotal > 0
  ) {
    const share = a.pointsPossible / courseTotal;
    if (share >= BOSS_SHARE) return "boss";
    if (share > MINI_SHARE) return "mini";
  }

  // 3) Miniboss keywords as fallback (no points data available).
  if (MINI_KEYWORDS.test(a.title)) return "mini";

  return "none";
}

/** Back-compat: boolean check for "is this a full boss?" */
export function isBoss(a: BossAssignmentInput, courseTotal?: number): boolean {
  return bossTier(a, courseTotal) === "boss";
}

export type Checkpoint = {
  label: string;
  daysBefore: number;
  startsAt: Date;
  endsAt: Date;
  notes: string;
};

/**
 * Build study-block checkpoints leading up to the due date.
 * Boss: 3 checkpoints (7d, 3d, 1d). Mini: 2 checkpoints (3d, 1d).
 */
export function makeCheckpoints(
  a: BossAssignmentInput,
  tier: BossTier = "boss",
): Checkpoint[] {
  const due = a.dueAt.getTime();
  const day = 24 * 60 * 60 * 1000;
  const plan =
    tier === "mini"
      ? [
          { label: "Block out + first pass", daysBefore: 3, notes: "Outline the work. Start the messy first version." },
          { label: "Tighten + submit", daysBefore: 1, notes: "Clean it up, proof, submit." },
        ]
      : [
          { label: "Outline + sources", daysBefore: 7, notes: "Sketch the structure. Pull every source you'll need." },
          { label: "Draft the hard part", daysBefore: 3, notes: "Don't polish yet. Get the worst section on paper." },
          { label: "Final pass + submit", daysBefore: 1, notes: "Revise, proof, submit. No new work today." },
        ];

  return plan.map((c) => {
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
