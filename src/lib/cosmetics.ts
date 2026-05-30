// Cosmetic catalog + base-part options + earning rules.
// Everything is data-only (no React imports) so it can run in server functions
// and component code alike. The PlayerAvatar renderer interprets each item by id.

import type { ThemeId } from "./companions";

export type Slot = "hat" | "top" | "accessory" | "frame";

export type CosmeticItem = {
  id: string;
  name: string;
  slot: Slot;
  /** null = universal (available across all themes). */
  theme: ThemeId | null;
  /** Which set this item belongs to (used for theme mastery drops). */
  setId?: string;
  /** Color hint for the renderer (oklch or hex). */
  color: string;
  /** Optional secondary color (e.g. band on a hat). */
  color2?: string;
  /** How it shipped to the user. */
  source: "seed" | "on_time" | "mastery";
  blurb: string;
};

// ------------------------------------------------------------------
// Base part options for the avatar builder. Stable string IDs only —
// the renderer maps these to shapes/colors.
// ------------------------------------------------------------------

export const BODY_TYPES = ["slim", "standard", "broad"] as const;
export const SKIN_TONES = [
  { id: "tone-1", color: "#f5d6b9" },
  { id: "tone-2", color: "#e8b48a" },
  { id: "tone-3", color: "#c98a5e" },
  { id: "tone-4", color: "#8a5638" },
  { id: "tone-5", color: "#5a3624" },
  { id: "tone-6", color: "#3a1f12" },
] as const;
export const HAIR_STYLES = ["bald", "buzz", "short", "wavy", "long", "bun", "afro", "mohawk"] as const;
export const HAIR_COLORS = [
  { id: "black",   color: "#1a1a1a" },
  { id: "brown",   color: "#4a2c14" },
  { id: "blonde",  color: "#d6b86b" },
  { id: "auburn",  color: "#8a3a1a" },
  { id: "silver",  color: "#bcbcbc" },
  { id: "blue",    color: "#3a6cd6" },
  { id: "pink",    color: "#e85a8a" },
  { id: "green",   color: "#4a9a4a" },
] as const;
export const EYE_STYLES = ["round", "narrow", "wide", "sleepy", "sharp"] as const;
export const BROW_STYLES = ["neutral", "raised", "furrowed", "thin"] as const;
export const MOUTH_STYLES = ["smile", "smirk", "neutral", "open", "grin"] as const;
export const OUTFIT_BASES = [
  { id: "tee-navy",    color: "#1f3a6e" },
  { id: "tee-rust",    color: "#a04a2a" },
  { id: "tee-forest",  color: "#2a5a3a" },
  { id: "tee-cream",   color: "#e8dcc0" },
  { id: "hoodie-grey", color: "#4a4a4a" },
  { id: "blazer-blk",  color: "#161616" },
] as const;
export const BACKGROUNDS = [
  { id: "sky",     color: "#a8c6e8" },
  { id: "dusk",    color: "#6a4a8a" },
  { id: "ember",   color: "#c44a2a" },
  { id: "void",    color: "#1a1a2a" },
  { id: "mint",    color: "#8ad6b8" },
  { id: "paper",   color: "#e8e4dd" },
] as const;

export type AvatarParts = {
  body_type:   string;
  skin_tone:   string;
  hair_style:  string;
  hair_color:  string;
  eye_style:   string;
  brow_style:  string;
  mouth_style: string;
  outfit_base: string;
  background:  string;
};

export const DEFAULT_AVATAR: AvatarParts = {
  body_type:   "standard",
  skin_tone:   "tone-3",
  hair_style:  "short",
  hair_color:  "brown",
  eye_style:   "round",
  brow_style:  "neutral",
  mouth_style: "smile",
  outfit_base: "tee-navy",
  background:  "sky",
};

// Helper for builder UI.
export type StepperOption = { id: string; label: string };
export const STEPPER_OPTIONS: Record<keyof AvatarParts, StepperOption[]> = {
  body_type:   BODY_TYPES.map((id) => ({ id, label: cap(id) })),
  skin_tone:   SKIN_TONES.map((s) => ({ id: s.id, label: s.id.replace("tone-", "Tone ") })),
  hair_style:  HAIR_STYLES.map((id) => ({ id, label: cap(id) })),
  hair_color:  HAIR_COLORS.map((c) => ({ id: c.id, label: cap(c.id) })),
  eye_style:   EYE_STYLES.map((id) => ({ id, label: cap(id) })),
  brow_style:  BROW_STYLES.map((id) => ({ id, label: cap(id) })),
  mouth_style: MOUTH_STYLES.map((id) => ({ id, label: cap(id) })),
  outfit_base: OUTFIT_BASES.map((o) => ({ id: o.id, label: prettyOutfit(o.id) })),
  background:  BACKGROUNDS.map((b) => ({ id: b.id, label: cap(b.id) })),
};

