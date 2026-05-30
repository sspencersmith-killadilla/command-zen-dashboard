import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CourseHub = { id: string; name: string; notebookUrl: string };

export type WinstonConfig = {
  onboarded: boolean;
  displayName: string;
  canvasFeedUrl: string;
  canvasApiToken: string;
  canvasDomain: string;
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
  canvasApiToken: z.string().max(512).optional(),
  canvasDomain: z.string().max(255).optional(),
  notificationsEnabled: z.boolean().optional(),
  courses: z.array(courseSchema).max(50).optional(),
  companionId: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/).optional(),
});

type Row = {
  display_name: string;
  canvas_feed_url: string;
  canvas_api_token: string | null;
  canvas_domain: string | null;
  courses: unknown;
  notifications_enabled: boolean;
  onboarded: boolean;
  google_connection_id: string | null;
  companion_id: string | null;
};

const SELECT =
  "display_name,canvas_feed_url,canvas_api_token,canvas_domain,courses,notifications_enabled,onboarded,google_connection_id,companion_id";

function rowToConfig(row: Row): WinstonConfig {
  return {
    onboarded: row.onboarded,
    displayName: row.display_name ?? "",
    canvasFeedUrl: row.canvas_feed_url ?? "",
    canvasApiToken: row.canvas_api_token ?? "",
    canvasDomain: row.canvas_domain ?? "",
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
      .select(SELECT)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      const { data: inserted, error: insErr } = await supabase
        .from("user_configs")
        .insert({ user_id: userId })
        .select(SELECT)
        .single();
      if (insErr) throw new Error(insErr.message);
      return rowToConfig(inserted as Row);
    }
    return rowToConfig(data as Row);
  });

export const updateMyConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => patchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: Record<string, unknown> = {};
    if (data.onboarded !== undefined) patch.onboarded = data.onboarded;
    if (data.displayName !== undefined) patch.display_name = data.displayName;
    if (data.canvasFeedUrl !== undefined) patch.canvas_feed_url = data.canvasFeedUrl;
    if (data.canvasApiToken !== undefined) patch.canvas_api_token = data.canvasApiToken;
    if (data.canvasDomain !== undefined) patch.canvas_domain = data.canvasDomain;
    if (data.notificationsEnabled !== undefined) patch.notifications_enabled = data.notificationsEnabled;
    if (data.courses !== undefined) patch.courses = data.courses;
    if (data.companionId !== undefined) patch.companion_id = data.companionId;

    const { data: row, error } = await supabase
      .from("user_configs")
      .update(patch)
      .eq("user_id", userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return rowToConfig(row as Row);
  });
