import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchCanvasAssignmentsFromConfig, type CanvasFile } from "./canvas.server";

export type CanvasAssignment = {
  id: string;
  title: string;
  courseCode: string;
  dueAt: string;
  htmlUrl?: string;
  files?: CanvasFile[];
  submitted?: boolean;
  pointsPossible?: number | null;
};

export const fetchCanvasAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ assignments: CanvasAssignment[]; error: string | null }> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_configs")
      .select("canvas_feed_url,canvas_api_token,canvas_domain")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { assignments: [], error: error.message };
    return fetchCanvasAssignmentsFromConfig({
      apiToken: data?.canvas_api_token ?? "",
      domain: data?.canvas_domain ?? "",
      feedUrl: data?.canvas_feed_url ?? "",
    });
  });
