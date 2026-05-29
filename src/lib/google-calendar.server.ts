/**
 * Server-only Google Calendar OAuth + API helpers.
 * Never import from client code.
 */
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events openid email profile";

export const OAUTH_CALLBACK_PATH = "/api/oauth/google-calendar/callback";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function stateSecret(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

/** Sign a state token containing the user id (expires in 10 min). */
export function signState(userId: string): string {
  const payload = {
    uid: userId,
    nonce: randomBytes(8).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + 600,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(createHmac("sha256", stateSecret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyState(state: string): { uid: string } {
  const parts = state.split(".");
  if (parts.length !== 2) throw new Error("Invalid state");
  const [body, sig] = parts;
  const expected = b64url(createHmac("sha256", stateSecret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Invalid state signature");
  const payload = JSON.parse(b64urlDecode(body).toString("utf8")) as {
    uid: string;
    exp: number;
  };
  if (!payload.uid) throw new Error("State missing uid");
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("State expired");
  return { uid: payload.uid };
}

export function buildRedirectUri(origin: string): string {
  return `${origin}${OAUTH_CALLBACK_PATH}`;
}

export function buildAuthUrl(opts: { state: string; redirectUri: string }): string {
  const params = new URLSearchParams({
    client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: opts.state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

export async function exchangeCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  return JSON.parse(text) as TokenResponse;
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  scope?: string;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

export async function persistTokens(userId: string, tokens: TokenResponse): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  // Upsert; if refresh_token is missing (re-consent without offline), keep existing
  const { data: existing } = await supabaseAdmin
    .from("google_calendar_tokens")
    .select("refresh_token")
    .eq("user_id", userId)
    .maybeSingle();
  const refreshToken = tokens.refresh_token ?? existing?.refresh_token;
  if (!refreshToken) {
    throw new Error("No refresh token returned by Google; re-consent required");
  }
  const { error } = await supabaseAdmin.from("google_calendar_tokens").upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      scope: tokens.scope,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Failed to persist tokens: ${error.message}`);

  // Mirror connection status onto user_configs so the UI can read it cheaply
  await supabaseAdmin
    .from("user_configs")
    .update({ google_connection_id: "oauth" })
    .eq("user_id", userId);
}

/** Returns a valid access token for the user, refreshing if needed. */
export async function getValidAccessToken(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("google_calendar_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Google Calendar not connected");

  const expiresAt = new Date(data.expires_at).getTime();
  // Refresh if less than 60s of life remaining
  if (Date.now() < expiresAt - 60_000) return data.access_token;

  const refreshed = await refreshAccessToken(data.refresh_token);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await supabaseAdmin
    .from("google_calendar_tokens")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
      ...(refreshed.scope ? { scope: refreshed.scope } : {}),
    })
    .eq("user_id", userId);
  return refreshed.access_token;
}

export async function deleteTokens(userId: string): Promise<void> {
  await supabaseAdmin.from("google_calendar_tokens").delete().eq("user_id", userId);
  await supabaseAdmin
    .from("user_configs")
    .update({ google_connection_id: null })
    .eq("user_id", userId);
}

export type CalendarEventInput = {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  timeZone?: string;
};

export async function insertCalendarEvent(
  userId: string,
  input: CalendarEventInput,
): Promise<{ id: string; htmlLink: string }> {
  const token = await getValidAccessToken(userId);
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startISO, timeZone: input.timeZone ?? "UTC" },
        end: { dateTime: input.endISO, timeZone: input.timeZone ?? "UTC" },
      }),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Calendar event create failed (${res.status}): ${text}`);
  const body = JSON.parse(text) as { id: string; htmlLink: string };
  return { id: body.id, htmlLink: body.htmlLink };
}
