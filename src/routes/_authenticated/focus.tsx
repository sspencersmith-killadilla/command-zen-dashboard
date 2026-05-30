import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, Timer, Play, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listRecentSessions, startFocusSession, endFocusSession } from "@/lib/focus.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/focus")({
  head: () => ({ meta: [{ title: "Focus — Command Center" }] }),
  validateSearch: (s) => z.object({ ref: z.string().optional() }).parse(s),
  component: FocusPage,
});

const KEY = ["focus-sessions"] as const;

function FocusPage() {
  const { ref: initialRef } = Route.useSearch();
  const qc = useQueryClient();
  const list = useServerFn(listRecentSessions);
  const startFn = useServerFn(startFocusSession);
  const endFn = useServerFn(endFocusSession);

  const q = useQuery({ queryKey: KEY, queryFn: () => list() });

  const [minutes, setMinutes] = useState(25);
  const [assignment, setAssignment] = useState(initialRef ?? "");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    tickRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [startedAt]);

  const elapsedSec = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const totalSec = minutes * 60;
  const remainSec = Math.max(0, totalSec - elapsedSec);
  const mm = String(Math.floor(remainSec / 60)).padStart(2, "0");
  const ss = String(remainSec % 60).padStart(2, "0");

  const startMut = useMutation({
    mutationFn: () => startFn({ data: { planned_minutes: minutes, assignment_ref: assignment || undefined } }),
    onSuccess: (row) => { setSessionId(row.id); setStartedAt(Date.now()); },
  });
  const endMut = useMutation({
    mutationFn: (completed: boolean) =>
      endFn({ data: { id: sessionId!, actual_minutes: Math.round(elapsedSec / 60), completed } }),
    onSuccess: () => {
      setSessionId(null); setStartedAt(null);
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Session logged");
    },
  });

  useEffect(() => {
    if (sessionId && remainSec === 0 && startedAt) {
      endMut.mutate(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainSec, sessionId, startedAt]);

  const completedToday = (q.data ?? []).filter((s) =>
    s.completed && new Date(s.started_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="font-semibold flex items-center gap-2"><Timer className="h-4 w-4" /> Focus</div>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <Card className="p-8 text-center">
          <div className="text-7xl font-mono font-semibold tabular-nums tracking-tight">{mm}:{ss}</div>
          <div className="text-sm text-muted-foreground mt-2">{completedToday} session{completedToday === 1 ? "" : "s"} today</div>
          {!sessionId ? (
            <div className="mt-6 space-y-3">
              <div className="flex gap-2 max-w-md mx-auto">
                <Input placeholder="What are you working on?" value={assignment} onChange={(e) => setAssignment(e.target.value)} />
                <Input type="number" min={5} max={180} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-24" />
              </div>
              <Button size="lg" onClick={() => startMut.mutate()} disabled={startMut.isPending}>
                <Play className="h-4 w-4 mr-1.5" /> Start
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="lg" className="mt-6" onClick={() => endMut.mutate(false)}>
              <Square className="h-4 w-4 mr-1.5" /> End early
            </Button>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Recent sessions</h3>
          {q.isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : (q.data ?? []).length === 0 ? (
            <div className="text-muted-foreground text-sm">No sessions yet.</div>
          ) : (
            <ul className="text-sm space-y-1">
              {(q.data ?? []).slice(0, 10).map((s) => (
                <li key={s.id} className="flex justify-between border-b border-border/40 py-1.5">
                  <span className="truncate flex-1">{s.assignment_ref ?? "Focus session"}</span>
                  <span className="text-muted-foreground ml-2">
                    {s.actual_minutes ?? s.planned_minutes}m · {s.completed ? "✓" : "·"} · {new Date(s.started_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
