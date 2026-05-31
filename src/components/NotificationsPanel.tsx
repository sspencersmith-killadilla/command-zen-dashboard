import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Smartphone, Mail, Send, Loader2, AlertCircle } from "lucide-react";
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  registerPushSubscription,
  unregisterPushSubscription,
  sendTestNotification,
} from "@/lib/notifications.functions";
import {
  checkPushSupport,
  subscribeForPush,
  unsubscribeFromPushLocally,
} from "@/lib/push";
import type { NotificationPrefs } from "@/lib/notifications";

const prefsKey = ["notification-prefs"];

function timeOptions() {
  const out: { value: string; label: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const value = `${hh}:${mm}`;
      const h12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? "AM" : "PM";
      out.push({ value, label: `${h12}:${mm} ${ampm}` });
    }
  }
  return out;
}
const TIME_OPTIONS = timeOptions();

export function NotificationsPanel() {
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getNotificationPrefs);
  const savePrefs = useServerFn(updateNotificationPrefs);
  const registerSub = useServerFn(registerPushSubscription);
  const unregisterSub = useServerFn(unregisterPushSubscription);
  const test = useServerFn(sendTestNotification);

  const { data } = useQuery({
    queryKey: prefsKey,
    queryFn: () => fetchPrefs(),
  });

  const [pushBusy, setPushBusy] = useState(false);
  const [pushNote, setPushNote] = useState<string | null>(null);
  const pushSupport = typeof window !== "undefined" ? checkPushSupport() : { ok: true as const };

  useEffect(() => {
    if (!pushSupport.ok) setPushNote(pushSupport.reason);
  }, [pushSupport]);

  const prefsMut = useMutation({
    mutationFn: (patch: Partial<NotificationPrefs> & { timezone?: string }) =>
      savePrefs({ data: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: prefsKey }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  const testMut = useMutation({
    mutationFn: (channel: "inapp" | "push" | "email") => test({ data: { channel } }),
    onSuccess: (res, channel) => {
      if (channel === "inapp") {
        toast("Test in-app notification", {
          description: "This is what an in-app reminder looks like.",
        });
      } else {
        toast.success(`Test sent (${res.delivered} device${res.delivered === 1 ? "" : "s"}).`);
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!data) return null;
  const prefs = data.prefs;
  const hasPushDevice = data.pushDeviceCount > 0;

  async function enablePush() {
    setPushBusy(true);
    setPushNote(null);
    try {
      const sub = await subscribeForPush();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      await registerSub({
        data: {
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
          userAgent: navigator.userAgent.slice(0, 500),
          timezone: tz,
        },
      });
      toast.success("Push enabled on this device.");
      qc.invalidateQueries({ queryKey: prefsKey });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to enable push";
      setPushNote(msg);
      toast.error(msg);
    } finally {
      setPushBusy(false);
    }
  }

  async function disablePushHere() {
    setPushBusy(true);
    try {
      const endpoint = await unsubscribeFromPushLocally();
      await unregisterSub({ data: endpoint ? { endpoint } : {} });
      toast.success("Push disabled on this device.");
      qc.invalidateQueries({ queryKey: prefsKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setPushBusy(false);
    }
  }

  function setToggle(
    channel: "inapp" | "push" | "email",
    trigger: "due" | "daily",
    v: boolean,
  ) {
    prefsMut.mutate({ [channel]: { ...prefs[channel], [trigger]: v } } as Partial<NotificationPrefs>);
  }

  return (
    <Card className="p-6 space-y-5 border-border/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            All off by default. Pick the channel and trigger you actually want — you
            can mix and match.
          </p>
        </div>
      </div>

      {/* In-app */}
      <Section
        icon={<Bell className="h-3.5 w-3.5" />}
        title="In-app"
        subtitle="Toasts while the tab is open. Works everywhere, no setup."
      >
        <ToggleRow
          label="Assignment due reminders (24h, 2h, at-due)"
          checked={prefs.inapp.due}
          onChange={(v) => setToggle("inapp", "due", v)}
        />
        <ToggleRow
          label="Daily check-in"
          checked={prefs.inapp.daily}
          onChange={(v) => setToggle("inapp", "daily", v)}
        />
        <TestRow channel="inapp" onTest={() => testMut.mutate("inapp")} />
      </Section>

      {/* Push */}
      <Section
        icon={<Smartphone className="h-3.5 w-3.5" />}
        title="Browser push (OS-level)"
        subtitle="Works on desktop Chrome / Firefox / Edge and Android. On iPhone you have to 'Add to Home Screen' first. Push only fires from the published site, not the preview."
      >
        {pushSupport.ok ? (
          hasPushDevice ? (
            <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs">
              <span className="text-emerald-700 dark:text-emerald-300">
                ✓ Push enabled on {data.pushDeviceCount} device
                {data.pushDeviceCount === 1 ? "" : "s"}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={pushBusy}
                onClick={disablePushHere}
              >
                Disable on this device
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={enablePush} disabled={pushBusy}>
              {pushBusy ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Smartphone className="h-3.5 w-3.5 mr-1.5" />
              )}
              Enable push on this device
            </Button>
          )
        ) : (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              {pushSupport.reason}
            </div>
            {pushSupport.hint && (
              <p className="text-muted-foreground">{pushSupport.hint}</p>
            )}
          </div>
        )}
        <ToggleRow
          label="Assignment due reminders"
          checked={prefs.push.due}
          onChange={(v) => setToggle("push", "due", v)}
          disabled={!hasPushDevice}
        />
        <ToggleRow
          label="Daily check-in"
          checked={prefs.push.daily}
          onChange={(v) => setToggle("push", "daily", v)}
          disabled={!hasPushDevice}
        />
        {pushNote && hasPushDevice && (
          <p className="text-xs text-muted-foreground">{pushNote}</p>
        )}
        {hasPushDevice && (
          <TestRow channel="push" onTest={() => testMut.mutate("push")} />
        )}
      </Section>

      {/* Email */}
      <Section
        icon={<Mail className="h-3.5 w-3.5" />}
        title="Email digest"
        subtitle="Reliable cross-device. Sender domain setup required — coming next."
      >
        <ToggleRow
          label="Weekly due-reminder digest"
          checked={prefs.email.due}
          onChange={(v) => setToggle("email", "due", v)}
          disabled
        />
        <ToggleRow
          label="Daily check-in email"
          checked={prefs.email.daily}
          onChange={(v) => setToggle("email", "daily", v)}
          disabled
        />
        <p className="text-xs text-muted-foreground">
          Email toggles unlock once you've set up a sender domain in Cloud → Emails.
        </p>
      </Section>

      {/* Daily check-in time */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <Label>Daily check-in time</Label>
        <div className="flex items-center gap-3">
          <Select
            value={prefs.dailyCheckInTime}
            onValueChange={(v) => prefsMut.mutate({ dailyCheckInTime: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            Your time zone: <span className="text-foreground">{data.timezone}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-border/60 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {title}
      </div>
      <p className="text-xs text-muted-foreground -mt-0.5">{subtitle}</p>
      <div className="space-y-1.5 pt-1">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className={`text-sm ${disabled ? "text-muted-foreground" : ""}`}>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function TestRow({
  channel,
  onTest,
}: {
  channel: "inapp" | "push";
  onTest: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTest}
      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 pt-1"
    >
      <Send className="h-3 w-3" />
      Send a test {channel === "inapp" ? "in-app notification" : "push"}
    </button>
  );
}