function cap(s: string) { return s[0].toUpperCase() + s.slice(1); }
function prettyOutfit(id: string) {
  return id.replace("tee-", "Tee · ").replace("hoodie-", "Hoodie · ").replace("blazer-", "Blazer · ");
}

// ------------------------------------------------------------------
// Cosmetic catalog. Tiny seed — more added later.
// ------------------------------------------------------------------

export const COSMETICS: CosmeticItem[] = [
  // Universal seed (granted to every new user)
  { id: "u-cap-grey",    name: "Charcoal Cap",     slot: "hat",       theme: null, color: "#3a3a3a", source: "seed",    blurb: "Standard issue." },
  { id: "u-frame-thin",  name: "Thin Frame",       slot: "frame",     theme: null, color: "#bcbcbc", source: "seed",    blurb: "Clean border." },
  { id: "u-pin-star",    name: "Star Pin",         slot: "accessory", theme: null, color: "#e8c84a", source: "seed",    blurb: "A small star." },

  // Universal on-time drop pool (every 3rd on-time = random one)
  { id: "u-cap-red",     name: "Red Cap",          slot: "hat",       theme: null, color: "#c44a3a", source: "on_time", blurb: "For showing up." },
  { id: "u-beanie-nav",  name: "Navy Beanie",      slot: "hat",       theme: null, color: "#1f2a4e", source: "on_time", blurb: "Cold-morning grind." },
  { id: "u-jacket-grn",  name: "Field Jacket",     slot: "top",       theme: null, color: "#3a5a2a", source: "on_time", blurb: "Pockets for plans." },
  { id: "u-jacket-blk",  name: "Black Jacket",     slot: "top",       theme: null, color: "#0d0d0d", source: "on_time", blurb: "Quiet confidence." },
  { id: "u-frame-gold",  name: "Gold Frame",       slot: "frame",     theme: null, color: "#c9a84c", source: "on_time", blurb: "Earned shine." },
  { id: "u-frame-neon",  name: "Neon Frame",       slot: "frame",     theme: null, color: "#4adcc9", source: "on_time", blurb: "Late-night energy." },
  { id: "u-pin-flame",   name: "Flame Pin",        slot: "accessory", theme: null, color: "#e85a2a", source: "on_time", blurb: "On a streak." },
  { id: "u-pin-bolt",    name: "Bolt Pin",         slot: "accessory", theme: null, color: "#4ac9e8", source: "on_time", blurb: "Move fast." },

  // ---- Themed mastery sets (unlocked at 5 arc-complete days in that theme) ----
  // Mythic
  { id: "m-mythic-hat",  name: "Sage Hood",         slot: "hat",       theme: "mythic", setId: "mythic-set", color: "#4a2a6e", source: "mastery", blurb: "Mythic set · 1/4" },
  { id: "m-mythic-top",  name: "Rune Cloak",        slot: "top",       theme: "mythic", setId: "mythic-set", color: "#1a1a3a", color2: "#c9a84c", source: "mastery", blurb: "Mythic set · 2/4" },
  { id: "m-mythic-acc",  name: "Sigil Pin",         slot: "accessory", theme: "mythic", setId: "mythic-set", color: "#c9a84c", source: "mastery", blurb: "Mythic set · 3/4" },
  { id: "m-mythic-frm",  name: "Arcane Frame",      slot: "frame",     theme: "mythic", setId: "mythic-set", color: "#c9a84c", source: "mastery", blurb: "Mythic set · 4/4" },
  // Sports
  { id: "m-sports-hat",  name: "Coach Cap",         slot: "hat",       theme: "sports", setId: "sports-set", color: "#c44a2a", source: "mastery", blurb: "Sports set · 1/4" },
  { id: "m-sports-top",  name: "Letterman",         slot: "top",       theme: "sports", setId: "sports-set", color: "#2a3a6e", color2: "#e8c84a", source: "mastery", blurb: "Sports set · 2/4" },
  { id: "m-sports-acc",  name: "Gold Medal",        slot: "accessory", theme: "sports", setId: "sports-set", color: "#e8c84a", source: "mastery", blurb: "Sports set · 3/4" },
  { id: "m-sports-frm",  name: "Stadium Frame",     slot: "frame",     theme: "sports", setId: "sports-set", color: "#e85a2a", source: "mastery", blurb: "Sports set · 4/4" },
  // Finance
  { id: "m-fin-hat",     name: "Trader Visor",      slot: "hat",       theme: "finance", setId: "finance-set", color: "#0d3a2a", source: "mastery", blurb: "Finance set · 1/4" },
  { id: "m-fin-top",     name: "Pinstripe Suit",    slot: "top",       theme: "finance", setId: "finance-set", color: "#1a1a2a", color2: "#bcbcbc", source: "mastery", blurb: "Finance set · 2/4" },
  { id: "m-fin-acc",     name: "Dollar Pin",        slot: "accessory", theme: "finance", setId: "finance-set", color: "#4adc8a", source: "mastery", blurb: "Finance set · 3/4" },
  { id: "m-fin-frm",     name: "Bull Frame",        slot: "frame",     theme: "finance", setId: "finance-set", color: "#4adc8a", source: "mastery", blurb: "Finance set · 4/4" },
  // Heroes
  { id: "m-her-hat",     name: "Hero Cowl",         slot: "hat",       theme: "heroes",  setId: "heroes-set",  color: "#c4202a", source: "mastery", blurb: "Heroes set · 1/4" },
  { id: "m-her-top",     name: "Caped Suit",        slot: "top",       theme: "heroes",  setId: "heroes-set",  color: "#1a3ad6", color2: "#e8c84a", source: "mastery", blurb: "Heroes set · 2/4" },
  { id: "m-her-acc",     name: "Power Emblem",      slot: "accessory", theme: "heroes",  setId: "heroes-set",  color: "#e8c84a", source: "mastery", blurb: "Heroes set · 3/4" },
  { id: "m-her-frm",     name: "Halftone Frame",    slot: "frame",     theme: "heroes",  setId: "heroes-set",  color: "#c4202a", source: "mastery", blurb: "Heroes set · 4/4" },
  // Reality TV
  { id: "m-rea-hat",     name: "Camera Headset",    slot: "hat",       theme: "reality", setId: "reality-set", color: "#1a1a1a", source: "mastery", blurb: "Reality set · 1/4" },
  { id: "m-rea-top",     name: "Confessional Lace", slot: "top",       theme: "reality", setId: "reality-set", color: "#e0408a", color2: "#f0d78c", source: "mastery", blurb: "Reality set · 2/4" },
  { id: "m-rea-acc",     name: "Diamond Earring",   slot: "accessory", theme: "reality", setId: "reality-set", color: "#f0d78c", source: "mastery", blurb: "Reality set · 3/4" },
  { id: "m-rea-frm",     name: "Spotlight Frame",   slot: "frame",     theme: "reality", setId: "reality-set", color: "#e0408a", source: "mastery", blurb: "Reality set · 4/4" },
  // Modern Professional
  { id: "m-mod-hat",     name: "Quiet Hair Crop",   slot: "hat",       theme: "modern",  setId: "modern-set",  color: "#3a3530", source: "mastery", blurb: "Modern set · 1/4" },
  { id: "m-mod-top",     name: "Sage Blazer",       slot: "top",       theme: "modern",  setId: "modern-set",  color: "#7d9b76", color2: "#f5f0e8", source: "mastery", blurb: "Modern set · 2/4" },
  { id: "m-mod-acc",     name: "Tortoise Glasses",  slot: "accessory", theme: "modern",  setId: "modern-set",  color: "#8a5638", source: "mastery", blurb: "Modern set · 3/4" },
  { id: "m-mod-frm",     name: "Clay Frame",        slot: "frame",     theme: "modern",  setId: "modern-set",  color: "#c2956b", source: "mastery", blurb: "Modern set · 4/4" },
];

