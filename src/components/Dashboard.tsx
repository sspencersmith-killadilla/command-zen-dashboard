import { useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CalendarClock,
  BookOpen,
  Check,
  ExternalLink,
  Settings,
  Bell,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  useWinstonConfig,
  tierFor,
  type AlertTier,
} from "@/lib/winston-store";
import { fetchCanvasAssignments } from "@/lib/canvas.functions";
import { GamificationPanel } from "@/components/GamificationPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { useGamification } from "@/lib/gamification";

const TIER_LABEL: Record<AlertTier, string> = {
  horizon: "On the Horizon",
  incoming: "Incoming",
  focus: "Focus Time",
};
const TIER_CLASS: Record<AlertTier, string> = {
  horizon: "bg-horizon/15 text-horizon-foreground border-horizon/30",
  incoming: "bg-incoming/15 border-incoming/30",
  focus: "bg-focus/15 border-focus/40",
};
const TIER_DOT: Record<AlertTier, string> = {
  horizon: "bg-horizon",
  incoming: "bg-incoming",
  focus: "bg-focus",
};

function fmtDue(d: Date) {
  const days = Math.round((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${-days}d overdue`;
  return `in ${days}d`;
}

export function Dashboard() {
  const { cfg, update } = useWinstonConfig();
  const { completeQuest } = useGamification();
  const fetchCanvas = useServerFn(fetchCanvasAssignments);

  const canvasQ = useQuery({
    queryKey: ["canvas-assignments", cfg.canvasFeedUrl],
    queryFn: () => fetchCanvas(),
    enabled: !!cfg.canvasFeedUrl,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const assignments = useMemo(() => {
    const raw = canvasQ.data?.assignments ?? [];
    return raw
      .map((a) => ({ id: a.id, title: a.title, courseCode: a.courseCode, dueAt: new Date(a.dueAt) }))
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  }, [canvasQ.data]);

  const canvasError = cfg.canvasFeedUrl ? canvasQ.data?.error ?? (canvasQ.error instanceof Error ? canvasQ.error.message : null) : null;

  useEffect(() => {
    const t = setTimeout(() => completeQuest("check-timeline"), 1200);
    return () => clearTimeout(t);
  }, [completeQuest]);

  function matchCourse(courseCode: string) {
    if (!courseCode) return undefined;
    const code = courseCode.toLowerCase();
    return cfg.courses.find(
      (c) => c.name.toLowerCase() === code || code.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(code),
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[image:var(--gradient-hero)] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {(cfg.displayName || "Your").trim()}{(cfg.displayName || "Your").trim().endsWith("s") ? "'" : "'s"}
              </div>
              <div className="font-semibold leading-tight">Command Center</div>
            </div>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Good day{cfg.displayName ? `, ${cfg.displayName}` : ""}.
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Mission briefing below. Clear quests, stack XP.
          </p>
        </div>

        {/* HERO: Upcoming assignments — front and center */}
        <Card
          className="p-6 md:p-7 mb-6 border-border/60 relative overflow-hidden"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                  Mission Briefing
                </div>
                <h2 className="font-bold text-2xl leading-tight">Up Next</h2>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => canvasQ.refetch()}
                disabled={canvasQ.isFetching || !cfg.canvasFeedUrl}
                className="inline-flex items-center gap-1.5 hover:text-foreground disabled:opacity-50"
                aria-label="Refresh Canvas"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${canvasQ.isFetching ? "animate-spin" : ""}`} />
                {canvasQ.isFetching ? "Syncing…" : "Refresh"}
              </button>
              <span className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5" />
                Alerts
                <Switch
                  checked={cfg.notificationsEnabled}
                  onCheckedChange={(v) => update({ notificationsEnabled: v })}
                />
              </span>
            </div>
          </div>

          {canvasError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Canvas sync failed</div>
                <div className="text-xs opacity-80">{canvasError}</div>
              </div>
            </div>
          )}

          {!cfg.canvasFeedUrl ? (
            <EmptyState text="Paste your Canvas Calendar Feed URL in Settings to import real assignments." />
          ) : assignments.length === 0 ? (
            <EmptyState text={canvasQ.isLoading ? "Loading assignments from Canvas…" : "No upcoming assignments in the next 60 days."} />
          ) : (
            <>
              {(() => {
                const a = assignments[0];
                const tier = tierFor(a.dueAt);
                const course = matchCourse(a.courseCode);
                return (
                  <div
                    className="rounded-2xl border-2 p-5 mb-4 relative overflow-hidden bg-muted/40"
                    style={{ borderColor: "color-mix(in oklab, var(--primary) 35%, transparent)" }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`h-2 w-2 rounded-full ${TIER_DOT[tier]}`} />
                          <span className={`text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-0.5 rounded border ${TIER_CLASS[tier]}`}>
                            {TIER_LABEL[tier]}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            · due {fmtDue(a.dueAt)}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl md:text-2xl leading-tight text-foreground">
                          {a.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{a.courseCode}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {course && (
                          <Button asChild variant="outline" size="sm">
                            <a href={course.notebookUrl} target="_blank" rel="noopener noreferrer" onClick={() => completeQuest("open-notebook")}>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Notebook
                            </a>
                          </Button>
                        )}
                        <Button size="sm" onClick={() => completeQuest("clear-assignment")} className="gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          Clear (+40 XP)
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <ol className="space-y-2">
                {assignments.slice(1).map((a, i) => {
                  const tier = tierFor(a.dueAt);
                  const course = matchCourse(a.courseCode);
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl border border-border/60 hover:border-border bg-card hover:bg-muted/30 transition-colors animate-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${TIER_DOT[tier]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{a.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{a.courseCode}</div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${TIER_CLASS[tier]}`}>
                        {TIER_LABEL[tier]}
                      </span>
                      <div className="text-sm text-muted-foreground tabular-nums w-20 text-right">
                        {fmtDue(a.dueAt)}
                      </div>
                      {course && (
                        <a
                          href={course.notebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => completeQuest("open-notebook")}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Open notebook"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          <p className="mt-5 text-xs text-muted-foreground">
            Pulled live from your Canvas Calendar Feed. Tiered alerts: 2 weeks → 1 week → 2 days.
          </p>
        </Card>

        {/* Chat with your companion — featured */}
        <div className="mb-6">
          <ChatPanel />
        </div>

        {/* Gamification HUD */}
        <div className="mb-6">
          <GamificationPanel />
        </div>

        {/* Second Brain — full width now that Daily Reset lives in the chat */}
        <Card className="p-6 border-border/60" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-lg bg-accent/20 text-accent-foreground flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">My Second Brain</h2>
              <p className="text-xs text-muted-foreground">Quick-launch your class notebooks</p>
            </div>
          </div>

          {cfg.courses.length === 0 ? (
            <EmptyState text="No notebooks linked yet. Add one per class in Settings — name it with the same course code Canvas uses (e.g. CS 374) so assignments auto-link." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cfg.courses.map((c, i) => {
                const linked = assignments.filter((a) => a.courseCode === c.name).length;
                return (
                  <a
                    key={c.id}
                    href={c.notebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => completeQuest("open-notebook")}
                    className="group rounded-xl border border-border/60 p-4 hover:border-primary/40 hover:bg-muted/30 transition-all animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent-foreground">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="font-medium text-foreground truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {linked} linked assignment{linked === 1 ? "" : "s"}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
