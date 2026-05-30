// Cosmetic catalog + base-part options + earning rules.
// Data-only (no React imports) so it can run on the server and client.

import type { ThemeId } from "./companions";

export type Slot = "hat" | "top" | "accessory" | "frame";

export type CosmeticItem = {
  id: string;
  name: string;
  slot: Slot;
  theme: ThemeId | null;
  setId?: string;
  color: string;
  color2?: string;
  source: "seed" | "on_time" | "mastery";
  blurb: string;
};

// ------------------------------------------------------------------
// Base part options for the avatar builder.
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

export const HAIR_STYLES = [
  "bald", "buzz", "short", "pixie", "bob", "wavy", "long",
  "curly", "braids", "ponytail", "bun", "afro", "locs", "undercut", "slick", "mohawk",
] as const;

export const HAIR_COLORS = [
  { id: "black",     color: "#1a1a1a" },
  { id: "brown",     color: "#4a2c14" },
  { id: "chestnut",  color: "#6e3a1a" },
  { id: "auburn",    color: "#8a3a1a" },
  { id: "blonde",    color: "#d6b86b" },
  { id: "platinum",  color: "#e8e2c8" },
  { id: "ash",       color: "#8a8276" },
  { id: "silver",    color: "#bcbcbc" },
  { id: "burgundy",  color: "#5a1a2a" },
  { id: "blue",      color: "#3a6cd6" },
  { id: "pink",      color: "#e85a8a" },
  { id: "lavender",  color: "#a89cd6" },
  { id: "green",     color: "#4a9a4a" },
] as const;

export const EYE_STYLES = [
  "round", "almond", "narrow", "wide", "hooded", "monolid", "upturned", "downturned", "sleepy", "sharp",
] as const;

export const EYE_COLORS = [
  { id: "brown",  color: "#5a3a1a" },
  { id: "hazel",  color: "#8a6a3a" },
  { id: "amber",  color: "#b08040" },
  { id: "green",  color: "#3a7a4a" },
  { id: "blue",   color: "#3a6aa0" },
  { id: "grey",   color: "#6a7a86" },
  { id: "violet", color: "#7a5aa0" },
] as const;

export const BROW_STYLES = ["neutral", "arched", "bold", "raised", "furrowed", "feathered", "thin"] as const;

export const FACIAL_HAIR = ["none", "stubble", "mustache", "goatee", "soul-patch", "full-beard"] as const;

export const MOUTH_STYLES = ["smile", "slight-smile", "smirk", "neutral", "serious", "pursed", "open", "grin"] as const;

export const LIP_COLORS = [
  { id: "natural", color: "#b87060" },
  { id: "berry",   color: "#7a2a4a" },
  { id: "red",     color: "#b8202a" },
  { id: "mauve",   color: "#a06070" },
  { id: "nude",    color: "#c89484" },
  { id: "gloss",   color: "#d89898" },
] as const;

export const FRECKLES = ["none", "light", "heavy"] as const;

export const GLASSES = ["none", "round", "square", "aviator", "cat-eye", "reading"] as const;

export const EARRINGS = ["none", "stud", "hoop", "drop"] as const;

export const OUTFIT_BASES = [
  { id: "tee",          label: "T-Shirt" },
  { id: "henley",       label: "Henley" },
  { id: "tank",         label: "Tank" },
  { id: "oxford",       label: "Oxford" },
  { id: "turtleneck",   label: "Turtleneck" },
  { id: "knit",         label: "Knit Sweater" },
  { id: "hoodie",       label: "Hoodie" },
  { id: "denim-jacket", label: "Denim Jacket" },
  { id: "leather",      label: "Leather Jacket" },
  { id: "blazer",       label: "Blazer" },
  { id: "trench",       label: "Trench" },
  { id: "silk-blouse",  label: "Silk Blouse" },
] as const;

export const OUTFIT_COLORS = [
  { id: "navy",      color: "#1f3a6e" },
  { id: "charcoal",  color: "#2a2a2e" },
  { id: "black",     color: "#0d0d0d" },
  { id: "cream",     color: "#e8dcc0" },
  { id: "rust",      color: "#a04a2a" },
  { id: "forest",    color: "#2a5a3a" },
  { id: "sage",      color: "#7d9b76" },
  { id: "burgundy",  color: "#5a1a2a" },
  { id: "camel",     color: "#b5894a" },
  { id: "slate",     color: "#4a5560" },
  { id: "powder",    color: "#aac4d8" },
  { id: "blush",     color: "#d8b0a8" },
] as const;

export const BACKGROUNDS = [
  { id: "studio",    color: "#2a2a30" },
  { id: "paper",     color: "#e8e4dd" },
  { id: "sky",       color: "#a8c6e8" },
  { id: "dusk",      color: "#6a4a8a" },
  { id: "ember",     color: "#c44a2a" },
  { id: "void",      color: "#1a1a2a" },
  { id: "mint",      color: "#8ad6b8" },
  { id: "peach",     color: "#f2c0a0" },
  { id: "emerald",   color: "#1a5a4a" },
  { id: "indigo",    color: "#2a2a6e" },
  { id: "rose",      color: "#d89098" },
  { id: "sand",      color: "#d8c0a0" },
] as const;

