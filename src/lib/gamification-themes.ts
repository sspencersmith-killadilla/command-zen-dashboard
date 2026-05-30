import type { ThemeId } from "./companions";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles, Swords, Trophy, Flame, Crown, Shield, Flower2, Sprout, Leaf, TreeDeciduous,
  Sun, Zap, Cpu, Radio, Satellite, Rocket, Sword, Wind, Moon, Star, Mountain,
  Clipboard, Medal, Target, Dumbbell,
  Train, TrainTrack, Clock, Flag, MapPin,
  Layers, Package, Album, ScanLine, BookMarked,
  CloudRain, CloudLightning, CloudSun, Thermometer, Gauge,
  Map as MapIcon, Compass, Mountain as MountainIcon, Globe, Footprints,
  Microscope, Telescope, Bone, Gem, BookOpen,
} from "lucide-react";

/** A single themed daily quest tied to a stable quest id. */
export type ThemedQuest = {
  /** Must match one of the gamification engine quest ids. */
  id: string;
  /** Themed label shown in the panel. */
  label: string;
  /** Tiny outcome word — what THIS step accomplishes in the narrative. */
  outcome: string;
  /** Icon for the step in the arc. */
  icon: LucideIcon;
  xp: number;
};

export type ThemePack = {
  /** Arc title shown above the quest list ("today, you will…"). */
  arcTitle: string;
  /** Sub-line under the arc title. */
  arcSubtitle: string;
  /** Final outcome shown when all 5 steps complete. */
  arcCompletePhrase: string;
  /** Theme accent color (the gold/highlight) as an OKLCH value. */
  accent: string;
  /** Background hue for the panel. */
  bgHue: string;
  /** HUD chip label (e.g. "Player Profile", "Field Report"). */
  hudLabel: string;
  /** Eight rank titles, level 1..8. */
  ranks: { title: string; subtitle: string; minXp: number }[];
  /** Daily quest pack, length 5, ids must match the engine quest ids. */
  quests: ThemedQuest[];
  /** Achievement display names keyed by engine achievement id. */
  achievementNames: Record<string, string>;
};

// Engine quest ids (stable across themes). Each pack maps to these.
const Q = {
  timeline: "check-timeline",
  notebook: "open-notebook",
  reset: "copy-prompt",
  chat: "chat-winston",
  assignment: "clear-assignment",
} as const;

// Engine achievement ids (stable across themes).
const A = {
  first: "first-step",
  reset: "daily-reset",
  library: "library-rat",
  s3: "streak-3",
  s7: "streak-7",
  s14: "streak-14",
  l5: "level-5",
  l7: "level-7",
} as const;

// --- Theme packs ---

