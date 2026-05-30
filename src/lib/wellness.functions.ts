import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type WellnessLog = {
  id: string;
  log_date: string;
  sleep_hours: number | null;
  water_cups: number;
  meals: Record<string, boolean>;
  movement_minutes: number;
  movement_type: string | null;
  mood: number | null;
  notes: string | null;
};

const SELECT = "id,log_date,sleep_hours,water_cups,meals,movement_minutes,movement_type,mood,notes";

export const getRecentWellness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const { data, error } = await supabase
      .from("wellness_logs")
      .select(SELECT)
      .eq("user_id", userId)
      .gte("log_date", since.toISOString().slice(0, 10))
      .order("log_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as WellnessLog[];
  });

const upsertSchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleep_hours: z.number().min(0).max(24).nullable().optional(),
  water_cups: z.number().int().min(0).max(30).optional(),
  meals: z.record(z.string().max(40), z.boolean()).optional(),
  movement_minutes: z.number().int().min(0).max(600).optional(),
  movement_type: z.string().max(60).nullable().optional(),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const upsertWellnessLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload: {
      user_id: string;
      log_date: string;
      sleep_hours?: number | null;
      water_cups?: number;
      meals?: Record<string, boolean>;
      movement_minutes?: number;
      movement_type?: string | null;
      mood?: number | null;
      notes?: string | null;
    } = { user_id: userId, log_date: data.log_date };
    if (data.sleep_hours !== undefined) payload.sleep_hours = data.sleep_hours;
    if (data.water_cups !== undefined) payload.water_cups = data.water_cups;
    if (data.meals !== undefined) payload.meals = data.meals;
    if (data.movement_minutes !== undefined) payload.movement_minutes = data.movement_minutes;
    if (data.movement_type !== undefined) payload.movement_type = data.movement_type;
    if (data.mood !== undefined) payload.mood = data.mood;
    if (data.notes !== undefined) payload.notes = data.notes;
    const { data: row, error } = await supabase
      .from("wellness_logs")
      .upsert(payload, { onConflict: "user_id,log_date" })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as WellnessLog;
  });