export type AvatarParts = {
  body_type:    string;
  skin_tone:    string;
  hair_style:   string;
  hair_color:   string;
  eye_style:    string;
  eye_color:    string;
  brow_style:   string;
  facial_hair:  string;
  mouth_style:  string;
  lip_color:    string;
  freckles:     string;
  glasses:      string;
  earrings:     string;
  outfit_base:  string;
  outfit_color: string;
  background:   string;
};

export const DEFAULT_AVATAR: AvatarParts = {
  body_type:    "standard",
  skin_tone:    "tone-3",
  hair_style:   "short",
  hair_color:   "brown",
  eye_style:    "almond",
  eye_color:    "brown",
  brow_style:   "neutral",
  facial_hair:  "none",
  mouth_style:  "slight-smile",
  lip_color:    "natural",
  freckles:     "none",
  glasses:      "none",
  earrings:     "none",
  outfit_base:  "tee",
  outfit_color: "navy",
  background:   "studio",
};

export type StepperOption = { id: string; label: string };

function cap(s: string) {
  return s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export const STEPPER_OPTIONS: Record<keyof AvatarParts, StepperOption[]> = {
  body_type:    BODY_TYPES.map((id) => ({ id, label: cap(id) })),
  skin_tone:    SKIN_TONES.map((s) => ({ id: s.id, label: s.id.replace("tone-", "Tone ") })),
  hair_style:   HAIR_STYLES.map((id) => ({ id, label: cap(id) })),
  hair_color:   HAIR_COLORS.map((c) => ({ id: c.id, label: cap(c.id) })),
  eye_style:    EYE_STYLES.map((id) => ({ id, label: cap(id) })),
  eye_color:    EYE_COLORS.map((c) => ({ id: c.id, label: cap(c.id) })),
  brow_style:   BROW_STYLES.map((id) => ({ id, label: cap(id) })),
  facial_hair:  FACIAL_HAIR.map((id) => ({ id, label: cap(id) })),
  mouth_style:  MOUTH_STYLES.map((id) => ({ id, label: cap(id) })),
  lip_color:    LIP_COLORS.map((c) => ({ id: c.id, label: cap(c.id) })),
  freckles:     FRECKLES.map((id) => ({ id, label: cap(id) })),
  glasses:      GLASSES.map((id) => ({ id, label: cap(id) })),
  earrings:     EARRINGS.map((id) => ({ id, label: cap(id) })),
  outfit_base:  OUTFIT_BASES.map((o) => ({ id: o.id, label: o.label })),
  outfit_color: OUTFIT_COLORS.map((c) => ({ id: c.id, label: cap(c.id) })),
  background:   BACKGROUNDS.map((b) => ({ id: b.id, label: cap(b.id) })),
};

// ------------------------------------------------------------------
// Cosmetic catalog (unchanged earned items).
// ------------------------------------------------------------------

export const COSMETICS: CosmeticItem[] = [
  // Universal seed
  { id: "u-cap-grey",    name: "Charcoal Cap",     slot: "hat",       theme: null, color: "#3a3a3a", source: "seed",    blurb: "Standard issue." },
  { id: "u-frame-thin",  name: "Thin Frame",       slot: "frame",     theme: null, color: "#bcbcbc", source: "seed",    blurb: "Clean border." },
  { id: "u-pin-star",    name: "Star Pin",         slot: "accessory", theme: null, color: "#e8c84a", source: "seed",    blurb: "A small star." },

  // On-time drop pool
  { id: "u-cap-red",     name: "Red Cap",          slot: "hat",       theme: null, color: "#c44a3a", source: "on_time", blurb: "For showing up." },
  { id: "u-beanie-nav",  name: "Navy Beanie",      slot: "hat",       theme: null, color: "#1f2a4e", source: "on_time", blurb: "Cold-morning grind." },
  { id: "u-jacket-grn",  name: "Field Jacket",     slot: "top",       theme: null, color: "#3a5a2a", source: "on_time", blurb: "Pockets for plans." },
  { id: "u-jacket-blk",  name: "Black Jacket",     slot: "top",       theme: null, color: "#0d0d0d", source: "on_time", blurb: "Quiet confidence." },
  { id: "u-frame-gold",  name: "Gold Frame",       slot: "frame",     theme: null, color: "#c9a84c", source: "on_time", blurb: "Earned shine." },
  { id: "u-frame-neon",  name: "Neon Frame",       slot: "frame",     theme: null, color: "#4adcc9", source: "on_time", blurb: "Late-night energy." },
  { id: "u-pin-flame",   name: "Flame Pin",        slot: "accessory", theme: null, color: "#e85a2a", source: "on_time", blurb: "On a streak." },
  { id: "u-pin-bolt",    name: "Bolt Pin",         slot: "accessory", theme: null, color: "#4ac9e8", source: "on_time", blurb: "Move fast." },

  // Themed mastery sets
  { id: "m-mythic-hat",  name: "Sage Hood",         slot: "hat",       theme: "mythic",  setId: "mythic-set",  color: "#4a2a6e", source: "mastery", blurb: "Mythic set · 1/4" },
  { id: "m-mythic-top",  name: "Rune Cloak",        slot: "top",       theme: "mythic",  setId: "mythic-set",  color: "#1a1a3a", color2: "#c9a84c", source: "mastery", blurb: "Mythic set · 2/4" },
  { id: "m-mythic-acc",  name: "Sigil Pin",         slot: "accessory", theme: "mythic",  setId: "mythic-set",  color: "#c9a84c", source: "mastery", blurb: "Mythic set · 3/4" },
  { id: "m-mythic-frm",  name: "Arcane Frame",      slot: "frame",     theme: "mythic",  setId: "mythic-set",  color: "#c9a84c", source: "mastery", blurb: "Mythic set · 4/4" },
  { id: "m-sports-hat",  name: "Coach Cap",         slot: "hat",       theme: "sports",  setId: "sports-set",  color: "#c44a2a", source: "mastery", blurb: "Sports set · 1/4" },
  { id: "m-sports-top",  name: "Letterman",         slot: "top",       theme: "sports",  setId: "sports-set",  color: "#2a3a6e", color2: "#e8c84a", source: "mastery", blurb: "Sports set · 2/4" },
  { id: "m-sports-acc",  name: "Gold Medal",        slot: "accessory", theme: "sports",  setId: "sports-set",  color: "#e8c84a", source: "mastery", blurb: "Sports set · 3/4" },
  { id: "m-sports-frm",  name: "Stadium Frame",     slot: "frame",     theme: "sports",  setId: "sports-set",  color: "#e85a2a", source: "mastery", blurb: "Sports set · 4/4" },
  { id: "m-fin-hat",     name: "Trader Visor",      slot: "hat",       theme: "finance", setId: "finance-set", color: "#0d3a2a", source: "mastery", blurb: "Finance set · 1/4" },
  { id: "m-fin-top",     name: "Pinstripe Suit",    slot: "top",       theme: "finance", setId: "finance-set", color: "#1a1a2a", color2: "#bcbcbc", source: "mastery", blurb: "Finance set · 2/4" },
  { id: "m-fin-acc",     name: "Dollar Pin",        slot: "accessory", theme: "finance", setId: "finance-set", color: "#4adc8a", source: "mastery", blurb: "Finance set · 3/4" },
  { id: "m-fin-frm",     name: "Bull Frame",        slot: "frame",     theme: "finance", setId: "finance-set", color: "#4adc8a", source: "mastery", blurb: "Finance set · 4/4" },
  { id: "m-her-hat",     name: "Hero Cowl",         slot: "hat",       theme: "heroes",  setId: "heroes-set",  color: "#c4202a", source: "mastery", blurb: "Heroes set · 1/4" },
  { id: "m-her-top",     name: "Caped Suit",        slot: "top",       theme: "heroes",  setId: "heroes-set",  color: "#1a3ad6", color2: "#e8c84a", source: "mastery", blurb: "Heroes set · 2/4" },
  { id: "m-her-acc",     name: "Power Emblem",      slot: "accessory", theme: "heroes",  setId: "heroes-set",  color: "#e8c84a", source: "mastery", blurb: "Heroes set · 3/4" },
  { id: "m-her-frm",     name: "Halftone Frame",    slot: "frame",     theme: "heroes",  setId: "heroes-set",  color: "#c4202a", source: "mastery", blurb: "Heroes set · 4/4" },
  { id: "m-rea-hat",     name: "Camera Headset",    slot: "hat",       theme: "reality", setId: "reality-set", color: "#1a1a1a", source: "mastery", blurb: "Reality set · 1/4" },
  { id: "m-rea-top",     name: "Confessional Lace", slot: "top",       theme: "reality", setId: "reality-set", color: "#e0408a", color2: "#f0d78c", source: "mastery", blurb: "Reality set · 2/4" },
  { id: "m-rea-acc",     name: "Diamond Earring",   slot: "accessory", theme: "reality", setId: "reality-set", color: "#f0d78c", source: "mastery", blurb: "Reality set · 3/4" },
  { id: "m-rea-frm",     name: "Spotlight Frame",   slot: "frame",     theme: "reality", setId: "reality-set", color: "#e0408a", source: "mastery", blurb: "Reality set · 4/4" },
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

export const SEED_INVENTORY: string[] = COSMETICS.filter((c) => c.source === "seed").map((c) => c.id);

const ON_TIME_POOL: string[] = COSMETICS.filter((c) => c.source === "on_time").map((c) => c.id);

export function masterySetFor(theme: ThemeId | string): string[] {
  return COSMETICS.filter((c) => c.source === "mastery" && c.theme === theme).map((c) => c.id);
}

export function rollOnTimeDrop(owned: Set<string>): string | null {
  const pool = ON_TIME_POOL.filter((id) => !owned.has(id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const ON_TIME_DROP_EVERY = 3;
export const MASTERY_THRESHOLD = 5;

export type EquippedMap = Partial<Record<Slot, string>>;
