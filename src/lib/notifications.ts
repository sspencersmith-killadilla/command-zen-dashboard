// Shared notification types + helpers — safe for both client and server bundles.

export type NotifChannel = "inapp" | "push" | "email";
export type NotifTrigger = "due" | "daily";

export type ChannelToggles = {
  due: boolean;
  daily: boolean;
};

export type NotificationPrefs = {
  inapp: ChannelToggles;
  push: ChannelToggles;
  email: ChannelToggles;
  dailyCheckInTime: string; // "HH:MM" 24h, local to user's `timezone`
};

export const DEFAULT_PREFS: NotificationPrefs = {
  inapp: { due: false, daily: false },
  push: { due: false, daily: false },
  email: { due: false, daily: false },
  dailyCheckInTime: "17:00",
};

// Public VAPID key — safe in the client bundle. Pairs with the secret
// VAPID_PRIVATE_KEY held on the server.
export const VAPID_PUBLIC_KEY =
  "BBu-ccsOYQYNortveTOB2Gt_3HEIcQdFlAwh4TB_uuap5bogxk5I9ddY8_maxJlk2RtjiLErbAuKfyTZb9qr1l4";

export function dueDedupeKey(assignmentId: string, tier: "24h" | "2h" | "now") {
  return `due:${assignmentId}:${tier}`;
}

export function dailyDedupeKey(dateISO: string) {
  return `daily:${dateISO}`;
}

// Convert a Web Push API subscription to the rows we store.
export type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
