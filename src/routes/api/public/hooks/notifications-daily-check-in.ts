import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { sendWebPushToMany } from "@/lib/push-dispatch.server";
import { dailyDedupeKey, type StoredSubscription, type NotificationPrefs } from "@/lib/notifications";

// Compute the user's current local time-of-day given their IANA timezone.
function localHHMM(tz: string, now = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const h = parts.find((p) => p.type === "hour")?.value ?? "00";
    const m = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${h}:${m}`;
  } catch {
    return now.toISOString().slice(11, 16);
  }
}

function localDateISO(tz: string, now = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(now); // YYYY-MM-DD
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

export const Route = createFileRoute("/api/public/hooks/notifications-daily-check-in")({
  server: {
    handlers: {
      POST: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return new Response("Server not configured", { status: 500 });
        const admin = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: users, error } = await admin
          .from("user_configs")
          .select("user_id,notification_prefs,timezone");
        if (error) return new Response(error.message, { status: 500 });

        const now = new Date();
        let dispatched = 0;

        for (const row of users ?? []) {
          const prefs = (row.notification_prefs ?? {}) as Partial<NotificationPrefs>;
          if (!prefs.push?.daily) continue;
          const tz = row.timezone || "UTC";
          const localTime = localHHMM(tz, now);
          const target = prefs.dailyCheckInTime ?? "17:00";
          // Fire if within the current 15-minute window of their target time.
          const [th, tm] = target.split(":").map(Number);
          const [lh, lm] = localTime.split(":").map(Number);
          const targetMins = th * 60 + tm;
          const localMins = lh * 60 + lm;
          const diff = Math.abs(localMins - targetMins);
          if (diff > 15 && diff < 24 * 60 - 15) continue;

          const key = dailyDedupeKey(localDateISO(tz, now));
          const { data: existing } = await admin
            .from("notification_log")
            .select("id")
            .eq("user_id", row.user_id)
            .eq("channel", "push")
            .eq("dedupe_key", key)
            .maybeSingle();
          if (existing) continue;

          const { data: subs } = await admin
            .from("push_subscriptions")
            .select("endpoint,p256dh,auth")
            .eq("user_id", row.user_id);
          if (!subs || subs.length === 0) continue;

          try {
            const { delivered, gone } = await sendWebPushToMany(
              subs as StoredSubscription[],
              {
                title: "Your daily check-in",
                body: "Take a minute — what can you clear before the day ends?",
                url: "/",
                tag: "daily-check-in",
              },
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
              dedupe_key: key,
              channel: "push",
              status: delivered > 0 ? "sent" : "failed",
              meta: { delivered },
            });
            if (delivered > 0) dispatched++;
          } catch (e) {
            console.error("daily dispatch failed", e);
          }
        }

        return Response.json({ ok: true, dispatched });
      },
    },
  },
});
