import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ChevronDown,
  Lock,
  Palette,
} from "lucide-react";
import {
  useWinstonConfig,
  tierFor,
  type AlertTier,
} from "@/lib/winston-store";
import { fetchCanvasAssignments } from "@/lib/canvas.functions";
import { GamificationPanel } from "@/components/GamificationPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { useGamification, rankFor, DAILY_QUESTS } from "@/lib/gamification";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { COMPANION_LIST, getCompanion, THEMES, type ThemeId } from "@/lib/companions";
import { useAvatar } from "@/lib/use-avatar";
import { Shirt } from "lucide-react";
import { useConsequences, PERFECT_DAY_XP } from "@/lib/consequences";
import { toast } from "sonner";

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

const CLEARED_KEY = "winston.cleared-assignments.v1";
function loadCleared(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(CLEARED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function saveCleared(s: Set<string>) {
  try {
    localStorage.setItem(CLEARED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export function Dashboard() {
  const { cfg, update } = useWinstonConfig();
  const { state, completeQuest, todayQuestsDone, applyXpDelta } = useGamification();
  const playerLevel = rankFor(state.xp).level;
  const { recordOnTime, recordMastery } = useAvatar();
  const fetchCanvas = useServerFn(fetchCanvasAssignments);
  const currentCompanion = getCompanion(cfg.companionId);
  const currentThemeId = currentCompanion.theme;
  const currentTheme = THEMES.find((t) => t.id === currentThemeId)!;
  const themeCompanions = useMemo(
    () => COMPANION_LIST.filter((c) => c.theme === currentThemeId),
    [currentThemeId],
  );
  const [pendingTheme, setPendingTheme] = useState<ThemeId | null>(null);
  const pendingThemeMeta = pendingTheme ? THEMES.find((t) => t.id === pendingTheme) : null;
  const confirmThemeSwitch = () => {
    if (!pendingTheme) return;
    const first =
      COMPANION_LIST.filter((c) => c.theme === pendingTheme)
        .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
    if (first) update({ companionId: first.id });
    setPendingTheme(null);
  };


  const canvasKey = `${cfg.canvasApiToken ? "api" : "ics"}:${cfg.canvasDomain}:${cfg.canvasFeedUrl}`;
  const canvasQ = useQuery({
    queryKey: ["canvas-assignments", canvasKey],
    queryFn: () => fetchCanvas(),
    enabled: !!(cfg.canvasFeedUrl || (cfg.canvasApiToken && cfg.canvasDomain)),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const rawAssignments = canvasQ.data?.assignments ?? [];

  // Auto-credit XP when Canvas reports a submitted assignment we hadn't
  // previously seen as submitted. No self-reporting.
  const clearedRef = useRef<Set<string>>(loadCleared());
  useEffect(() => {
    const cleared = clearedRef.current;
    let credited = false;
    for (const a of rawAssignments) {
      if (a.submitted && !cleared.has(a.id)) {
        cleared.add(a.id);
        if (!credited) {
          completeQuest("clear-assignment");
          recordOnTime();
          credited = true;
        }
      }
    }
    if (credited) saveCleared(cleared);
  }, [rawAssignments, completeQuest, recordOnTime]);

  // Soft consequences: penalty/refund tracking, mood, perfect-day, tarnish.
  const consequenceItems = useMemo(
    () =>
      rawAssignments.map((a) => ({
        id: a.id,
        dueAt: new Date(a.dueAt),
        submitted: a.submitted,
      })),
    [rawAssignments],
  );
  const consequences = useConsequences({
    assignments: consequenceItems,
    onXpDelta: applyXpDelta,
  });

  // Theme mastery: when all 5 daily quests are done for the current theme,
  // record one arc-complete day. Fires once per day per theme via a localStorage flag.
  useEffect(() => {
    if (todayQuestsDone.length < DAILY_QUESTS.length) return;
    if (typeof window === "undefined") return;
    const key = `winston.mastery.${currentThemeId}.${new Date().toISOString().slice(0, 10)}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    recordMastery(currentThemeId);
  }, [todayQuestsDone.length, currentThemeId, recordMastery]);

  const assignments = useMemo(() => {
    return rawAssignments
      .filter((a) => !a.submitted) // hide submitted from the live task list
      .map((a) => ({
        id: a.id,
        title: a.title,
        courseCode: a.courseCode,
        dueAt: new Date(a.dueAt),
        htmlUrl: a.htmlUrl,
        files: a.files ?? [],
      }))
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  }, [rawAssignments]);

  const recentlySubmitted = useMemo(
    () => rawAssignments.filter((a) => a.submitted).slice(0, 5),
    [rawAssignments],
  );

  const canvasError = (cfg.canvasFeedUrl || (cfg.canvasApiToken && cfg.canvasDomain))
    ? canvasQ.data?.error ?? (canvasQ.error instanceof Error ? canvasQ.error.message : null)
    : null;
  const canvasConfigured = !!(cfg.canvasFeedUrl || (cfg.canvasApiToken && cfg.canvasDomain));

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
          <div className="flex items-center gap-2">
            {consequences.pastDueCount > 0 && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                title={`${consequences.pastDueCount} past-due item${consequences.pastDueCount === 1 ? "" : "s"} · -${20 * consequences.pastDueCount} XP applied, +10 XP refunded on submit`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Past due: {consequences.pastDueCount}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card hover:bg-muted/40 hover:border-border pl-1 pr-3 py-1 transition-colors"
                  aria-label="Switch companion"
                >
                  <CompanionAvatar companionId={currentCompanion.id} size="sm" mood={consequences.mood} />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Companion</div>
                    <div className="text-sm font-semibold">{currentCompanion.name}</div>
                    {consequences.flavor.companionNote && (
                      <div className="text-[10px] italic text-amber-600 dark:text-amber-400 max-w-[16ch] truncate">
                        {consequences.flavor.companionNote}
                      </div>
                    )}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Switch companion</span>
                  <span className="text-[10px] font-normal text-muted-foreground">Lv {playerLevel}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themeCompanions.map((c) => {
                  const unlocked = playerLevel >= c.unlockLevel || c.id === cfg.companionId;
                  const isSel = c.id === cfg.companionId;
                  return (
                    <DropdownMenuItem
                      key={c.id}
                      disabled={!unlocked}
                      onSelect={() => unlocked && update({ companionId: c.id })}
                      className="flex items-center gap-2.5 py-2"
                    >
                      <div className={unlocked ? "" : "grayscale opacity-60"}>
                        <CompanionAvatar companionId={c.id} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          {c.name}
                          {isSel && <Check className="h-3 w-3 text-primary" />}
                          {!unlocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {unlocked ? c.tagline : `Unlocks at Level ${c.unlockLevel}`}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                  Want a different vibe? Use <span className="font-medium text-foreground">Theme</span> to switch worlds.
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card hover:bg-muted/40 hover:border-border px-3 py-1.5 transition-colors"
                  aria-label="Switch theme"
                >
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="text-left leading-tight">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Theme</div>
                    <div className="text-sm font-semibold">{currentTheme.label}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-[60vh] overflow-y-auto">
                <DropdownMenuLabel>Switch theme</DropdownMenuLabel>
                <div className="px-2 pb-2 text-[11px] text-muted-foreground">
                  Changes the whole world: visuals, daily goals, and your companion roster.
                </div>
                <DropdownMenuSeparator />
                {THEMES.map((t) => {
                  const isSel = t.id === currentThemeId;
                  return (
                    <DropdownMenuItem
                      key={t.id}
                      onSelect={(e) => {
                        e.preventDefault();
                        if (!isSel) setPendingTheme(t.id);
                      }}
                      className="flex items-start gap-2 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          {t.label}
                          {isSel && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{t.blurb}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/locker"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
              aria-label="Locker"
            >
              <Shirt className="h-4 w-4" />
              <span className="hidden sm:inline">Locker</span>
            </Link>

            <Link to="/plan" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
              <CalendarClock className="h-4 w-4" />
              <span className="hidden md:inline">Plan</span>
            </Link>
            <Link to="/focus" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden md:inline">Focus</span>
            </Link>

            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guide</span>
            </Link>



            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
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
                disabled={canvasQ.isFetching || !canvasConfigured}
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

          {!canvasConfigured ? (
            <EmptyState text="Connect Canvas in Settings — add your Canvas domain and access token to pull real assignments, with direct links and files." />
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
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {a.htmlUrl && (
                          <Button asChild variant="outline" size="sm">
                            <a href={a.htmlUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open in Canvas
                            </a>
                          </Button>
                        )}
                        {course && (
                          <Button asChild variant="outline" size="sm">
                            <a href={course.notebookUrl} target="_blank" rel="noopener noreferrer" onClick={() => completeQuest("open-notebook")}>
                              <ExternalLink className="h-3.5 w-3.5" />
                              Notebook
                            </a>
                          </Button>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1.5 rounded-md bg-muted/60 border border-border/60">
                          <RefreshCw className="h-3 w-3" />
                          Auto-clears when submitted in Canvas
                        </span>
                      </div>
                    </div>
                    {a.files.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/60">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                          Files from Canvas — click to download, then drag into NotebookLM
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {a.files.map((f) => (
                            <a
                              key={f.id}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-border bg-background hover:border-primary/40 hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {f.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
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
                      {a.htmlUrl && (
                        <a
                          href={a.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Open in Canvas"
                          title="Open in Canvas"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {course && (
                        <a
                          href={course.notebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => completeQuest("open-notebook")}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Open notebook"
                          title="Open notebook"
                        >
                          <BookOpen className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          {recentlySubmitted.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border/60">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                Recently submitted
              </div>
              <ul className="flex flex-wrap gap-2">
                {recentlySubmitted.map((a) => (
                  <li
                    key={a.id}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-foreground"
                    title={`${a.courseCode} — submitted in Canvas`}
                  >
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="max-w-[18ch] truncate">{a.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-5 text-xs text-muted-foreground">
            {cfg.canvasApiToken && cfg.canvasDomain
              ? "Live from the Canvas API — assignments clear automatically when you submit them. No manual check-offs."
              : "Live from your Canvas calendar feed. Add an access token in Settings so submitted assignments auto-clear."}
          </p>
        </Card>

        {/* Chat with your companion — featured */}
        <div className="mb-6">
          <ChatPanel />
        </div>

        {/* Perfect-Day bonus — locked while anything is past due */}
        <Card
          className="p-5 mb-6 border-border/60 flex items-center justify-between gap-4 flex-wrap"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                consequences.perfectDayLocked
                  ? "bg-muted text-muted-foreground"
                  : consequences.perfectDayClaimed
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/15 text-primary"
              }`}
            >
              {consequences.perfectDayLocked ? (
                <Lock className="h-5 w-5" />
              ) : consequences.perfectDayClaimed ? (
                <Check className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold leading-tight">
                Perfect Day Bonus{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  +{PERFECT_DAY_XP} XP
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {consequences.perfectDayLocked
                  ? `Locked — ${consequences.pastDueCount} past-due item${consequences.pastDueCount === 1 ? "" : "s"} blocking the bonus. Clear them to unlock.`
                  : consequences.perfectDayClaimed
                    ? "Claimed today. Streak protected — see you tomorrow."
                    : consequences.freezeAvailable
                      ? "Free for the taking. Streak freeze still available this week."
                      : "Free for the taking. (Streak freeze already used this week.)"}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant={consequences.canClaimPerfectDay ? "default" : "outline"}
            disabled={!consequences.canClaimPerfectDay}
            onClick={() => {
              if (consequences.claimPerfectDay()) {
                toast.success(`+${PERFECT_DAY_XP} XP — perfect day claimed`);
              }
            }}
          >
            {consequences.perfectDayClaimed
              ? "Claimed"
              : consequences.perfectDayLocked
                ? "Locked"
                : "Claim bonus"}
          </Button>
        </Card>

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

      <AlertDialog open={!!pendingTheme} onOpenChange={(o) => !o && setPendingTheme(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Switch theme to {pendingThemeMeta?.label}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This changes the whole world — visuals, daily goal storylines, and your
              companion roster. Your current companion <span className="font-medium text-foreground">{currentCompanion.name}</span> will be
              swapped for a starter from the new theme. XP and progress are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep {currentTheme.label}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmThemeSwitch}>
              Yes, switch theme
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
