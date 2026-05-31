// Pure helpers for the "Share with parents" feature — no server imports.
// Safe for both client and server bundles.

export type ParentStatus = "green" | "yellow" | "red";

export type ParentSharePayload = {
  status: ParentStatus;
  statusLabel: string;
  studentName: string;
  weekOf: string; // ISO date (Monday)
  streakDays?: number; // omitted in minimal mode
  note?: string; // student-written, optional
  tip: string;
  generatedAt: string; // ISO
};

export type ParentMode = "minimal" | "shared";

const TIPS: Record<ParentStatus, string[]> = {
  green: [
    "Things are steady. The best thing you can do is nothing — let them keep their rhythm.",
    "Tell them you noticed they've been on top of things. Specific > general.",
  ],
  yellow: [
    "Ask 'what's the hardest thing on your plate this week?' instead of 'did you do your homework?'",
    "Offer a small concrete help: a ride, a meal dropped off, an hour of quiet space.",
    "Resist the urge to ask about specific assignments. Curiosity, not interrogation.",
  ],
  red: [
    "Lead with care, not consequences. 'I love you and I noticed it's been a rough week.'",
    "Don't try to fix it in one conversation. Open the door and leave it open.",
    "Ask if they want help thinking it through, or just to vent. Let them pick.",
  ],
};

export function tipFor(status: ParentStatus, weekOf: string): string {
  const list = TIPS[status];
  // Stable pick per week so the tip doesn't churn on refresh
  const seed = weekOf.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
  return list[seed % list.length];
}

export function statusLabel(status: ParentStatus): string {
  if (status === "green") return "On track this week";
  if (status === "yellow") return "A little behind — could use encouragement";
  return "Struggling — consider checking in";
}

export type StatusInputs = {
  blocksCompleted: number;
  blocksOnTime: number;
  blocksTotal: number; // completed blocks for which we know on-time-ness
  focusSessions: number;
};

export function computeStatus(i: StatusInputs): ParentStatus {
  const onTimeRatio = i.blocksTotal > 0 ? i.blocksOnTime / i.blocksTotal : 1;
  if (i.blocksCompleted === 0 && i.focusSessions === 0) return "red";
  if (onTimeRatio < 0.5) return "red";
  if (i.blocksCompleted >= 3 && onTimeRatio >= 0.8) return "green";
  if (i.focusSessions >= 5 && onTimeRatio >= 0.8) return "green";
  return "yellow";
}

export function mondayISO(d = new Date()): string {
  const day = d.getUTCDay() || 7;
  const m = new Date(d);
  m.setUTCDate(m.getUTCDate() - day + 1);
  return m.toISOString().slice(0, 10);
}
