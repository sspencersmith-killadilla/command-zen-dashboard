import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, RotateCcw, LogOut, Check, Calendar } from "lucide-react";
import { useWinstonConfig } from "@/lib/winston-store";
import { configQueryKey } from "@/lib/winston-store";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  startGoogleCalendarConnect,
  disconnectGoogleCalendar,
} from "@/lib/google-calendar.functions";
import { toast } from "sonner";
import { z } from "zod";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { COMPANION_LIST, THEMES, getCompanion, type ThemeId } from "@/lib/companions";

const searchSchema = z.object({
  gcal: z.enum(["connected", "error"]).optional(),
  reason: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Command Center" }] }),
  validateSearch: searchSchema,
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const { cfg, update } = useWinstonConfig();
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const connectFn = useServerFn(startGoogleCalendarConnect);
  const disconnectFn = useServerFn(disconnectGoogleCalendar);

  useEffect(() => {
    if (search.gcal === "connected") {
      toast.success("Google Calendar connected");
      qc.invalidateQueries({ queryKey: configQueryKey });
      navigate({ to: "/settings", search: {}, replace: true });
    } else if (search.gcal === "error") {
      toast.error(`Google Calendar failed${search.reason ? `: ${search.reason}` : ""}`);
      navigate({ to: "/settings", search: {}, replace: true });
    }
  }, [search.gcal, search.reason, navigate, qc]);

  async function connectGoogle() {
    setConnecting(true);
    try {
      const { authorizationUrl } = await connectFn();
      window.location.href = authorizationUrl;
    } catch (e) {
      setConnecting(false);
      toast.error(e instanceof Error ? e.message : "Failed to start OAuth");
    }
  }

  async function disconnectGoogle() {
    if (!confirm("Disconnect Google Calendar? You can reconnect anytime.")) return;
    try {
      await disconnectFn();
      toast.success("Google Calendar disconnected");
      qc.invalidateQueries({ queryKey: configQueryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to disconnect");
    }
  }

  function addCourse() {
    if (!draftName.trim() || !draftUrl.trim()) return;
    update({
      courses: [
        ...cfg.courses,
        { id: crypto.randomUUID(), name: draftName.trim(), notebookUrl: draftUrl.trim() },
      ],
    });
    setDraftName("");
    setDraftUrl("");
  }

  async function resetOnboarding() {
    if (!confirm("Re-run onboarding? Your saved settings stay; you'll just walk through the wizard again.")) return;
    update({ onboarded: false });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }



  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="font-semibold">Settings</h1>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <Card className="p-6 space-y-4 border-border/60">
          <div>
            <h2 className="font-semibold text-lg">Your name</h2>
            <p className="text-sm text-muted-foreground">Used for your dashboard greeting. Synced across your devices.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={cfg.displayName}
              onChange={(e) => update({ displayName: e.target.value })}
              placeholder="e.g. Barnaby"
            />
          </div>
        </Card>

        <CompanionPicker
          selectedId={cfg.companionId}
          onSelect={(id) => update({ companionId: id })}
        />

        <Card className="p-6 space-y-4 border-border/60">
          <div>
            <h2 className="font-semibold text-lg">Canvas feed</h2>
            <p className="text-sm text-muted-foreground">Update this each new semester.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="canvas">Canvas Calendar Feed URL</Label>
            <Input
              id="canvas"
              value={cfg.canvasFeedUrl}
              onChange={(e) => update({ canvasFeedUrl: e.target.value })}
              placeholder="https://canvas.../feeds/calendars/...ics"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4 border-border/60">
          <h2 className="font-semibold text-lg">Integrations</h2>
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${cfg.googleConnected ? "bg-accent" : "bg-muted"}`}>
                {cfg.googleConnected ? (
                  <Check className="h-5 w-5 text-accent-foreground" />
                ) : (
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-sm text-muted-foreground">
                  {cfg.googleConnected
                    ? "Reminders will be written to your primary Google Calendar."
                    : "Connect to write reminders to your Google Calendar."}
                </div>
              </div>
            </div>
            {cfg.googleConnected ? (
              <Button variant="outline" size="sm" onClick={disconnectGoogle}>
                Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={connectGoogle} disabled={connecting}>
                {connecting ? "Redirecting…" : "Connect"}
              </Button>
            )}
          </div>
          <Row
            title="Push / SMS alerts"
            subtitle="Tiered reminders via Twilio / FCM."
            checked={cfg.notificationsEnabled}
            onChange={(v) => update({ notificationsEnabled: v })}
          />
        </Card>

        <Card className="p-6 space-y-4 border-border/60">
          <div>
            <h2 className="font-semibold text-lg">NotebookLM hubs</h2>
            <p className="text-sm text-muted-foreground">One per class.</p>
          </div>

          <div className="space-y-2">
            {cfg.courses.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No classes yet.</p>
            )}
            {cfg.courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-8 w-8 rounded-md bg-accent/30 flex items-center justify-center text-xs font-medium">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.notebookUrl}</div>
                </div>
                <button
                  type="button"
                  onClick={() => update({ courses: cfg.courses.filter((x) => x.id !== c.id) })}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Input placeholder="Class name (e.g. CS 374)" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            <Input placeholder="NotebookLM URL" value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} />
          </div>
          <Button onClick={addCourse} variant="secondary" disabled={!draftName.trim() || !draftUrl.trim()}>
            <Plus className="h-4 w-4 mr-1.5" /> Add class
          </Button>
        </Card>

        <Card className="p-6 border-border/60">
          <Button variant="ghost" onClick={resetOnboarding} className="text-muted-foreground">
            <RotateCcw className="h-4 w-4 mr-1.5" /> Re-run onboarding
          </Button>
        </Card>
      </main>
    </div>
  );
}

function Row({ title, subtitle, checked, onChange, disabled }: { title: string; subtitle: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function CompanionPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = getCompanion(selectedId);
  const [activeTheme, setActiveTheme] = useState<ThemeId>(selected.theme);
  const visible = COMPANION_LIST.filter((c) => c.theme === activeTheme);
  const activeMeta = THEMES.find((t) => t.id === activeTheme)!;

  return (
    <Card className="p-6 space-y-4 border-border/60">
      <div>
        <h2 className="font-semibold text-lg">Your companion</h2>
        <p className="text-sm text-muted-foreground">
          Pick a theme, then the voice you want in your corner. Switch anytime.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => {
          const isActive = t.id === activeTheme;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTheme(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground -mt-1">{activeMeta.blurb}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((c) => {
          const isSelected = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
              }`}
            >
              <CompanionAvatar companionId={c.id} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-medium flex items-center gap-2">
                  {c.name}
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="text-xs text-muted-foreground">{c.species}</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.tagline}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

