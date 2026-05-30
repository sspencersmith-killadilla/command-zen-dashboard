import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchCanvasAssignmentsFromUrl } from "./canvas.server";

export type CanvasAssignment = {
  id: string;
  title: string;
  courseCode: string;
  dueAt: string;
};

export const fetchCanvasAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ assignments: CanvasAssignment[]; error: string | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_configs")
      .select("canvas_feed_url")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { assignments: [], error: error.message };
    return fetchCanvasAssignmentsFromUrl(data?.canvas_feed_url?.trim() ?? "");
  });
