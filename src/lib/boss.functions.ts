import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { makeCheckpoints, type BossTier } from "./boss";

export const planBossAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().min(1).max(120),
      title: z.string().min(1).max(255),
      dueAt: z.string().datetime(),
      courseCode: z.string().max(120).optional(),
      tier: z.enum(["mini", "boss"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tier: BossTier = data.tier ?? "boss";
    const checkpoints = makeCheckpoints(
      { id: data.id, title: data.title, dueAt: new Date(data.dueAt) },
      tier,
    );
    const rows = checkpoints.map((c) => ({
      user_id: userId,
      title: c.label,
      starts_at: c.startsAt.toISOString(),
      ends_at: c.endsAt.toISOString(),
      notes: c.notes,
      source: tier === "mini" ? "miniboss" : "boss",
      course_id: data.courseCode ?? null,
    }));
    const { error } = await supabase.from("study_blocks").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, count: rows.length, tier };
  });
