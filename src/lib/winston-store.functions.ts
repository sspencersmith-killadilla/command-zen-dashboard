import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CourseHub = { id: string; name: string; notebookUrl: string };

export type WinstonConfig = {
  onboarded: boolean;
  displayName: string;
  canvasFeedUrl: string;
  googleConnected: boolean;
  notificationsEnabled: boolean;
  courses: CourseHub[];
  companionId: string;
};

const courseSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  notebookUrl: z.string().min(1).max(2048),
});

const patchSchema = z.object({
  onboarded: z.boolean().optional(),
  displayName: z.string().max(120).optional(),
  canvasFeedUrl: z.string().max(2048).optional(),
  notificationsEnabled: z.boolean().optional(),
  courses: z.array(courseSchema).max(50).optional(),
  companionId: z.enum(["barnaby", "bean", "roxie", "pip", "lafitte"]).optional(),
});

function rowToConfig(row: {
  display_name: string;
  canvas_feed_url: string;
  courses: unknown;
  notifications_enabled: boolean;
  onboarded: boolean;
  google_connection_id: string | null;
  companion_id: string | null;
}): WinstonConfig {
  return {
    onboarded: row.onboarded,
    displayName: row.display_name ?? "",
    canvasFeedUrl: row.canvas_feed_url ?? "",
    googleConnected: !!row.google_connection_id,
    notificationsEnabled: row.notifications_enabled,
    courses: Array.isArray(row.courses) ? (row.courses as CourseHub[]) : [],
    companionId: row.companion_id ?? "barnaby",
  };
}

export const getMyConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_configs")
      .select("display_name,canvas_feed_url,courses,notifications_enabled,onboarded,google_connection_id,companion_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      // Fallback if trigger hasn't run yet
      const { data: inserted, error: insErr } = await supabase
        .from("user_configs")
        .insert({ user_id: userId })
        .select("display_name,canvas_feed_url,courses,notifications_enabled,onboarded,google_connection_id,companion_id")
        .single();
      if (insErr) throw new Error(insErr.message);
      return rowToConfig(inserted);
    }
    return rowToConfig(data);
  });

export const updateMyConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => patchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: {
      onboarded?: boolean;
      display_name?: string;
      canvas_feed_url?: string;
      notifications_enabled?: boolean;
      courses?: CourseHub[];
      companion_id?: string;
    } = {};
    if (data.onboarded !== undefined) patch.onboarded = data.onboarded;
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    if (data.canvasFeedUrl !== undefined) patch.canvas_feed_url = data.canvasFeedUrl;
    if (data.notificationsEnabled !== undefined) patch.notifications_enabled = data.notificationsEnabled;
    if (data.courses !== undefined) patch.courses = data.courses;
    if (data.companionId !== undefined) patch.companion_id = data.companionId;

    const { data: row, error } = await supabase
      .from("user_configs")
      .update(patch)
      .eq("user_id", userId)
      .select("display_name,canvas_feed_url,courses,notifications_enabled,onboarded,google_connection_id,companion_id")
      .single();
    if (error) throw new Error(error.message);
    return rowToConfig(row);
  });