const MYTHIC: ThemePack = {
  arcTitle: "Today's Rite",
  arcSubtitle: "Five small workings. Finish them and the day is sealed.",
  arcCompletePhrase: "The rite is complete. The day is yours.",
  accent: "oklch(0.85 0.18 90)",
  bgHue: "265",
  hudLabel: "Player Profile",
  ranks: [
    { title: "Acolyte", subtitle: "Level 1 · The first sigil drawn", minXp: 0 },
    { title: "Adept", subtitle: "Level 2 · Side rites unlocked", minXp: 80 },
    { title: "Conjurer", subtitle: "Level 3 · Workshop awake", minXp: 200 },
    { title: "Warden", subtitle: "Level 4 · Elite circles open", minXp: 450 },
    { title: "Sage", subtitle: "Level 5 · Boss-tier focus", minXp: 800 },
    { title: "Archmage", subtitle: "Level 6 · Tournament ready", minXp: 1300 },
    { title: "Oracle", subtitle: "Level 7 · The veil is thin", minXp: 2000 },
    { title: "Mythbearer", subtitle: "Level 8 · Legend of the term", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Scry the timeline", outcome: "Charted the week ahead", icon: Star, xp: 10 },
    { id: Q.notebook, label: "Crack open a tome", outcome: "Tome opened", icon: Crown, xp: 15 },
    { id: Q.reset, label: "Cast the Daily Reset", outcome: "Spell cast", icon: Sparkles, xp: 20 },
    { id: Q.chat, label: "Counsel with your companion", outcome: "Counsel heard", icon: Shield, xp: 15 },
    { id: Q.assignment, label: "Banish one assignment", outcome: "Beast slain", icon: Swords, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Sigil",
    [A.reset]: "Power Word",
    [A.library]: "Loremaster",
    [A.s3]: "Three-Day Vow",
    [A.s7]: "Sevenfold Path",
    [A.s14]: "Old Magic",
    [A.l5]: "Sage",
    [A.l7]: "Oracle",
  },
};

const SPORTS: ThemePack = {
  arcTitle: "Today's Game Plan",
  arcSubtitle: "Five plays on the board. Run them and we win the day.",
  arcCompletePhrase: "Final whistle. W in the books.",
  accent: "oklch(0.78 0.18 60)",
  bgHue: "30",
  hudLabel: "Field Report",
  ranks: [
    { title: "Walk-on", subtitle: "Level 1 · Roster spot earned", minXp: 0 },
    { title: "Bench Player", subtitle: "Level 2 · Got some minutes", minXp: 80 },
    { title: "Starter", subtitle: "Level 3 · First five", minXp: 200 },
    { title: "Captain", subtitle: "Level 4 · Wears the C", minXp: 450 },
    { title: "All-Star", subtitle: "Level 5 · Voted in", minXp: 800 },
    { title: "MVP", subtitle: "Level 6 · Most Valuable", minXp: 1300 },
    { title: "Champion", subtitle: "Level 7 · Trophy raised", minXp: 2000 },
    { title: "Hall of Famer", subtitle: "Level 8 · Jersey retired", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Watch the film", outcome: "Film reviewed", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Hit the playbook", outcome: "Plays studied", icon: Target, xp: 15 },
    { id: Q.reset, label: "Run the warm-up", outcome: "Warmed up", icon: Dumbbell, xp: 20 },
    { id: Q.chat, label: "Huddle with coach", outcome: "Huddle done", icon: Medal, xp: 15 },
    { id: Q.assignment, label: "Score a drive", outcome: "Touchdown", icon: Trophy, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Snap",
    [A.reset]: "Warm-Up",
    [A.library]: "Film Junkie",
    [A.s3]: "3-Game Streak",
    [A.s7]: "Hot Hand",
    [A.s14]: "Undefeated",
    [A.l5]: "All-Star",
    [A.l7]: "Champion",
  },
};

const ANIME: ThemePack = {
  arcTitle: "Today's Mission Scroll",
  arcSubtitle: "Five techniques to master before sundown.",
  arcCompletePhrase: "Mission complete. The sensei nods once.",
  accent: "oklch(0.78 0.22 340)",
  bgHue: "290",
  hudLabel: "Mission Log",
  ranks: [
    { title: "Genin", subtitle: "Level 1 · Headband earned", minXp: 0 },
    { title: "Apprentice", subtitle: "Level 2 · First scroll", minXp: 80 },
    { title: "Chūnin", subtitle: "Level 3 · Field-rated", minXp: 200 },
    { title: "Jōnin", subtitle: "Level 4 · Elite squad", minXp: 450 },
    { title: "Sword Saint", subtitle: "Level 5 · Blade unlocked", minXp: 800 },
    { title: "Captain", subtitle: "Level 6 · Leads a cell", minXp: 1300 },
    { title: "Sage", subtitle: "Level 7 · Mode activated", minXp: 2000 },
    { title: "Legend", subtitle: "Level 8 · Anime arc finale", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Read the mission scroll", outcome: "Scroll read", icon: Moon, xp: 10 },
    { id: Q.notebook, label: "Train at the dojo", outcome: "Form practiced", icon: Wind, xp: 15 },
    { id: Q.reset, label: "Meditate at sunrise", outcome: "Chakra balanced", icon: Sun, xp: 20 },
    { id: Q.chat, label: "Counsel with the sensei", outcome: "Wisdom received", icon: Star, xp: 15 },
    { id: Q.assignment, label: "Defeat the day's foe", outcome: "Foe defeated", icon: Sword, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Strike",
    [A.reset]: "Sunrise Form",
    [A.library]: "Scroll Reader",
    [A.s3]: "Three-Day Discipline",
    [A.s7]: "Sevenfold Path",
    [A.s14]: "Sage Mode",
    [A.l5]: "Sword Saint",
    [A.l7]: "Sage",
  },
};

const CYBER: ThemePack = {
  arcTitle: "Today's Run",
  arcSubtitle: "Five subroutines queued. Execute clean.",
  arcCompletePhrase: "Run complete. Uplink terminated.",
  accent: "oklch(0.85 0.18 200)",
  bgHue: "220",
  hudLabel: "Operator Status",
  ranks: [
    { title: "Initiate", subtitle: "Level 1 · Account spun up", minXp: 0 },
    { title: "Runner", subtitle: "Level 2 · First contract", minXp: 80 },
    { title: "Operator", subtitle: "Level 3 · Cleared overwatch", minXp: 200 },
    { title: "Specialist", subtitle: "Level 4 · Custom rig", minXp: 450 },
    { title: "Decker", subtitle: "Level 5 · Deep ICE", minXp: 800 },
    { title: "Architect", subtitle: "Level 6 · Builds the grid", minXp: 1300 },
    { title: "Ghost", subtitle: "Level 7 · No log left behind", minXp: 2000 },
    { title: "Legend", subtitle: "Level 8 · On the leaderboards", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Scan the grid", outcome: "Targets logged", icon: Satellite, xp: 10 },
    { id: Q.notebook, label: "Boot the deck", outcome: "Deck online", icon: Cpu, xp: 15 },
    { id: Q.reset, label: "Run the morning ping", outcome: "Pinged clean", icon: Radio, xp: 20 },
    { id: Q.chat, label: "Sync with the Oracle", outcome: "Comms synced", icon: Zap, xp: 15 },
    { id: Q.assignment, label: "Crack one contract", outcome: "Contract closed", icon: Rocket, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Login",
    [A.reset]: "Cold Boot",
    [A.library]: "Data Diver",
    [A.s3]: "3-Day Uptime",
    [A.s7]: "Week-Long Uplink",
    [A.s14]: "Permanent Connection",
    [A.l5]: "Decker",
    [A.l7]: "Ghost",
  },
};

const COTTAGE: ThemePack = {
  arcTitle: "Today's Garden",
  arcSubtitle: "Five small tendings. By dusk, the cottage glows.",
  arcCompletePhrase: "The garden is tended. The kettle's on.",
  accent: "oklch(0.78 0.16 130)",
  bgHue: "120",
  hudLabel: "Today's Tending",
  ranks: [
    { title: "Newcomer", subtitle: "Level 1 · Just moved in", minXp: 0 },
    { title: "Sapling", subtitle: "Level 2 · First sprout", minXp: 80 },
    { title: "Gardener", subtitle: "Level 3 · Beds in order", minXp: 200 },
    { title: "Herbalist", subtitle: "Level 4 · Shelf is stocked", minXp: 450 },
    { title: "Keeper", subtitle: "Level 5 · Knows every nook", minXp: 800 },
    { title: "Steward", subtitle: "Level 6 · Tends the woods", minXp: 1300 },
    { title: "Elder", subtitle: "Level 7 · Folk come for advice", minXp: 2000 },
    { title: "Lorekeeper", subtitle: "Level 8 · Of the small woods", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Walk the garden path", outcome: "Path walked", icon: Leaf, xp: 10 },
    { id: Q.notebook, label: "Open the recipe book", outcome: "Recipe found", icon: TreeDeciduous, xp: 15 },
    { id: Q.reset, label: "Water the flower beds", outcome: "Beds watered", icon: Flower2, xp: 20 },
    { id: Q.chat, label: "Tea with your companion", outcome: "Tea poured", icon: Sprout, xp: 15 },
    { id: Q.assignment, label: "Harvest one ripe task", outcome: "Harvested", icon: Sun, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Sprout",
    [A.reset]: "Morning Watering",
    [A.library]: "Well-Read",
    [A.s3]: "Three Quiet Days",
    [A.s7]: "Week of Tending",
    [A.s14]: "Settled In",
    [A.l5]: "Keeper",
    [A.l7]: "Elder",
  },
};

export const THEME_PACKS: Partial<Record<ThemeId, ThemePack>> = {
  mythic: MYTHIC,
  sports: SPORTS,
  anime: ANIME,
  cyber: CYBER,
  cottage: COTTAGE,
};

export function getThemePack(theme: ThemeId | string | null | undefined): ThemePack {
  if (theme && theme in THEME_PACKS) return THEME_PACKS[theme as ThemeId]!;
  return MYTHIC;
}

/** Fallback icon if a quest id is unknown. */
export { Sparkles, Flame, Trophy, Mountain };
