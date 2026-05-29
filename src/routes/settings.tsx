import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, RotateCcw, CloudUpload } from "lucide-react";
import { useWinstonConfig, saveConfig } from "@/lib/winston-store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Command Center" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { cfg, update } = useWinstonConfig();
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

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

  function resetAll() {
    if (!confirm("Reset your Command Center? This clears all saved config.")) return;
    saveConfig({
      onboarded: false,
      displayName: "",
      canvasFeedUrl: "",
      googleConnected: false,
      notificationsEnabled: false,
      courses: [],
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="font-semibold">Settings</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <Card className="p-6 space-y-4 border-border/60">
          <div>
            <h2 className="font-semibold text-lg">Your name</h2>
            <p className="text-sm text-muted-foreground">Used for your dashboard greeting.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={cfg.displayName}
              onChange={(e) => update({ displayName: e.target.value })}
              placeholder="e.g. Winston"
            />
          </div>
        </Card>

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
          <Row
            title="Google Calendar"
            subtitle="Powers intelligent alert scheduling."
            checked={cfg.googleConnected}
            onChange={(v) => update({ googleConnected: v })}
          />
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

        {/* Cross-device sync walkthrough */}
        <Card className="p-6 space-y-4 border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CloudUpload className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Sync across devices</h2>
              <p className="text-sm text-muted-foreground">
                Optional. Right now your config lives only in this browser — laptop and phone each need their own setup.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground space-y-3">
            <p>
              To sync your name, Canvas feed, and notebooks between your phone and laptop, connect a free
              <span className="font-medium text-foreground"> Supabase </span>
              backend. It stores your config in the cloud and signs you in on any device.
            </p>

            <div>
              <p className="font-medium text-foreground mb-1.5">Walkthrough:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline text-primary">supabase.com</a> and create a free account.
                </li>
                <li>
                  Click <span className="font-medium">New project</span>. Pick a name (e.g. "command-center"), set a database password (save it somewhere), and choose the closest region.
                </li>
                <li>
                  Wait ~1 minute for it to provision. When it's ready, open <span className="font-medium">Project Settings → API</span>.
                </li>
                <li>
                  Copy two values: the <span className="font-medium">Project URL</span> and the <span className="font-medium">anon / public key</span>.
                </li>
                <li>
                  Back in your Command Center project, ask Lovable: <span className="italic">"connect this Supabase project: &lt;URL&gt; and &lt;anon key&gt;, and sync my config + sign-in across devices."</span>
                </li>
                <li>
                  Lovable will scaffold a <code className="text-xs bg-background px-1 py-0.5 rounded">user_configs</code> table, add Google sign-in, and migrate your current localStorage data on first login.
                </li>
              </ol>
            </div>

            <p className="text-xs">
              Easier alternative: ask Lovable to <span className="font-medium text-foreground">"enable Lovable Cloud"</span> — same result, no Supabase account needed. We held off so you keep full ownership of the database.
            </p>
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <Button variant="ghost" onClick={resetAll} className="text-destructive hover:text-destructive">
            <RotateCcw className="h-4 w-4 mr-1.5" /> Reset & re-run onboarding
          </Button>
        </Card>
      </main>
    </div>
  );
}

function Row({ title, subtitle, checked, onChange }: { title: string; subtitle: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
