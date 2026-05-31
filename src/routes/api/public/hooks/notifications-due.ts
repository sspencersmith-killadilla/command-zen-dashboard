import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { fetchCanvasAssignmentsFromConfig } from "@/lib/canvas.server";
import { sendWebPushToMany } from "@/lib/push-dispatch.server";
import { dueDedupeKey, type StoredSubscription, type NotificationPrefs } from "@/lib/notifications";

export const Route = createFileRoute("/api/public/hooks/notifications-due")({
  server: {
    handlers: {
      POST: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          return new Response("Server not configured", { status: 500 });
        }
        const admin = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // Pull every user that opted into push.due (cron only delivers
        // push for now — in-app fires on-tab, email comes later).
        const { data: users, error } = await admin
          .from("user_configs")
          .select(
            "user_id,notification_prefs,canvas_feed_url,canvas_api_token,canvas_domain",
          );
        if (error) return new Response(error.message, { status: 500 });

        let totalDispatched = 0;
        let totalUsersScanned = 0;
        const now = Date.now();

        for (const row of users ?? []) {
          const prefs = (row.notification_prefs ?? {}) as Partial<NotificationPrefs>;
          if (!prefs.push?.due) continue;
          totalUsersScanned++;

          let assignments: { id: string; title: string; courseCode: string; dueAt: string; submitted?: boolean }[] = [];
          try {
            const res = await fetchCanvasAssignmentsFromConfig({
              apiToken: row.canvas_api_token ?? "",
              domain: row.canvas_domain ?? "",
              feedUrl: row.canvas_feed_url ?? "",
            });
            assignments = res.assignments;
          } catch {
            continue;
          }

          // Find tier crossings.
          const fires: { key: string; payload: { title: string; body: string; url: string; tag: string } }[] = [];
          for (const a of assignments) {
            if (a.submitted) continue;
            const dueAt = new Date(a.dueAt).getTime();
            const ms = dueAt - now;
            let tier: "24h" | "2h" | "now" | null = null;
            if (ms <= 0 && ms > -2 * 60 * 60 * 1000) tier = "now";
            else if (ms > 0 && ms <= 2 * 60 * 60 * 1000) tier = "2h";
            else if (ms > 2 * 60 * 60 * 1000 && ms <= 24 * 60 * 60 * 1000) tier = "24h";
            if (!tier) continue;
            fires.push({
              key: dueDedupeKey(a.id, tier),
              payload: {
                title:
                  tier === "now"
                    ? `Due now: ${a.title}`
                    : tier === "2h"
                      ? `Due in ~2 hours`
                      : `Due tomorrow`,
                body: `${a.title} (${a.courseCode}).`,
                url: "/",
                tag: a.id,
              },
            });
          }
          if (fires.length === 0) continue;

          // Dedupe via notification_log.
          const keys = fires.map((f) => f.key);
          const { data: existing } = await admin
            .from("notification_log")
            .select("dedupe_key")
            .eq("user_id", row.user_id)
            .eq("channel", "push")
            .in("dedupe_key", keys);
          const already = new Set((existing ?? []).map((r) => r.dedupe_key as string));
          const toFire = fires.filter((f) => !already.has(f.key));
          if (toFire.length === 0) continue;

          // Fetch this user's push subscriptions.
          const { data: subs } = await admin
            .from("push_subscriptions")
            .select("endpoint,p256dh,auth")
            .eq("user_id", row.user_id);
          if (!subs || subs.length === 0) continue;

          for (const f of toFire) {
            try {
              const { delivered, gone } = await sendWebPushToMany(
                subs as StoredSubscription[],
                f.payload,
              );
              if (gone.length) {
                await admin
                  .from("push_subscriptions")
                  .delete()
                  .eq("user_id", row.user_id)
                  .in("endpoint", gone);
              }
              await admin.from("notification_log").insert({
                user_id: row.user_id,
                dedupe_key: f.key,
                channel: "push",
                status: delivered > 0 ? "sent" : "failed",
                meta: { delivered },
              });
              if (delivered > 0) totalDispatched++;
            } catch (e) {
              console.error("dispatch failed", e);
            }
          }
        }

        return Response.json({
          ok: true,
          usersScanned: totalUsersScanned,
          dispatched: totalDispatched,
        });
      },
    },
  },
});
