import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DEFAULT_PREFS,
  type NotificationPrefs,
  type StoredSubscription,
} from "./notifications";
import { sendWebPushTo } from "./push-dispatch.server";

const togglesSchema = z.object({
  due: z.boolean(),
  daily: z.boolean(),
});

const prefsSchema = z.object({
  inapp: togglesSchema.optional(),
  push: togglesSchema.optional(),
  email: togglesSchema.optional(),
  dailyCheckInTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  timezone: z.string().max(64).optional(),
});

function rowToPrefs(raw: unknown): NotificationPrefs {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<NotificationPrefs>;
  return {
    inapp: { ...DEFAULT_PREFS.inapp, ...(r.inapp ?? {}) },
    push: { ...DEFAULT_PREFS.push, ...(r.push ?? {}) },
    email: { ...DEFAULT_PREFS.email, ...(r.email ?? {}) },
    dailyCheckInTime: r.dailyCheckInTime ?? DEFAULT_PREFS.dailyCheckInTime,
  };
}

export const getNotificationPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_configs")
      .select("notification_prefs,timezone")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const { count } = await supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      prefs: rowToPrefs(data?.notification_prefs),
      timezone: data?.timezone ?? "UTC",
      pushDeviceCount: count ?? 0,
    };
  });

export const updateNotificationPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => prefsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Merge patch into existing prefs to avoid clobbering other channels.
    const { data: existing } = await supabase
      .from("user_configs")
      .select("notification_prefs")
      .eq("user_id", userId)
      .maybeSingle();
    const current = rowToPrefs(existing?.notification_prefs);
    const next: NotificationPrefs = {
      inapp: { ...current.inapp, ...(data.inapp ?? {}) },
      push: { ...current.push, ...(data.push ?? {}) },
      email: { ...current.email, ...(data.email ?? {}) },
      dailyCheckInTime: data.dailyCheckInTime ?? current.dailyCheckInTime,
    };
    const patch: { notification_prefs: NotificationPrefs; timezone?: string } = {
      notification_prefs: next,
    };
    if (data.timezone) patch.timezone = data.timezone;
    const { error } = await supabase
      .from("user_configs")
      .update(patch)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { prefs: next };
  });

const subSchema = z.object({
  endpoint: z.string().url().max(2048),
  p256dh: z.string().min(1).max(512),
  auth: z.string().min(1).max(512),
  userAgent: z.string().max(512).optional(),
  timezone: z.string().max(64).optional(),
});

export const registerPushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => subSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          user_agent: data.userAgent ?? null,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" },
      );
    if (error) throw new Error(error.message);
    if (data.timezone) {
      await supabase
        .from("user_configs")
        .update({ timezone: data.timezone })
        .eq("user_id", userId);
    }
    return { ok: true };
  });

export const unregisterPushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ endpoint: z.string().url().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const q = supabase.from("push_subscriptions").delete().eq("user_id", userId);
    if (data.endpoint) q.eq("endpoint", data.endpoint);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const testSchema = z.object({
  channel: z.enum(["inapp", "push", "email"]),
});

export const sendTestNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => testSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    if (data.channel === "inapp") {
      // The client toasts directly — server just acknowledges.
      return { ok: true, delivered: 1 };
    }
    if (data.channel === "push") {
      const { data: subs, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint,p256dh,auth")
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      if (!subs || subs.length === 0)
        throw new Error("No push device registered. Enable push on this device first.");
      let delivered = 0;
      for (const s of subs as StoredSubscription[]) {
        try {
          await sendWebPushTo(s, {
            title: "Test notification",
            body: "Push is working on this device.",
            url: "/",
            tag: "test",
          });
          delivered++;
        } catch (e) {
          console.error("push test failed", e);
        }
      }
      return { ok: true, delivered };
    }
    if (data.channel === "email") {
      // Email channel not yet wired — feature-flag a friendly error.
      const email = (claims?.email as string | undefined) ?? "";
      if (!email) throw new Error("No email on file for this account.");
      throw new Error(
        "Email channel is coming next — your sender domain needs to be set up first.",
      );
    }
    return { ok: false, delivered: 0 };
  });