export function getCosmetic(id: string | undefined | null): CosmeticItem | undefined {
  if (!id) return undefined;
  return COSMETICS.find((c) => c.id === id);
}

export function cosmeticsBySlot(slot: Slot): CosmeticItem[] {
  return COSMETICS.filter((c) => c.slot === slot);
}

/** Items every new user starts with. */
export const SEED_INVENTORY: string[] = COSMETICS.filter((c) => c.source === "seed").map((c) => c.id);

/** Items in the on-time random drop pool. */
const ON_TIME_POOL: string[] = COSMETICS.filter((c) => c.source === "on_time").map((c) => c.id);

/** Items that unlock when a theme is mastered. */
export function masterySetFor(theme: ThemeId | string): string[] {
  return COSMETICS.filter((c) => c.source === "mastery" && c.theme === theme).map((c) => c.id);
}

/** Pick a random on-time drop the user doesn't already own. */
export function rollOnTimeDrop(owned: Set<string>): string | null {
  const pool = ON_TIME_POOL.filter((id) => !owned.has(id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ------------------------------------------------------------------
// Earning thresholds — keep tunable in one place.
// ------------------------------------------------------------------

/** Every Nth on-time assignment triggers a random universal drop. */
export const ON_TIME_DROP_EVERY = 3;
/** Number of arc-complete days needed in a theme to earn its mastery set. */
export const MASTERY_THRESHOLD = 5;

export type EquippedMap = Partial<Record<Slot, string>>;
