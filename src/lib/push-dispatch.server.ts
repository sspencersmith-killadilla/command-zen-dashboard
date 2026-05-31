// Server-only web-push dispatcher. Runs in the TanStack worker runtime
// (nodejs_compat). NEVER import this from client code.

import webpush from "web-push";
import { VAPID_PUBLIC_KEY, type StoredSubscription } from "./notifications";

let configured = false;
function configure() {
  if (configured) return;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:notify@example.com";
  if (!priv) {
    throw new Error(
      "VAPID_PRIVATE_KEY is not configured — push cannot be sent until secrets are set.",
    );
  }
  webpush.setVapidDetails(subject, VAPID_PUBLIC_KEY, priv);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
};

export async function sendWebPushTo(
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<void> {
  configure();
  await webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    },
    JSON.stringify(payload),
    { TTL: 60 * 60 * 24 },
  );
}

// Returns an array of endpoints that returned 404/410 (gone) — callers
// should delete those subscriptions.
export async function sendWebPushToMany(
  subs: StoredSubscription[],
  payload: PushPayload,
): Promise<{ delivered: number; gone: string[] }> {
  configure();
  let delivered = 0;
  const gone: string[] = [];
  for (const s of subs) {
    try {
      await sendWebPushTo(s, payload);
      delivered++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) gone.push(s.endpoint);
      else console.error("push dispatch error", status, e);
    }
  }
  return { delivered, gone };
}
