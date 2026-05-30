import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Check, Trash2, Sparkles, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listStudyBlocks,
  createStudyBlock,
  updateStudyBlock,
  deleteStudyBlock,
  autoGenerateBlocks,
  type StudyBlock,
} from "@/lib/planner.functions";
import { fetchCanvasAssignments } from "@/lib/canvas.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({ meta: [{ title: "Study Planner — Command Center" }] }),
  component: PlanPage,
});

const KEY = ["study-blocks"] as const;

function PlanPage() {
  const qc = useQueryClient();
  const list = useServerFn(listStudyBlocks);
  const create = useServerFn(createStudyBlock);
  const update = useServerFn(updateStudyBlock);
  const remove = useServerFn(deleteStudyBlock);
  const auto = useServerFn(autoGenerateBlocks);
  const fetchCanvas = useServerFn(fetchCanvasAssignments);

  const q = useQuery({ queryKey: KEY, queryFn: () => list() });
  const blocks = q.data ?? [];

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("16:00");
  const [duration, setDuration] = useState(60);

  const createMut = useMutation({
    mutationFn: () => {
      const start = new Date(`${date}T${time}:00`);
      const end = new Date(start.getTime() + duration * 60_000);
      return create({
        data: {
          title,
          notes: notes || undefined,
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
        },
      });
    },
    onSuccess: () => {
      setTitle("");
      setNotes("");
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Block scheduled");
    },
  });

  const toggleMut = useMutation({
    mutationFn: (b: StudyBlock) => update({ data: { id: b.id, completed: !b.completed_at } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const autoMut = useMutation({
    mutationFn: async () => {
      const res = await fetchCanvas();
      const assignments = (res.assignments ?? []).filter((a) => !a.submitted).slice(0, 20);
      return auto({ data: { assignments: assignments.map((a) => ({ id: a.id, title: a.title, courseCode: a.courseCode, dueAt: a.dueAt })) } });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(res.created > 0 ? `Scheduled ${res.created} study block${res.created === 1 ? "" : "s"}` : "Nothing new to schedule");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Group by day
  const byDay = new Map<string, StudyBlock[]>();
  for (const b of blocks) {
    const key = new Date(b.starts_at).toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(b);
  }
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Study Planner</div>
          <div className="w-20" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-lg">Add a study block</h2>
              <p className="text-sm text-muted-foreground">Block out time on your calendar. Auto-generate from Canvas due dates.</p>
            </div>
            <Button variant="outline" onClick={() => autoMut.mutate()} disabled={autoMut.isPending}>
              <Sparkles className="h-4 w-4 mr-1.5" /> Auto-schedule
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="What are you studying?" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <Input type="number" min={5} max={240} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-24" />
            </div>
          </div>
          <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-3" rows={2} />
          <Button className="mt-3" onClick={() => createMut.mutate()} disabled={!title || createMut.isPending}>
            <Plus className="h-4 w-4 mr-1.5" /> Add block
          </Button>
        </Card>

        {q.isLoading ? (
          <Card className="p-10 text-center text-muted-foreground">Loading…</Card>
        ) : days.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">No blocks yet. Add one above or auto-schedule from Canvas.</Card>
        ) : (
          days.map(([day, items]) => (
            <Card key={day} className="p-5">
              <div className="text-sm font-semibold mb-3">
                {new Date(day + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </div>
              <div className="space-y-2">
                {items.map((b) => {
                  const start = new Date(b.starts_at);
                  const end = new Date(b.ends_at);
                  const done = !!b.completed_at;
                  return (
                    <div key={b.id} className={`flex items-center gap-3 p-3 rounded-md border ${done ? "bg-muted/40 opacity-70" : "bg-card"}`}>
                      <button
                        onClick={() => toggleMut.mutate(b)}
                        className={`h-6 w-6 rounded border flex items-center justify-center ${done ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                        aria-label="Mark complete"
                      >
                        {done && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${done ? "line-through" : ""}`}>{b.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – {end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          {b.course_id && ` · ${b.course_id}`}
                          {b.source === "auto" && " · auto"}
                        </div>
                      </div>
                      <button onClick={() => delMut.mutate(b.id)} className="text-muted-foreground hover:text-destructive p-1.5" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
