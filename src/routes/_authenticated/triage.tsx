import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Inbox, Calculator, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchCanvasAssignments } from "@/lib/canvas.functions";

export const Route = createFileRoute("/_authenticated/triage")({
  head: () => ({ meta: [{ title: "Triage — Command Center" }] }),
  component: TriagePage,
});

function risk(daysToDue: number): "red" | "amber" | "green" {
  if (daysToDue <= 1) return "red";
  if (daysToDue <= 4) return "amber";
  return "green";
}
const COLORS = {
  red: "border-l-red-500 bg-red-500/5",
  amber: "border-l-amber-500 bg-amber-500/5",
  green: "border-l-emerald-500 bg-emerald-500/5",
};

function TriagePage() {
  const fetchCanvas = useServerFn(fetchCanvasAssignments);
  const q = useQuery({ queryKey: ["canvas-triage"], queryFn: () => fetchCanvas() });

  const ranked = useMemo(() => {
    const items = (q.data?.assignments ?? []).filter((a) => !a.submitted);
    return items
      .map((a) => {
        const due = new Date(a.dueAt);
        const days = (due.getTime() - Date.now()) / 86_400_000;
        // Urgency rises sharply as due date approaches
        const urgency = days <= 0 ? 100 : Math.max(1, 30 / (days + 1));
        const score = urgency * 1;
        return { ...a, due, days, score, level: risk(days) };
      })
      .sort((a, b) => b.score - a.score);
  }, [q.data]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="font-semibold flex items-center gap-2"><Inbox className="h-4 w-4" /> Assignment Triage</div>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <GradeForecaster />

        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-1">Ranked inbox</h2>
          <p className="text-sm text-muted-foreground mb-4">Most urgent first. Tap to open in Canvas.</p>
          {q.isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading…</div>
          ) : ranked.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Inbox zero. Nice.</div>
          ) : (
            <ul className="space-y-2">
              {ranked.map((a) => (
                <li key={a.id} className={`border-l-4 rounded-md p-3 flex items-start justify-between gap-3 ${COLORS[a.level]}`}>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.courseCode} · {a.days <= 0 ? `${Math.round(-a.days)}d overdue` : a.days < 1 ? "Due today" : `Due in ${Math.round(a.days)}d`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/focus" search={{ ref: a.title }} className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90">
                      Start focus
                    </Link>
                    {a.htmlUrl && (
                      <a href={a.htmlUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}

function GradeForecaster() {
  const [current, setCurrent] = useState(85);
  const [finalWeight, setFinalWeight] = useState(30);
  const [target, setTarget] = useState(90);

  const needed = useMemo(() => {
    const w = finalWeight / 100;
    if (w <= 0) return null;
    const x = (target - current * (1 - w)) / w;
    return Math.round(x * 10) / 10;
  }, [current, finalWeight, target]);

  const verdict =
    needed === null ? "—" :
    needed > 100 ? "Impossible — talk to your prof / aim lower." :
    needed < 0 ? "You've already got it locked in." :
    `Score ${needed}% on the final.`;

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Calculator className="h-4 w-4" /> What do I need on the final?</h2>
      <p className="text-sm text-muted-foreground mb-4">Quick per-class projection.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Current grade (%)
          <Input type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))} className="mt-1" />
        </label>
        <label className="text-sm">
          Final weight (%)
          <Input type="number" value={finalWeight} onChange={(e) => setFinalWeight(Number(e.target.value))} className="mt-1" />
        </label>
        <label className="text-sm">
          Target grade (%)
          <Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="mt-1" />
        </label>
      </div>
      <div className="mt-4 p-3 rounded-md bg-muted/40 text-sm font-medium">{verdict}</div>
    </Card>
  );
}
