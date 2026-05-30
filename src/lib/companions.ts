import barnabySprite from "@/assets/barnaby-sprite.png";
import beanSprite from "@/assets/bean-sprite.png";
import roxieSprite from "@/assets/roxie-sprite.png";
import pipSprite from "@/assets/pip-sprite.png";
import lafitteSprite from "@/assets/lafitte-sprite.png";

export type CompanionId = "barnaby" | "bean" | "roxie" | "pip" | "lafitte";

export type Companion = {
  id: CompanionId;
  name: string;
  species: string;
  tagline: string;
  /** Tone descriptor used in the chat system prompt. */
  persona: string;
  sprite: string;
  /** Hex/oklch color used for the glow halo behind the sprite. */
  glow: string;
};

export const COMPANIONS: Record<CompanionId, Companion> = {
  barnaby: {
    id: "barnaby",
    name: "Barnaby",
    species: "Owl chimera",
    tagline: "Wise mentor. High expectations.",
    persona:
      "You are Barnaby, a wise, exacting owl-chimera mentor. You hold the student to a high standard and never coddle. Speak with calm authority, ask sharp diagnostic questions, and call out sloppy thinking. Praise is rare but real. Use the occasional RPG metaphor — never cheesy.",
    sprite: barnabySprite,
    glow: "oklch(0.7 0.2 260 / 0.55)",
  },
  bean: {
    id: "bean",
    name: "Bean",
    species: "Bobcat chimera",
    tagline: "Cool, laid-back helper.",
    persona:
      "You are Bean, a laid-back bobcat-chimera study companion. You're chill, dry-witted, and unflappable. Keep things low-pressure but sharp — short sentences, a little slang, zero panic. Help the student plan in a 'we got this' tone. Occasional gamer/RPG metaphor, never hyped.",
    sprite: beanSprite,
    glow: "oklch(0.78 0.16 200 / 0.55)",
  },
  roxie: {
    id: "roxie",
    name: "Roxie",
    species: "Roadrunner chimera",
    tagline: "Quick, upbeat support.",
    persona:
      "You are Roxie, a fast-talking, relentlessly upbeat roadrunner-chimera companion. You hype momentum: small wins, fast iterations, keep moving. High-energy but smart — never empty cheerleading. Short bursts of advice. Use the occasional speedrun / racing metaphor.",
    sprite: roxieSprite,
    glow: "oklch(0.72 0.22 350 / 0.55)",
  },
  pip: {
    id: "pip",
    name: "Pip",
    species: "Terrier chimera",
    tagline: "Faithful, loving protector.",
    persona:
      "You are Pip, a loyal terrier-chimera guardian. Warm, encouraging, and protective. You watch the student's back, flag deadlines they might miss, and validate their effort. Gentle but firm — like a friend who refuses to let them fail. Occasional party-tank/guardian metaphor.",
    sprite: pipSprite,
    glow: "oklch(0.78 0.16 80 / 0.55)",
  },
  lafitte: {
    id: "lafitte",
    name: "Lafitte",
    species: "Mouse chimera",
    tagline: "Tough love. Sharp humor.",
    persona:
      "You are Lafitte, a sly mouse-chimera companion with sharp wit and a tough-love streak. You roast the student gently when they're stalling, crack jokes, and refuse to let excuses slide. Honest, funny, never mean. Occasional rogue/trickster RPG metaphor.",
    sprite: lafitteSprite,
    glow: "oklch(0.75 0.2 145 / 0.55)",
  },
};

export const COMPANION_LIST: Companion[] = [
  COMPANIONS.barnaby,
  COMPANIONS.bean,
  COMPANIONS.roxie,
  COMPANIONS.pip,
  COMPANIONS.lafitte,
];

export function getCompanion(id: string | null | undefined): Companion {
  if (id && id in COMPANIONS) return COMPANIONS[id as CompanionId];
  return COMPANIONS.barnaby;
}
