import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type WeeklyRecap = {
  id: string;
  weekOf: string;
  summary: {
    chatCount: number;
    focusMinutes: number;
    focusSessions: number;
    flashcardReps: number;
    blocksCompleted: number;
    headline: string;
    mondayFocus: string;
  };
  viewedAt: string | null;
  xpAwarded: number;
};

function mondayISO(d = new Date()): string {
  const day = d.getUTCDay() || 7;
  const m = new Date(d);
  m.setUTCDate(m.getUTCDate() - day + 1);
  return m.toISOString().slice(0, 10);
}

export const getOrCreateThisWeekRecap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WeeklyRecap | null> => {
    const { supabase, userId } = context;
    const weekOf = mondayISO();
    const weekStart = new Date(`${weekOf}T00:00:00Z`).toISOString();

    const { data: existing } = await supabase
      .from("weekly_recaps")
      .select("*")
      .eq("user_id", userId)
      .eq("week_of", weekOf)
      .maybeSingle();
    if (existing) {
      return {
        id: existing.id,
        weekOf: existing.week_of,
        summary: (existing.summary as WeeklyRecap["summary"]) ?? {
          chatCount: 0, focusMinutes: 0, focusSessions: 0,
          flashcardReps: 0, blocksCompleted: 0,
          headline: "Quiet week.", mondayFocus: "Pick your single biggest task.",
        },
        viewedAt: existing.viewed_at,
        xpAwarded: existing.xp_awarded,
      };
    }

    // Only generate on Sunday afternoon or later in the week
    const dow = new Date().getUTCDay();
    if (dow !== 0 && dow !== 1) return null;

    const [chats, sessions, cards, blocks] = await Promise.all([
      supabase.from("chat_messages").select("id", { count: "exact", head: true })
        .eq("user_id", userId).gte("created_at", weekStart),
      supabase.from("focus_sessions").select("actual_minutes,completed")
        .eq("user_id", userId).gte("started_at", weekStart),
      supabase.from("flashcard_cards").select("id", { count: "exact", head: true })
        .eq("user_id", userId).gte("last_reviewed_at", weekStart),
      supabase.from("study_blocks").select("id", { count: "exact", head: true })
        .eq("user_id", userId).gte("completed_at", weekStart),
    ]);

    const focusSessions = (sessions.data ?? []).filter((s) => s.completed).length;
    const focusMinutes = (sessions.data ?? []).reduce(
      (acc, s) => acc + (s.actual_minutes ?? 0), 0
    );

    const summary: WeeklyRecap["summary"] = {
      chatCount: chats.count ?? 0,
      focusMinutes,
      focusSessions,
      flashcardReps: cards.count ?? 0,
      blocksCompleted: blocks.count ?? 0,
      headline:
        focusSessions > 5
          ? "You actually showed up this week."
          : focusSessions > 0
            ? "Solid effort. Room to push next week."
            : "Quiet week. Reset on Monday.",
      mondayFocus:
        "Pick the single biggest thing on your plate Monday morning. Start it before noon.",
    };

    const { data: created, error } = await supabase
      .from("weekly_recaps")
      .insert({ user_id: userId, week_of: weekOf, summary })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: created.id,
      weekOf: created.week_of,
      summary: created.summary as WeeklyRecap["summary"],
      viewedAt: created.viewed_at,
      xpAwarded: created.xp_awarded,
    };
  });

export const markRecapViewed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("weekly_recaps")
      .update({ viewed_at: new Date().toISOString(), xp_awarded: 50 })
      .eq("user_id", userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
