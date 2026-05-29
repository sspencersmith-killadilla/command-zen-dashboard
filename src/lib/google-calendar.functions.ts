import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  signState,
  buildAuthUrl,
  buildRedirectUri,
  deleteTokens,
  insertCalendarEvent,
} from "./google-calendar.server";

/** Build the Google OAuth authorization URL for the current user. */
export const startGoogleCalendarConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const req = getRequest();
    const origin = new URL(req.url).origin;
    const state = signState(context.userId);
    const url = buildAuthUrl({ state, redirectUri: buildRedirectUri(origin) });
    return { authorizationUrl: url };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await deleteTokens(context.userId);
    return { ok: true };
  });

const eventSchema = z.object({
  summary: z.string().min(1).max(500),
  description: z.string().max(8000).optional(),
  startISO: z.string().min(1).max(40),
  endISO: z.string().min(1).max(40),
  timeZone: z.string().max(64).optional(),
});

export const createCalendarReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => eventSchema.parse(input))
  .handler(async ({ data, context }) => {
    return insertCalendarEvent(context.userId, data);
  });
