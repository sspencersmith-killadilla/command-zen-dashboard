import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StudyBlock = {
  id: string;
  course_id: string | null;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  source: string;
  gcal_event_id: string | null;
  completed_at: string | null;
};

const SELECT = "id,course_id,title,notes,starts_at,ends_at,source,gcal_event_id,completed_at";

export const listStudyBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const from = new Date();
    from.setDate(from.getDate() - 1);
    const to = new Date();
    to.setDate(to.getDate() + 14);
    const { data, error } = await supabase
      .from("study_blocks")
      .select(SELECT)
      .eq("user_id", userId)
      .gte("starts_at", from.toISOString())
      .lte("starts_at", to.toISOString())
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as StudyBlock[];
  });

const createSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  course_id: z.string().max(120).optional(),
  starts_at: z.string().min(1).max(40),
  ends_at: z.string().min(1).max(40),
  source: z.enum(["manual", "auto"]).optional(),
});

export const createStudyBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("study_blocks")
      .insert({
        user_id: userId,
        title: data.title,
        notes: data.notes ?? null,
        course_id: data.course_id ?? null,
        starts_at: data.starts_at,
        ends_at: data.ends_at,
        source: data.source ?? "manual",
      })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as StudyBlock;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).optional(),
  starts_at: z.string().min(1).max(40).optional(),
  ends_at: z.string().min(1).max(40).optional(),
  completed: z.boolean().optional(),
});

export const updateStudyBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: {
      title?: string;
      notes?: string;
      starts_at?: string;
      ends_at?: string;
      completed_at?: string | null;
    } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.starts_at !== undefined) patch.starts_at = data.starts_at;
    if (data.ends_at !== undefined) patch.ends_at = data.ends_at;
    if (data.completed !== undefined) patch.completed_at = data.completed ? new Date().toISOString() : null;
    const { data: row, error } = await supabase
      .from("study_blocks")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as StudyBlock;
  });

export const deleteStudyBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("study_blocks")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const autoSchema = z.object({
  assignments: z.array(
    z.object({
      id: z.string().min(1).max(120),
      title: z.string().min(1).max(300),
      courseCode: z.string().max(120),
      dueAt: z.string().min(1).max(40),
    }),
  ).max(50),
});

/** Generate study blocks for upcoming assignments. Skips assignments that already have a block. */
export const autoGenerateBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => autoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("study_blocks")
      .select("notes")
      .eq("user_id", userId)
      .eq("source", "auto");
    const taggedIds = new Set(
      (existing ?? []).map((r) => {
        const m = /\[auto:([^\]]+)\]/.exec((r.notes as string | null) ?? "");
        return m?.[1];
      }).filter(Boolean) as string[],
    );

    const now = Date.now();
    const toInsert: Array<Record<string, unknown>> = [];
    for (const a of data.assignments) {
      if (taggedIds.has(a.id)) continue;
      const due = new Date(a.dueAt).getTime();
      const daysOut = Math.max(0, Math.round((due - now) / 86_400_000));
      if (daysOut < 0 || daysOut > 14) continue;
      // Schedule a 60-min block 2 days before due at 4pm local
      const block = new Date(due - Math.min(daysOut, 2) * 86_400_000);
      block.setHours(16, 0, 0, 0);
      const end = new Date(block.getTime() + 60 * 60_000);
      toInsert.push({
        user_id: userId,
        course_id: a.courseCode,
        title: `Study: ${a.title}`,
        notes: `[auto:${a.id}] Prep for ${a.title}`,
        starts_at: block.toISOString(),
        ends_at: end.toISOString(),
        source: "auto",
      });
    }
    if (toInsert.length === 0) return { created: 0 };
    const { error } = await supabase.from("study_blocks").insert(toInsert);
    if (error) throw new Error(error.message);
    return { created: toInsert.length };
  });
