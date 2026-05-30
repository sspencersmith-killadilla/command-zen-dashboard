import type { ThemeId } from "./companions";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles, Swords, Trophy, Flame, Crown, Shield, Flower2, Sprout, Leaf, TreeDeciduous,
  Sun, Zap, Cpu, Radio, Satellite, Rocket, Sword, Wind, Moon, Star, Mountain,
  Clipboard, Medal, Target, Dumbbell,
  Train, TrainTrack, Clock, Flag,
  Layers, Package, Album, ScanLine, BookMarked,
  CloudLightning, CloudSun, Thermometer, Gauge,
  Map as MapIcon, Compass, Globe, Footprints, MapPin,
  Microscope, Telescope, Bone, BookOpen,
  Car, Wrench, Bot, Code, Sofa, Palette, Mic, Drama, Video, Camera,
  Gamepad2, Library as LibraryIcon, Plane, Briefcase, DollarSign, TrendingUp, Hammer,
  Lightbulb, Clapperboard, Film, Joystick, Search, Luggage, LineChart, BarChart3,
  Headphones, Music, Ruler,
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


const RAILWAYS: ThemePack = {
  arcTitle: "Today's Timetable",
  arcSubtitle: "Five scheduled stops. Run the whole line on time.",
  arcCompletePhrase: "Last stop reached. Service complete, right on time.",
  accent: "oklch(0.78 0.16 60)",
  bgHue: "240",
  hudLabel: "Service Log",
  ranks: [
    { title: "Apprentice", subtitle: "Level 1 · First day on the line", minXp: 0 },
    { title: "Brakeman", subtitle: "Level 2 · Knows the stops", minXp: 80 },
    { title: "Fireman", subtitle: "Level 3 · Steam up", minXp: 200 },
    { title: "Engineer", subtitle: "Level 4 · At the throttle", minXp: 450 },
    { title: "Conductor", subtitle: "Level 5 · Calls the route", minXp: 800 },
    { title: "Stationmaster", subtitle: "Level 6 · Runs the depot", minXp: 1300 },
    { title: "Line Inspector", subtitle: "Level 7 · Sets the schedule", minXp: 2000 },
    { title: "Rail Legend", subtitle: "Level 8 · Named locomotive", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Read the timetable", outcome: "Schedule logged", icon: Clock, xp: 10 },
    { id: Q.notebook, label: "Open the route book", outcome: "Route reviewed", icon: TrainTrack, xp: 15 },
    { id: Q.reset, label: "Sound the whistle", outcome: "All aboard", icon: Flag, xp: 20 },
    { id: Q.chat, label: "Radio the conductor", outcome: "Comms clear", icon: Radio, xp: 15 },
    { id: Q.assignment, label: "Pull into the next station", outcome: "Stop made on time", icon: Train, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Departure",
    [A.reset]: "All Aboard",
    [A.library]: "Route Memorized",
    [A.s3]: "Three-Day Service",
    [A.s7]: "Weekly Line",
    [A.s14]: "On-Time Record",
    [A.l5]: "Conductor",
    [A.l7]: "Line Inspector",
  },
};

const CARDS: ThemePack = {
  arcTitle: "Today's Pull List",
  arcSubtitle: "Five cards to add to the binder before the day ends.",
  arcCompletePhrase: "Page complete. The set is one step closer.",
  accent: "oklch(0.78 0.2 60)",
  bgHue: "30",
  hudLabel: "Collection Log",
  ranks: [
    { title: "Newcomer", subtitle: "Level 1 · First pack opened", minXp: 0 },
    { title: "Collector", subtitle: "Level 2 · First binder", minXp: 80 },
    { title: "Set Builder", subtitle: "Level 3 · Common set done", minXp: 200 },
    { title: "Trader", subtitle: "Level 4 · Floor regular", minXp: 450 },
    { title: "Completist", subtitle: "Level 5 · Rare slots filled", minXp: 800 },
    { title: "Grader", subtitle: "Level 6 · Mint eye", minXp: 1300 },
    { title: "Curator", subtitle: "Level 7 · Showcase shelf", minXp: 2000 },
    { title: "Hall-of-Fame", subtitle: "Level 8 · The 1-of-1", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Check the pull list", outcome: "Wants tracked", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Crack open the binder", outcome: "Binder open", icon: Album, xp: 15 },
    { id: Q.reset, label: "Rip the daily pack", outcome: "Pack opened", icon: Package, xp: 20 },
    { id: Q.chat, label: "Trade with your crew", outcome: "Trade made", icon: Layers, xp: 15 },
    { id: Q.assignment, label: "Slot one new card", outcome: "Card added to binder", icon: ScanLine, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Pull",
    [A.reset]: "Pack a Day",
    [A.library]: "Binder Reader",
    [A.s3]: "Three-Day Set",
    [A.s7]: "Weekly Pulls",
    [A.s14]: "Completist Streak",
    [A.l5]: "Completist",
    [A.l7]: "Curator",
  },
};

const WEATHER: ThemePack = {
  arcTitle: "Today's Forecast",
  arcSubtitle: "Five observations to log before sundown.",
  arcCompletePhrase: "Day's record complete. Conditions logged.",
  accent: "oklch(0.78 0.16 220)",
  bgHue: "210",
  hudLabel: "Weather Station",
  ranks: [
    { title: "Spotter", subtitle: "Level 1 · First reading taken", minXp: 0 },
    { title: "Observer", subtitle: "Level 2 · Daily log started", minXp: 80 },
    { title: "Forecaster", subtitle: "Level 3 · Calling the day", minXp: 200 },
    { title: "Meteorologist", subtitle: "Level 4 · Patterns clear", minXp: 450 },
    { title: "Stormwatcher", subtitle: "Level 5 · Eye on the cell", minXp: 800 },
    { title: "Climatologist", subtitle: "Level 6 · Reads the season", minXp: 1300 },
    { title: "Chief Forecaster", subtitle: "Level 7 · On-air call", minXp: 2000 },
    { title: "Weather Legend", subtitle: "Level 8 · Named the storm", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Check the pressure", outcome: "Barometer read", icon: Gauge, xp: 10 },
    { id: Q.notebook, label: "Open the log book", outcome: "Log open", icon: Thermometer, xp: 15 },
    { id: Q.reset, label: "Take the morning reading", outcome: "Reading recorded", icon: CloudSun, xp: 20 },
    { id: Q.chat, label: "Call in to the station", outcome: "Report filed", icon: Radio, xp: 15 },
    { id: Q.assignment, label: "Track the front through", outcome: "System logged", icon: CloudLightning, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Reading",
    [A.reset]: "Morning Observation",
    [A.library]: "Almanac Reader",
    [A.s3]: "Three-Day Log",
    [A.s7]: "Weekly Forecast",
    [A.s14]: "Climate Watch",
    [A.l5]: "Stormwatcher",
    [A.l7]: "Chief Forecaster",
  },
};

const CARTOGRAPHY: ThemePack = {
  arcTitle: "Today's Expedition",
  arcSubtitle: "Five waypoints to chart before camp.",
  arcCompletePhrase: "Map complete. The route is drawn.",
  accent: "oklch(0.78 0.16 90)",
  bgHue: "70",
  hudLabel: "Field Journal",
  ranks: [
    { title: "Apprentice", subtitle: "Level 1 · First sketch", minXp: 0 },
    { title: "Pathfinder", subtitle: "Level 2 · Trail marked", minXp: 80 },
    { title: "Scout", subtitle: "Level 3 · Region surveyed", minXp: 200 },
    { title: "Navigator", subtitle: "Level 4 · True bearings", minXp: 450 },
    { title: "Surveyor", subtitle: "Level 5 · Land registered", minXp: 800 },
    { title: "Cartographer", subtitle: "Level 6 · Map published", minXp: 1300 },
    { title: "Royal Geographer", subtitle: "Level 7 · Atlas printed", minXp: 2000 },
    { title: "Legend", subtitle: "Level 8 · Continent named for you", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Check the compass", outcome: "Bearing set", icon: Compass, xp: 10 },
    { id: Q.notebook, label: "Unfold today's map", outcome: "Map open", icon: MapIcon, xp: 15 },
    { id: Q.reset, label: "Mark the trailhead", outcome: "Trailhead pinned", icon: MapPin, xp: 20 },
    { id: Q.chat, label: "Consult the guide", outcome: "Route confirmed", icon: Globe, xp: 15 },
    { id: Q.assignment, label: "Chart the next waypoint", outcome: "Waypoint drawn", icon: Footprints, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Waypoint",
    [A.reset]: "Compass Set",
    [A.library]: "Map Reader",
    [A.s3]: "Three-Day March",
    [A.s7]: "Weekly Expedition",
    [A.s14]: "Long Survey",
    [A.l5]: "Surveyor",
    [A.l7]: "Royal Geographer",
  },
};

const MUSEUM: ThemePack = {
  arcTitle: "Today's Collection",
  arcSubtitle: "Five specimens to catalog before closing.",
  arcCompletePhrase: "Collection cataloged. Exhibit ready.",
  accent: "oklch(0.78 0.16 80)",
  bgHue: "90",
  hudLabel: "Collections Log",
  ranks: [
    { title: "Volunteer", subtitle: "Level 1 · Badge issued", minXp: 0 },
    { title: "Docent", subtitle: "Level 2 · First tour", minXp: 80 },
    { title: "Cataloger", subtitle: "Level 3 · Drawer organized", minXp: 200 },
    { title: "Researcher", subtitle: "Level 4 · Paper drafted", minXp: 450 },
    { title: "Specialist", subtitle: "Level 5 · Field expert", minXp: 800 },
    { title: "Curator", subtitle: "Level 6 · Exhibit opened", minXp: 1300 },
    { title: "Senior Curator", subtitle: "Level 7 · Wing named", minXp: 2000 },
    { title: "Director", subtitle: "Level 8 · Museum's legend", minXp: 3000 },
  ],
  quests: [
    { id: Q.timeline, label: "Review the catalog", outcome: "Inventory checked", icon: BookMarked, xp: 10 },
    { id: Q.notebook, label: "Open the field journal", outcome: "Journal open", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Examine a new specimen", outcome: "Specimen logged", icon: Microscope, xp: 20 },
    { id: Q.chat, label: "Consult the curator", outcome: "Notes confirmed", icon: Telescope, xp: 15 },
    { id: Q.assignment, label: "Add one piece to the exhibit", outcome: "Exhibit updated", icon: Bone, xp: 40 },
  ],
  achievementNames: {
    [A.first]: "First Catalog Entry",
    [A.reset]: "Opening Bell",
    [A.library]: "Stacks Scholar",
    [A.s3]: "Three-Day Study",
    [A.s7]: "Weekly Exhibit",
    [A.s14]: "Long Research",
    [A.l5]: "Specialist",
    [A.l7]: "Senior Curator",
  },
};

const mkRanks = (titles: string[], subs: string[]) =>
  titles.map((title, i) => ({
    title,
    subtitle: `Level ${i + 1} · ${subs[i]}`,
    minXp: [0, 80, 200, 450, 800, 1300, 2000, 3000][i],
  }));

const mkAchievements = (first: string, reset: string, library: string): Record<string, string> => ({
  [A.first]: first,
  [A.reset]: reset,
  [A.library]: library,
  [A.s3]: "Three-Day Streak",
  [A.s7]: "Seven-Day Streak",
  [A.s14]: "Two-Week Streak",
  [A.l5]: "Level 5",
  [A.l7]: "Level 7",
});

const BASEBALL: ThemePack = {
  arcTitle: "Today's Lineup",
  arcSubtitle: "Five at-bats. Run the card, post the W.",
  arcCompletePhrase: "Game over. Box score looks clean.",
  accent: "oklch(0.78 0.18 30)",
  bgHue: "20",
  hudLabel: "Scorecard",
  ranks: mkRanks(
    ["Rookie", "Utility", "Starter", "Veteran", "All-Star", "Captain", "Hall-of-Famer", "Legend"],
    ["Signed", "First start", "In the order", "Locker respected", "Selected", "Wears the C", "Plaque earned", "Retired #"]
  ),
  quests: [
    { id: Q.timeline, label: "Read the scouting report", outcome: "Report read", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Step into the cage", outcome: "Cage work in", icon: Target, xp: 15 },
    { id: Q.reset, label: "Run the warm-up routine", outcome: "Warmed up", icon: Dumbbell, xp: 20 },
    { id: Q.chat, label: "Talk to the manager", outcome: "Signs in", icon: Medal, xp: 15 },
    { id: Q.assignment, label: "Drive in one run", outcome: "RBI", icon: Trophy, xp: 40 },
  ],
  achievementNames: mkAchievements("First Hit", "Warm-up", "Tape Study"),
};

const HOTROD: ThemePack = {
  arcTitle: "Today's Build Sheet",
  arcSubtitle: "Five passes through the garage. Make the car faster.",
  arcCompletePhrase: "Hood down. She's tuned.",
  accent: "oklch(0.72 0.2 30)",
  bgHue: "20",
  hudLabel: "Garage Log",
  ranks: mkRanks(
    ["Apprentice", "Wrench", "Tuner", "Builder", "Driver", "Crew Chief", "Track Record", "Legend of the Strip"],
    ["Shop sweep", "First swap", "Dyno'd", "Frame off", "Behind the wheel", "Calls the pit", "Time slip framed", "Name on the wall"]
  ),
  quests: [
    { id: Q.timeline, label: "Walk the build sheet", outcome: "Sheet walked", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Open the shop manual", outcome: "Manual open", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Run the morning checklist", outcome: "Fluids topped", icon: Wrench, xp: 20 },
    { id: Q.chat, label: "Ping the crew chief", outcome: "Crew aligned", icon: Hammer, xp: 15 },
    { id: Q.assignment, label: "Finish one pass", outcome: "Quarter-mile clean", icon: Car, xp: 40 },
  ],
  achievementNames: mkAchievements("First Pass", "Cold Start", "Manual Read"),
};

const ROBOTICS: ThemePack = {
  arcTitle: "Today's Sprint",
  arcSubtitle: "Five tickets. Ship the build.",
  arcCompletePhrase: "Sprint shipped. PR merged.",
  accent: "oklch(0.78 0.15 200)",
  bgHue: "210",
  hudLabel: "Standup",
  ranks: mkRanks(
    ["Intern", "Junior", "Engineer", "Senior", "Lead", "Staff", "Principal", "Founder"],
    ["Badged in", "First commit", "Owns a service", "Reviews PRs", "Runs the standup", "Sets the roadmap", "Org-wide impact", "Sets the vision"]
  ),
  quests: [
    { id: Q.timeline, label: "Review the backlog", outcome: "Backlog triaged", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Open the IDE", outcome: "IDE open", icon: Code, xp: 15 },
    { id: Q.reset, label: "Run the morning standup", outcome: "Standup done", icon: Bot, xp: 20 },
    { id: Q.chat, label: "Pair with the lead", outcome: "Plan reviewed", icon: Cpu, xp: 15 },
    { id: Q.assignment, label: "Ship one ticket", outcome: "PR merged", icon: Rocket, xp: 40 },
  ],
  achievementNames: mkAchievements("First Commit", "Standup Habit", "Docs Read"),
};

const INTERIOR: ThemePack = {
  arcTitle: "Today's Moodboard",
  arcSubtitle: "Five small choices. Make the room sing.",
  arcCompletePhrase: "Room composed. Lights down.",
  accent: "oklch(0.8 0.1 60)",
  bgHue: "40",
  hudLabel: "Studio Notes",
  ranks: mkRanks(
    ["Assistant", "Stylist", "Designer", "Senior Designer", "Art Director", "Principal", "Tastemaker", "Icon"],
    ["Sample wrangling", "First room", "Owns a project", "Runs a vertical", "Sets the look", "Brand of one", "On the cover", "Defines the era"]
  ),
  quests: [
    { id: Q.timeline, label: "Review the moodboard", outcome: "Board reviewed", icon: Palette, xp: 10 },
    { id: Q.notebook, label: "Open the swatch book", outcome: "Swatches out", icon: Layers, xp: 15 },
    { id: Q.reset, label: "Re-measure the space", outcome: "Plan measured", icon: Ruler, xp: 20 },
    { id: Q.chat, label: "Walk the client through it", outcome: "Client aligned", icon: Lightbulb, xp: 15 },
    { id: Q.assignment, label: "Finalize one room", outcome: "Room styled", icon: Sofa, xp: 40 },
  ],
  achievementNames: mkAchievements("First Pin", "Reset the Room", "Library of Swatches"),
};

const BROADWAY: ThemePack = {
  arcTitle: "Today's Call Sheet",
  arcSubtitle: "Five cues. Hit your marks.",
  arcCompletePhrase: "Curtain. Standing O.",
  accent: "oklch(0.78 0.18 350)",
  bgHue: "330",
  hudLabel: "Playbill",
  ranks: mkRanks(
    ["Ensemble", "Understudy", "Featured", "Lead", "Headliner", "Tony Nominee", "Tony Winner", "Legend"],
    ["First call", "Knows every part", "Solo number", "Top of the bill", "Marquee", "Nominated", "Won", "Named in the rafters"]
  ),
  quests: [
    { id: Q.timeline, label: "Read the call sheet", outcome: "Call reviewed", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Open the script", outcome: "Script open", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Run vocal warm-ups", outcome: "Voice warmed", icon: Mic, xp: 20 },
    { id: Q.chat, label: "Check in with the director", outcome: "Notes given", icon: Drama, xp: 15 },
    { id: Q.assignment, label: "Nail one scene", outcome: "Scene landed", icon: Music, xp: 40 },
  ],
  achievementNames: mkAchievements("First Bow", "Warm-up", "Off-book"),
};

const YOUTUBE: ThemePack = {
  arcTitle: "Today's Upload Plan",
  arcSubtitle: "Five steps. Ship the video.",
  arcCompletePhrase: "Uploaded. Notifications squad fed.",
  accent: "oklch(0.72 0.22 25)",
  bgHue: "15",
  hudLabel: "Creator Studio",
  ranks: mkRanks(
    ["Newcomer", "Hobbyist", "Creator", "Mid-Tier", "Verified", "Partner", "Top Creator", "Icon"],
    ["First upload", "Posts weekly", "Niche locked", "Algorithm friend", "Checkmark", "Brand deals", "Plaque on wall", "Genre-defining"]
  ),
  quests: [
    { id: Q.timeline, label: "Review the upload calendar", outcome: "Calendar reviewed", icon: Clapperboard, xp: 10 },
    { id: Q.notebook, label: "Open the script doc", outcome: "Script open", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Record the daily B-roll", outcome: "B-roll captured", icon: Camera, xp: 20 },
    { id: Q.chat, label: "Brief the editor", outcome: "Cut approved", icon: Film, xp: 15 },
    { id: Q.assignment, label: "Publish one video", outcome: "Video live", icon: Video, xp: 40 },
  ],
  achievementNames: mkAchievements("First Upload", "Daily Vlog", "Watch History"),
};

const GAMER: ThemePack = {
  arcTitle: "Today's Quest Log",
  arcSubtitle: "Five objectives. Complete the daily.",
  arcCompletePhrase: "Daily cleared. XP banked.",
  accent: "oklch(0.78 0.18 280)",
  bgHue: "270",
  hudLabel: "Player Card",
  ranks: mkRanks(
    ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    ["Tutorial done", "Ranked unlocked", "Climbing", "Holding rank", "Sweat zone", "Pro adjacent", "Elite", "Leaderboard"]
  ),
  quests: [
    { id: Q.timeline, label: "Check the quest log", outcome: "Log opened", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Open the inventory", outcome: "Inventory open", icon: Package, xp: 15 },
    { id: Q.reset, label: "Run the daily mission", outcome: "Daily done", icon: Joystick, xp: 20 },
    { id: Q.chat, label: "Comms check with the squad", outcome: "Comms hot", icon: Headphones, xp: 15 },
    { id: Q.assignment, label: "Clear one boss", outcome: "Boss down", icon: Gamepad2, xp: 40 },
  ],
  achievementNames: mkAchievements("First Clear", "Daily Login", "Lore Master"),
};

const LIBRARY: ThemePack = {
  arcTitle: "Today's Reading List",
  arcSubtitle: "Five quiet tasks. Build the bibliography.",
  arcCompletePhrase: "Closing time. Stacks restored.",
  accent: "oklch(0.7 0.1 50)",
  bgHue: "35",
  hudLabel: "Card Catalog",
  ranks: mkRanks(
    ["Patron", "Page", "Clerk", "Reference", "Archivist", "Head Librarian", "Curator", "Director"],
    ["Card issued", "Shelving", "Helps at the desk", "Knows the stacks", "Owns the collection", "Runs the branch", "Special collections", "Library of record"]
  ),
  quests: [
    { id: Q.timeline, label: "Scan the catalog", outcome: "Catalog scanned", icon: Search, xp: 10 },
    { id: Q.notebook, label: "Open a notebook", outcome: "Notebook open", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Reset your study desk", outcome: "Desk reset", icon: LibraryIcon, xp: 20 },
    { id: Q.chat, label: "Ask the reference librarian", outcome: "Cite confirmed", icon: BookMarked, xp: 15 },
    { id: Q.assignment, label: "Finish one chapter", outcome: "Chapter logged", icon: Trophy, xp: 40 },
  ],
  achievementNames: mkAchievements("First Citation", "Quiet Hour", "Stacks Scholar"),
};

const TRAVELER: ThemePack = {
  arcTitle: "Today's Itinerary",
  arcSubtitle: "Five legs. Make the connection.",
  arcCompletePhrase: "Bags down. City unlocked.",
  accent: "oklch(0.75 0.15 200)",
  bgHue: "210",
  hudLabel: "Passport",
  ranks: mkRanks(
    ["Tourist", "Backpacker", "Wanderer", "Globetrotter", "Nomad", "Expat", "World Citizen", "Living Atlas"],
    ["First stamp", "Hostel veteran", "Continent done", "Multi-continent", "No fixed address", "Visa renewed", "Speaks 5 cities", "Map of life"]
  ),
  quests: [
    { id: Q.timeline, label: "Review the itinerary", outcome: "Plan reviewed", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Open the travel journal", outcome: "Journal open", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Repack the day bag", outcome: "Bag packed", icon: Luggage, xp: 20 },
    { id: Q.chat, label: "Ask a local", outcome: "Tip logged", icon: Globe, xp: 15 },
    { id: Q.assignment, label: "Make one connection", outcome: "Border crossed", icon: Plane, xp: 40 },
  ],
  achievementNames: mkAchievements("First Stamp", "Morning Departure", "Phrasebook"),
};

const FINANCE: ThemePack = {
  arcTitle: "Today's Trading Day",
  arcSubtitle: "Five tasks before the close.",
  arcCompletePhrase: "Bell rung. Books closed.",
  accent: "oklch(0.78 0.15 145)",
  bgHue: "150",
  hudLabel: "Terminal",
  ranks: mkRanks(
    ["Analyst", "Associate", "VP", "Director", "Managing Director", "Partner", "Portfolio Manager", "CIO"],
    ["First model", "Owns the deck", "Runs the deal", "Sets the strategy", "Closes deals", "Equity owner", "Runs the book", "Sets the firm"]
  ),
  quests: [
    { id: Q.timeline, label: "Read the morning tape", outcome: "Tape read", icon: LineChart, xp: 10 },
    { id: Q.notebook, label: "Open the model", outcome: "Model open", icon: BarChart3, xp: 15 },
    { id: Q.reset, label: "Run the open routine", outcome: "Bell open", icon: TrendingUp, xp: 20 },
    { id: Q.chat, label: "Check in with the desk", outcome: "Desk aligned", icon: Briefcase, xp: 15 },
    { id: Q.assignment, label: "Close one position", outcome: "Trade booked", icon: DollarSign, xp: 40 },
  ],
  achievementNames: mkAchievements("First Print", "Opening Bell", "Research Stack"),
};

const HEROES: ThemePack = {
  arcTitle: "Today's Patrol",
  arcSubtitle: "Five calls on the radio. Save the city by sundown.",
  arcCompletePhrase: "Patrol over. City sleeps tonight because of you.",
  accent: "oklch(0.72 0.24 25)",
  bgHue: "25",
  hudLabel: "Hero Comm",
  ranks: mkRanks(
    ["Cadet", "Rookie", "Solo", "Hero", "Avenger", "Captain", "Icon", "Legend"],
    ["Mask issued", "First save", "First solo case", "Known by name", "On the team", "Leads the team", "Statue downtown", "Origin retold forever"],
  ),
  quests: [
    { id: Q.timeline, label: "Patrol the city", outcome: "Sector clear", icon: Star, xp: 10 },
    { id: Q.notebook, label: "Brief at HQ", outcome: "Intel reviewed", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Train in the danger room", outcome: "Form sharpened", icon: Dumbbell, xp: 20 },
    { id: Q.chat, label: "Suit up with the team", outcome: "Comms hot", icon: Shield, xp: 15 },
    { id: Q.assignment, label: "Answer one call", outcome: "Civilians safe", icon: Rocket, xp: 40 },
  ],
  achievementNames: mkAchievements("First Save", "Suit Up", "HQ Briefing"),
};

const REALITY: ThemePack = {
  arcTitle: "Today's Call Sheet",
  arcSubtitle: "Five segments to shoot. Don't break the fourth wall.",
  arcCompletePhrase: "And… we're clear. Print it.",
  accent: "oklch(0.72 0.25 340)",
  bgHue: "330",
  hudLabel: "Production Slate",
  ranks: mkRanks(
    ["Pre-show", "Cast", "Episode 1", "Jury", "Final Three", "Finale", "Champion", "All-Stars"],
    ["Casting tape", "Make it in", "Aired first", "Voted off, then jury", "Endgame", "Live finale", "Confetti", "They invite you back"],
  ),
  quests: [
    { id: Q.timeline, label: "Read the call sheet", outcome: "Call reviewed", icon: Clapperboard, xp: 10 },
    { id: Q.notebook, label: "Pre-show interview", outcome: "Soundbite captured", icon: Mic, xp: 15 },
    { id: Q.reset, label: "Strategy session", outcome: "Alliance set", icon: Lightbulb, xp: 20 },
    { id: Q.chat, label: "Hit the confessional", outcome: "Confessional in the can", icon: Camera, xp: 15 },
    { id: Q.assignment, label: "Survive tribal council", outcome: "Still in the house", icon: Trophy, xp: 40 },
  ],
  achievementNames: mkAchievements("First Confessional", "Pre-Show Ready", "Watched the Cuts"),
};

const MODERN: ThemePack = {
  arcTitle: "Today's Plan",
  arcSubtitle: "Five things that actually matter today. Nothing more.",
  arcCompletePhrase: "Done for today. Real done — log off.",
  accent: "oklch(0.65 0.08 30)",
  bgHue: "30",
  hudLabel: "Today",
  ranks: mkRanks(
    ["Apprentice", "Associate", "Manager", "Lead", "Director", "VP", "Partner", "Principal"],
    ["Learning the role", "Owns the work", "Owns the team", "Owns the function", "Owns the org", "Sets the direction", "Owns the firm", "Defines the practice"],
  ),
  quests: [
    { id: Q.timeline, label: "Plan the day", outcome: "Plan set", icon: Clipboard, xp: 10 },
    { id: Q.notebook, label: "Clear the inbox", outcome: "Inbox at zero-ish", icon: BookOpen, xp: 15 },
    { id: Q.reset, label: "Deep-work block", outcome: "One real hour", icon: Target, xp: 20 },
    { id: Q.chat, label: "Take the actual break", outcome: "Stepped away", icon: Sprout, xp: 15 },
    { id: Q.assignment, label: "Close one loop", outcome: "One thing finished", icon: Briefcase, xp: 40 },
  ],
  achievementNames: mkAchievements("First Win", "Real Reset", "Notes Kept"),
};

export const THEME_PACKS: Partial<Record<ThemeId, ThemePack>> = {
  mythic: MYTHIC,
  sports: SPORTS,
  anime: ANIME,
  cyber: CYBER,
  cottage: COTTAGE,
  baseball: BASEBALL,
  hotrod: HOTROD,
  robotics: ROBOTICS,
  interior: INTERIOR,
  broadway: BROADWAY,
  youtube: YOUTUBE,
  gamer: GAMER,
  library: LIBRARY,
  traveler: TRAVELER,
  finance: FINANCE,
  railways: RAILWAYS,
  cards: CARDS,
  weather: WEATHER,
  cartography: CARTOGRAPHY,
  museum: MUSEUM,
  heroes: HEROES,
  reality: REALITY,
  modern: MODERN,
};

export function getThemePack(theme: ThemeId | string | null | undefined): ThemePack {
  if (theme && theme in THEME_PACKS) return THEME_PACKS[theme as ThemeId]!;
  return MYTHIC;
}

/** Fallback icon if a quest id is unknown. */
export { Sparkles, Flame, Trophy, Mountain };
