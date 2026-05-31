import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MemoryEntry = { key: string; value: string; updatedAt: string };

const MAX_MEMORIES = 5;

export const updateCompanionMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      key: z.string().min(1).max(60),
      value: z.string().min(1).max(280),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("user_configs")
      .select("companion_memory")
      .eq("user_id", userId)
      .maybeSingle();
    const existing: MemoryEntry[] = Array.isArray(row?.companion_memory)
      ? (row.companion_memory as MemoryEntry[])
      : [];
    const filtered = existing.filter((m) => m.key !== data.key);
    filtered.push({ key: data.key, value: data.value, updatedAt: new Date().toISOString() });
    const trimmed = filtered.slice(-MAX_MEMORIES);
    const { error } = await supabase
      .from("user_configs")
      .update({ companion_memory: trimmed })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true, memory: trimmed };
  });
