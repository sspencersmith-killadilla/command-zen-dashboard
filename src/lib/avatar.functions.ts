import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DEFAULT_AVATAR,
  SEED_INVENTORY,
  rollOnTimeDrop,
  masterySetFor,
  ON_TIME_DROP_EVERY,
  MASTERY_THRESHOLD,
  type AvatarParts,
  type EquippedMap,
  type Slot,
} from "./cosmetics";

export type AvatarState = AvatarParts & {
  equipped: EquippedMap;
  on_time_count: number;
  mastery_progress: Record<string, number>;
  inventory: string[];
};

type Row = {
  body_type: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  eye_style: string;
  eye_color: string;
  brow_style: string;
  facial_hair: string;
  mouth_style: string;
  lip_color: string;
  freckles: string;
  glasses: string;
  earrings: string;
  outfit_base: string;
  outfit_color: string;
  background: string;
  equipped: unknown;
  on_time_count: number;
  mastery_progress: unknown;
};

const SELECT =
  "body_type,skin_tone,hair_style,hair_color,eye_style,eye_color,brow_style,facial_hair,mouth_style,lip_color,freckles,glasses,earrings,outfit_base,outfit_color,background,equipped,on_time_count,mastery_progress";

function rowToParts(r: Row): AvatarParts {
  return {
    body_type:    r.body_type,
    skin_tone:    r.skin_tone,
    hair_style:   r.hair_style,
    hair_color:   r.hair_color,
    eye_style:    r.eye_style,
    eye_color:    r.eye_color ?? DEFAULT_AVATAR.eye_color,
    brow_style:   r.brow_style,
    facial_hair:  r.facial_hair ?? DEFAULT_AVATAR.facial_hair,
    mouth_style:  r.mouth_style,
    lip_color:    r.lip_color ?? DEFAULT_AVATAR.lip_color,
    freckles:     r.freckles ?? DEFAULT_AVATAR.freckles,
    glasses:      r.glasses ?? DEFAULT_AVATAR.glasses,
    earrings:     r.earrings ?? DEFAULT_AVATAR.earrings,
    outfit_base:  r.outfit_base,
    outfit_color: r.outfit_color ?? DEFAULT_AVATAR.outfit_color,
    background:   r.background,
  };
}

export const getMyAvatar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AvatarState> => {
    const { supabase, userId } = context;

    let { data, error } = await supabase
      .from("user_avatar")
      .select(SELECT)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!data) {
      const { data: inserted, error: insErr } = await supabase
        .from("user_avatar")
        .insert({ user_id: userId })
        .select(SELECT)
        .single();
      if (insErr) throw new Error(insErr.message);
      data = inserted;
      if (SEED_INVENTORY.length > 0) {
        await supabase
          .from("user_inventory")
          .insert(SEED_INVENTORY.map((item_id) => ({ user_id: userId, item_id, source: "seed" })));
      }
    }

    const { data: inv, error: invErr } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", userId);
    if (invErr) throw new Error(invErr.message);

    const row = data as Row;
    return {
      ...rowToParts(row),
      equipped: (row.equipped && typeof row.equipped === "object" ? row.equipped : {}) as EquippedMap,
      on_time_count: row.on_time_count ?? 0,
      mastery_progress: (row.mastery_progress && typeof row.mastery_progress === "object"
        ? row.mastery_progress
        : {}) as Record<string, number>,
      inventory: (inv ?? []).map((r) => r.item_id),
    };
  });

const partsPatchSchema = z.object({
  body_type:    z.string().max(40).optional(),
  skin_tone:    z.string().max(40).optional(),
  hair_style:   z.string().max(40).optional(),
  hair_color:   z.string().max(40).optional(),
  eye_style:    z.string().max(40).optional(),
  eye_color:    z.string().max(40).optional(),
  brow_style:   z.string().max(40).optional(),
  facial_hair:  z.string().max(40).optional(),
  mouth_style:  z.string().max(40).optional(),
  lip_color:    z.string().max(40).optional(),
  freckles:     z.string().max(40).optional(),
  glasses:      z.string().max(40).optional(),
  earrings:     z.string().max(40).optional(),
  outfit_base:  z.string().max(40).optional(),
  outfit_color: z.string().max(40).optional(),
  background:   z.string().max(40).optional(),
});

export const updateAvatarParts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => partsPatchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_avatar")
      .update(data)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const equipSchema = z.object({
  slot: z.enum(["hat", "top", "accessory", "frame"]),
  itemId: z.string().min(1).max(64).nullable(),
});

export const equipItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => equipSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (data.itemId) {
      const { data: ownsRow, error: ownErr } = await supabase
        .from("user_inventory")
        .select("item_id")
        .eq("user_id", userId)
        .eq("item_id", data.itemId)
        .maybeSingle();
      if (ownErr) throw new Error(ownErr.message);
      if (!ownsRow) throw new Error("Item not in inventory");
    }

    const { data: cur } = await supabase
      .from("user_avatar")
      .select("equipped")
      .eq("user_id", userId)
      .single();
    const equipped: EquippedMap =
      (cur?.equipped && typeof cur.equipped === "object" ? (cur.equipped as EquippedMap) : {}) || {};

    if (data.itemId) equipped[data.slot as Slot] = data.itemId;
    else delete equipped[data.slot as Slot];

    const { error } = await supabase
      .from("user_avatar")
      .update({ equipped })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, equipped };
  });

export type DropResult = { newItems: string[] };

export const recordOnTimeCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DropResult> => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("user_avatar")
      .select("on_time_count")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const prev = row?.on_time_count ?? 0;
    const next = prev + 1;

    await supabase
      .from("user_avatar")
      .update({ on_time_count: next })
      .eq("user_id", userId);

    if (next % ON_TIME_DROP_EVERY !== 0) return { newItems: [] };

    const { data: owned } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", userId);
    const ownedSet = new Set((owned ?? []).map((r) => r.item_id));
    const drop = rollOnTimeDrop(ownedSet);
    if (!drop) return { newItems: [] };

    await supabase
      .from("user_inventory")
      .insert({ user_id: userId, item_id: drop, source: "on_time" });
    return { newItems: [drop] };
  });

const masterySchema = z.object({ theme: z.string().min(1).max(40) });

export const recordThemeArcComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => masterySchema.parse(input))
  .handler(async ({ data, context }): Promise<DropResult> => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("user_avatar")
      .select("mastery_progress")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const progress = (row?.mastery_progress && typeof row.mastery_progress === "object"
      ? (row.mastery_progress as Record<string, number>)
      : {}) || {};
    const prev = progress[data.theme] ?? 0;
    const next = prev + 1;
    progress[data.theme] = next;

    await supabase
      .from("user_avatar")
      .update({ mastery_progress: progress })
      .eq("user_id", userId);

    if (next !== MASTERY_THRESHOLD) return { newItems: [] };

    const set = masterySetFor(data.theme);
    if (set.length === 0) return { newItems: [] };

    const { data: owned } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", userId);
    const ownedSet = new Set((owned ?? []).map((r) => r.item_id));
    const toGrant = set.filter((id) => !ownedSet.has(id));
    if (toGrant.length === 0) return { newItems: [] };

    await supabase
      .from("user_inventory")
      .insert(toGrant.map((item_id) => ({ user_id: userId, item_id, source: "mastery" })));
    return { newItems: toGrant };
  });

export const DEFAULT_AVATAR_STATE: AvatarState = {
  ...DEFAULT_AVATAR,
  equipped: {},
  on_time_count: 0,
  mastery_progress: {},
  inventory: [...SEED_INVENTORY],
};
