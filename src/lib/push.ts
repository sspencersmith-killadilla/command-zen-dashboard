// Client-side helpers for browser push subscription.
// All of these are no-ops in preview iframes or on unsupported devices.

import { VAPID_PUBLIC_KEY, type StoredSubscription, isIOS, isStandalone } from "./notifications";

export type PushSupport =
  | { ok: true }
  | { ok: false; reason: string; hint?: string };

function isPreviewHost(): boolean {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return (
    h.includes("id-preview--") ||
    h.includes("lovableproject.com") ||
    h.endsWith(".lovable.app") === false && h !== "localhost"
      ? false
      : h.includes("id-preview--") || h.includes("lovableproject.com")
  );
}

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function checkPushSupport(): PushSupport {
  if (typeof window === "undefined")
    return { ok: false, reason: "Not running in a browser." };
  if (isInIframe())
    return {
      ok: false,
      reason: "Push doesn't work inside the preview iframe.",
      hint: "Open this app at its published URL in a normal browser tab to enable push.",
    };
  if (isPreviewHost())
    return {
      ok: false,
      reason: "Push only works on the published site, not the preview.",
      hint: "Open the published URL in a normal tab.",
    };
  if (!("serviceWorker" in navigator))
    return { ok: false, reason: "Your browser doesn't support service workers." };
  if (!("PushManager" in window))
    return { ok: false, reason: "Your browser doesn't support push notifications." };
  if (isIOS() && !isStandalone())
    return {
      ok: false,
      reason: "iOS Safari only allows push from installed web apps.",
      hint: "Tap the Share button → Add to Home Screen, then open from your home screen and try again.",
    };
  return { ok: true };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function arrayBufferToBase64Url(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

export async function subscribeForPush(): Promise<StoredSubscription> {
  const support = checkPushSupport();
  if (!support.ok) throw new Error(support.reason);

  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notification permission denied.");

  const reg = await registerServiceWorker();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });
  }
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  return {
    endpoint: json.endpoint ?? sub.endpoint,
    p256dh: json.keys?.p256dh ?? arrayBufferToBase64Url(sub.getKey("p256dh")),
    auth: json.keys?.auth ?? arrayBufferToBase64Url(sub.getKey("auth")),
  };
}

export async function unsubscribeFromPushLocally(): Promise<string | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  return endpoint;
}

export async function unregisterPreviewServiceWorkers(): Promise<void> {
  // Defensive: clean up any SW that might've registered in a preview/iframe.
  if (!("serviceWorker" in navigator)) return;
  if (!isInIframe() && !isPreviewHost()) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
}
