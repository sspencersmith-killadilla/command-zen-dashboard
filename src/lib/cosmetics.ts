// Cosmetic catalog + base-part options + earning rules.
// Data-only (no React imports) so it can run on the server and client.

import type { ThemeId } from "./companions";

export type Slot = "hat" | "top" | "accessory" | "frame";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type CosmeticItem = {
  id: string;
  name: string;
  slot: Slot;
  theme: ThemeId | null;
  setId?: string;
  color: string;
  color2?: string;
  source: "seed" | "on_time" | "mastery";
  rarity: Rarity;
  blurb: string;
};

export const RARITY_META: Record<Rarity, { label: string; ring: string; chip: string; text: string; glow?: string }> = {
  common: {
    label: "Common",
    ring: "border-border/60",
    chip: "bg-muted text-muted-foreground border-border/60",
    text: "text-muted-foreground",
  },
  rare: {
    label: "Rare",
    ring: "border-sky-400/60",
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
    text: "text-sky-600 dark:text-sky-300",
    glow: "shadow-[0_0_18px_-6px_rgba(56,189,248,0.6)]",
  },
  epic: {
    label: "Epic",
    ring: "border-violet-400/60",
    chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40",
    text: "text-violet-600 dark:text-violet-300",
    glow: "shadow-[0_0_22px_-6px_rgba(167,139,250,0.7)]",
  },
  legendary: {
    label: "Legendary",
    ring: "border-amber-400/70",
    chip: "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50",
    text: "text-amber-600 dark:text-amber-300",
    glow: "shadow-[0_0_28px_-4px_rgba(251,191,36,0.65)]",
  },
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
  // ─── Seed (starter kit) ─────────────────────────────────────────────
  { id: "u-cap-grey",    name: "Charcoal Cap",       slot: "hat",       theme: null, color: "#3a3a3a", source: "seed",    rarity: "common", blurb: "Standard issue. Every academic starts here." },
  { id: "u-frame-thin",  name: "Thin Frame",         slot: "frame",     theme: null, color: "#bcbcbc", source: "seed",    rarity: "common", blurb: "A clean hairline border. Quiet, considered." },
  { id: "u-pin-star",    name: "Brass Star Pin",     slot: "accessory", theme: null, color: "#e8c84a", source: "seed",    rarity: "common", blurb: "A small star, lightly tarnished. Honest beginnings." },
  { id: "u-tee-stone",   name: "Stone Tee",          slot: "top",       theme: null, color: "#c8c4bc", source: "seed",    rarity: "common", blurb: "Garment-washed cotton. The everything shirt." },

  // ─── On-time drops (common → legendary) ─────────────────────────────
  // Common
  { id: "u-cap-red",     name: "Crimson Cap",        slot: "hat",       theme: null, color: "#c44a3a", source: "on_time", rarity: "common", blurb: "For showing up — even on the bad days." },
  { id: "u-beanie-nav",  name: "Harbor Beanie",      slot: "hat",       theme: null, color: "#1f2a4e", source: "on_time", rarity: "common", blurb: "Ribbed merino. Cold-morning grind essential." },
  { id: "u-cap-olive",   name: "Olive Field Cap",    slot: "hat",       theme: null, color: "#4a5530", source: "on_time", rarity: "common", blurb: "Six-panel, broken-in. Quietly capable." },
  { id: "u-jacket-grn",  name: "Field Jacket",       slot: "top",       theme: null, color: "#3a5a2a", source: "on_time", rarity: "common", blurb: "Four pockets, room for the whole plan." },
  { id: "u-jacket-blk",  name: "Black Bomber",       slot: "top",       theme: null, color: "#0d0d0d", source: "on_time", rarity: "common", blurb: "Cropped, ribbed cuffs. Quiet confidence." },
  { id: "u-crew-oat",    name: "Oat Crewneck",       slot: "top",       theme: null, color: "#d6c8a8", source: "on_time", rarity: "common", blurb: "Loop-back fleece. The library uniform." },
  { id: "u-pin-flame",   name: "Ember Pin",          slot: "accessory", theme: null, color: "#e85a2a", source: "on_time", rarity: "common", blurb: "A small flame, enameled. You are on a streak." },
  { id: "u-pin-bolt",    name: "Bolt Pin",           slot: "accessory", theme: null, color: "#4ac9e8", source: "on_time", rarity: "common", blurb: "Cobalt enamel. Move fast, deliver clean." },

  // Rare
  { id: "u-frame-gold",  name: "Brushed Gold Frame", slot: "frame",     theme: null, color: "#c9a84c", source: "on_time", rarity: "rare", blurb: "Earned shine — three on-time submissions running." },
  { id: "u-frame-neon",  name: "Neon Wire Frame",    slot: "frame",     theme: null, color: "#4adcc9", source: "on_time", rarity: "rare", blurb: "Late-night energy made visible." },
  { id: "u-frame-ivory", name: "Ivory Frame",        slot: "frame",     theme: null, color: "#f0e6d2", source: "on_time", rarity: "rare", blurb: "Bone-white border. Editorial weight." },
  { id: "u-hood-char",   name: "Charcoal Hoodie",    slot: "top",       theme: null, color: "#2a2a2e", source: "on_time", rarity: "rare", blurb: "Heavyweight loopback. Drafted-in-by-noon energy." },
  { id: "u-jacket-rust", name: "Rust Chore Coat",    slot: "top",       theme: null, color: "#a04a2a", source: "on_time", rarity: "rare", blurb: "Selvedge twill. Built for a long semester." },
  { id: "u-cap-cream",   name: "Cream Trucker",      slot: "hat",       theme: null, color: "#e8dcc0", source: "on_time", rarity: "rare", blurb: "Foam crown, mesh back. Off-campus signature." },
  { id: "u-pin-laurel",  name: "Laurel Pin",         slot: "accessory", theme: null, color: "#7d9b76", source: "on_time", rarity: "rare", blurb: "A sprig of victory — modest, hard-earned." },
  { id: "u-pin-quill",   name: "Silver Quill",       slot: "accessory", theme: null, color: "#d8d8d8", source: "on_time", rarity: "rare", blurb: "For the writer who finishes the paragraph." },

  // Epic
  { id: "u-blazer-navy", name: "Navy Blazer",        slot: "top",       theme: null, color: "#1f3a6e", color2: "#c9a84c", source: "on_time", rarity: "epic", blurb: "Gold-button worsted. The seminar uniform." },
  { id: "u-trench-camel",name: "Camel Trench",       slot: "top",       theme: null, color: "#b5894a", color2: "#3a2a1a", source: "on_time", rarity: "epic", blurb: "Belted gabardine. Walks into lecture three minutes early." },
  { id: "u-frame-marble",name: "Marble Frame",       slot: "frame",     theme: null, color: "#dcd6c8", color2: "#3a3a3a", source: "on_time", rarity: "epic", blurb: "Veined plaster. Museum-wall energy." },
  { id: "u-hat-fedora",  name: "Felt Fedora",        slot: "hat",       theme: null, color: "#2a1f14", source: "on_time", rarity: "epic", blurb: "Pinch-front wool. Sundays at the archive." },
  { id: "u-pin-compass", name: "Compass Brooch",     slot: "accessory", theme: null, color: "#1f3a6e", color2: "#c9a84c", source: "on_time", rarity: "epic", blurb: "Brass rose. Points toward the next deadline." },

  // Legendary — earned for the long-haul
  { id: "u-frame-aurora",name: "Aurora Frame",       slot: "frame",     theme: null, color: "#6a4adc", color2: "#4adcc9", source: "on_time", rarity: "legendary", blurb: "Shifting violet-to-mint border. Worn by finishers." },
  { id: "u-crown-laurel",name: "Laurel Crown",       slot: "hat",       theme: null, color: "#7d9b76", color2: "#c9a84c", source: "on_time", rarity: "legendary", blurb: "Gilded olive leaves. A semester of zero misses." },
  { id: "u-pin-phoenix", name: "Phoenix Sigil",      slot: "accessory", theme: null, color: "#e85a2a", color2: "#f0d78c", source: "on_time", rarity: "legendary", blurb: "Cast bronze. For the comeback that became a streak." },
  { id: "u-cape-onyx",   name: "Onyx Overcoat",      slot: "top",       theme: null, color: "#0a0a0e", color2: "#c9a84c", source: "on_time", rarity: "legendary", blurb: "Cashmere with gold lining. Whisper-quiet authority." },

  // ─── Themed mastery sets (one full set per theme — epic) ────────────
  // Mythic
  { id: "m-mythic-hat",  name: "Sage Hood",          slot: "hat",       theme: "mythic",  setId: "mythic-set",  color: "#4a2a6e", source: "mastery", rarity: "epic", blurb: "Mythic set · 1/4 — drawn cowl, kept secrets." },
  { id: "m-mythic-top",  name: "Rune Cloak",         slot: "top",       theme: "mythic",  setId: "mythic-set",  color: "#1a1a3a", color2: "#c9a84c", source: "mastery", rarity: "epic", blurb: "Mythic set · 2/4 — gold script on midnight wool." },
  { id: "m-mythic-acc",  name: "Sigil Pin",          slot: "accessory", theme: "mythic",  setId: "mythic-set",  color: "#c9a84c", source: "mastery", rarity: "epic", blurb: "Mythic set · 3/4 — a glyph only you can read." },
  { id: "m-mythic-frm",  name: "Arcane Frame",       slot: "frame",     theme: "mythic",  setId: "mythic-set",  color: "#c9a84c", source: "mastery", rarity: "epic", blurb: "Mythic set · 4/4 — runes etched into the gild." },
  // Sports
  { id: "m-sports-hat",  name: "Coach Cap",          slot: "hat",       theme: "sports",  setId: "sports-set",  color: "#c44a2a", source: "mastery", rarity: "epic", blurb: "Sports set · 1/4 — worn at the line." },
  { id: "m-sports-top",  name: "Letterman Jacket",   slot: "top",       theme: "sports",  setId: "sports-set",  color: "#2a3a6e", color2: "#e8c84a", source: "mastery", rarity: "epic", blurb: "Sports set · 2/4 — chenille patch, leather sleeves." },
  { id: "m-sports-acc",  name: "Gold Medal",         slot: "accessory", theme: "sports",  setId: "sports-set",  color: "#e8c84a", source: "mastery", rarity: "epic", blurb: "Sports set · 3/4 — finals season, first place." },
  { id: "m-sports-frm",  name: "Stadium Frame",      slot: "frame",     theme: "sports",  setId: "sports-set",  color: "#e85a2a", source: "mastery", rarity: "epic", blurb: "Sports set · 4/4 — floodlight halo." },
  // Finance
  { id: "m-fin-hat",     name: "Trader Visor",       slot: "hat",       theme: "finance", setId: "finance-set", color: "#0d3a2a", source: "mastery", rarity: "epic", blurb: "Finance set · 1/4 — green eyeshade, sharp pencil." },
  { id: "m-fin-top",     name: "Pinstripe Suit",     slot: "top",       theme: "finance", setId: "finance-set", color: "#1a1a2a", color2: "#bcbcbc", source: "mastery", rarity: "epic", blurb: "Finance set · 2/4 — chalk stripe, half-canvas." },
  { id: "m-fin-acc",     name: "Dollar Lapel Pin",   slot: "accessory", theme: "finance", setId: "finance-set", color: "#4adc8a", source: "mastery", rarity: "epic", blurb: "Finance set · 3/4 — enamel mint." },
  { id: "m-fin-frm",     name: "Bull Frame",         slot: "frame",     theme: "finance", setId: "finance-set", color: "#4adc8a", source: "mastery", rarity: "epic", blurb: "Finance set · 4/4 — line goes up." },
  // Heroes
  { id: "m-her-hat",     name: "Hero Cowl",          slot: "hat",       theme: "heroes",  setId: "heroes-set",  color: "#c4202a", source: "mastery", rarity: "epic", blurb: "Heroes set · 1/4 — pulled low, eyes forward." },
  { id: "m-her-top",     name: "Caped Suit",         slot: "top",       theme: "heroes",  setId: "heroes-set",  color: "#1a3ad6", color2: "#e8c84a", source: "mastery", rarity: "epic", blurb: "Heroes set · 2/4 — primary colors, panel lines." },
  { id: "m-her-acc",     name: "Power Emblem",       slot: "accessory", theme: "heroes",  setId: "heroes-set",  color: "#e8c84a", source: "mastery", rarity: "epic", blurb: "Heroes set · 3/4 — chest insignia, polished." },
  { id: "m-her-frm",     name: "Halftone Frame",     slot: "frame",     theme: "heroes",  setId: "heroes-set",  color: "#c4202a", source: "mastery", rarity: "epic", blurb: "Heroes set · 4/4 — dotted comic-print border." },
  // Reality
  { id: "m-rea-hat",     name: "Camera Headset",     slot: "hat",       theme: "reality", setId: "reality-set", color: "#1a1a1a", source: "mastery", rarity: "epic", blurb: "Reality set · 1/4 — always-on mic, hot light." },
  { id: "m-rea-top",     name: "Confessional Lace",  slot: "top",       theme: "reality", setId: "reality-set", color: "#e0408a", color2: "#f0d78c", source: "mastery", rarity: "epic", blurb: "Reality set · 2/4 — blush silk, gold trim." },
  { id: "m-rea-acc",     name: "Diamond Drop",       slot: "accessory", theme: "reality", setId: "reality-set", color: "#f0d78c", source: "mastery", rarity: "epic", blurb: "Reality set · 3/4 — pear cut, catches every angle." },
  { id: "m-rea-frm",     name: "Spotlight Frame",    slot: "frame",     theme: "reality", setId: "reality-set", color: "#e0408a", source: "mastery", rarity: "epic", blurb: "Reality set · 4/4 — magenta gel, soft focus." },
  // Modern
  { id: "m-mod-hat",     name: "Quiet Crop",         slot: "hat",       theme: "modern",  setId: "modern-set",  color: "#3a3530", source: "mastery", rarity: "epic", blurb: "Modern set · 1/4 — clipper-cut, no fuss." },
  { id: "m-mod-top",     name: "Sage Blazer",        slot: "top",       theme: "modern",  setId: "modern-set",  color: "#7d9b76", color2: "#f5f0e8", source: "mastery", rarity: "epic", blurb: "Modern set · 2/4 — unstructured linen, soft shoulder." },
  { id: "m-mod-acc",     name: "Tortoise Frames",    slot: "accessory", theme: "modern",  setId: "modern-set",  color: "#8a5638", source: "mastery", rarity: "epic", blurb: "Modern set · 3/4 — round acetate, reading rim." },
  { id: "m-mod-frm",     name: "Clay Frame",         slot: "frame",     theme: "modern",  setId: "modern-set",  color: "#c2956b", source: "mastery", rarity: "epic", blurb: "Modern set · 4/4 — terracotta wash, hand-thrown edge." },

  // ─── Legendary themed capstones — full set mastery rewards ──────────
  { id: "l-mythic-cap",  name: "Oracle's Diadem",    slot: "hat",       theme: "mythic",  color: "#4a2a6e", color2: "#c9a84c", source: "mastery", rarity: "legendary", blurb: "Mythic capstone — the prophecy you actually finished." },
  { id: "l-sports-cap",  name: "Championship Ring",  slot: "accessory", theme: "sports",  color: "#e8c84a", color2: "#c4202a", source: "mastery", rarity: "legendary", blurb: "Sports capstone — banner year, raised rafters." },
  { id: "l-fin-cap",     name: "Bull-Market Lapel",  slot: "accessory", theme: "finance", color: "#0d3a2a", color2: "#4adc8a", source: "mastery", rarity: "legendary", blurb: "Finance capstone — closed every quarter green." },
  { id: "l-her-cap",     name: "Aegis Mantle",       slot: "top",       theme: "heroes",  color: "#c4202a", color2: "#c9a84c", source: "mastery", rarity: "legendary", blurb: "Heroes capstone — the cape that earned its weight." },
  { id: "l-rea-cap",     name: "Confetti Crown",     slot: "hat",       theme: "reality",  color: "#e0408a", color2: "#f0d78c", source: "mastery", rarity: "legendary", blurb: "Reality capstone — finale night, last one standing." },
  { id: "l-mod-cap",     name: "Atelier Coat",       slot: "top",       theme: "modern",  color: "#3a3530", color2: "#c2956b", source: "mastery", rarity: "legendary", blurb: "Modern capstone — bespoke, hand-finished, signed." },
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
