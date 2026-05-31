// Seasonal arcs — 4-week rotating themes. Each arc has a name, a flavor blurb,
// and an arc-only "extra quest" that supplements daily ones. Cycles by ISO week.

export type SeasonArc = {
  id: string;
  name: string;
  blurb: string;
  extraQuestId: string;
  extraQuestLabel: string;
  rewardItemId: string;
};

export const SEASON_ARCS: SeasonArc[] = [
  {
    id: "scout",
    name: "Scouting Week",
    blurb: "Get the lay of the land. Open every notebook at least once.",
    extraQuestId: "season-scout",
    extraQuestLabel: "Open 3 different notebooks today",
    rewardItemId: "season-scout-pin",
  },
  {
    id: "citations",
    name: "Citations Sprint",
    blurb: "Two weeks of source-stacking. Tag what you cite, when you cite it.",
    extraQuestId: "season-cite",
    extraQuestLabel: "Log one source you used today",
    rewardItemId: "season-citations-pin",
  },
  {
    id: "finals",
    name: "Finals Sprint",
    blurb: "Heads down. Two long focus blocks a day, every day.",
    extraQuestId: "season-finals",
    extraQuestLabel: "Finish two focus sessions today",
    rewardItemId: "season-finals-pin",
  },
  {
    id: "recovery",
    name: "Recovery Arc",
    blurb: "Maintain the streak. Light load, real rest. No grinding.",
    extraQuestId: "season-recovery",
    extraQuestLabel: "Log a wellness entry today",
    rewardItemId: "season-recovery-pin",
  },
];

const EPOCH = new Date(Date.UTC(2024, 0, 1));
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ARC_WEEKS = 4;

export function currentSeasonArc(now = new Date()): {
  arc: SeasonArc;
  weekInArc: number;
  daysRemaining: number;
} {
  const weeksSince = Math.floor((now.getTime() - EPOCH.getTime()) / WEEK_MS);
  const cycleIndex = Math.floor(weeksSince / ARC_WEEKS) % SEASON_ARCS.length;
  const weekInArc = (weeksSince % ARC_WEEKS) + 1;
  const arc = SEASON_ARCS[cycleIndex];
  const daysSince = Math.floor((now.getTime() - EPOCH.getTime()) / (24 * 60 * 60 * 1000));
  const dayInArc = daysSince % (ARC_WEEKS * 7);
  const daysRemaining = ARC_WEEKS * 7 - dayInArc;
  return { arc, weekInArc, daysRemaining };
}
