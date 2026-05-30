import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FocusSession = {
  id: string;
  started_at: string;
  ended_at: string | null;
  planned_minutes: number;
  actual_minutes: number | null;
  assignment_ref: string | null;
  course_id: string | null;
  notes: string | null;
  completed: boolean;
};

const SELECT = "id,started_at,ended_at,planned_minutes,actual_minutes,assignment_ref,course_id,notes,completed";

export const listRecentSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("focus_sessions")
      .select(SELECT)
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as FocusSession[];
  });

const startSchema = z.object({
  planned_minutes: z.number().int().min(5).max(180),
  assignment_ref: z.string().max(300).optional(),
  course_id: z.string().max(120).optional(),
});

export const startFocusSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => startSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: userId,
        planned_minutes: data.planned_minutes,
        assignment_ref: data.assignment_ref ?? null,
        course_id: data.course_id ?? null,
      })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as FocusSession;
  });

const endSchema = z.object({
  id: z.string().uuid(),
  actual_minutes: z.number().int().min(0).max(300),
  completed: z.boolean(),
  notes: z.string().max(1000).optional(),
});

export const endFocusSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => endSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("focus_sessions")
      .update({
        ended_at: new Date().toISOString(),
        actual_minutes: data.actual_minutes,
        completed: data.completed,
        notes: data.notes ?? null,
      })
      .eq("id", data.id)
      .eq("user_id", userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as FocusSession;
  });
