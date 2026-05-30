import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Droplet, Moon, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRecentWellness, upsertWellnessLog } from "@/lib/wellness.functions";

export const Route = createFileRoute("/_authenticated/wellness")({
  head: () => ({ meta: [{ title: "Wellness — Command Center" }] }),
  component: WellnessPage,
});

const KEY = ["wellness"] as const;
const today = () => new Date().toISOString().slice(0, 10);

function WellnessPage() {
  const qc = useQueryClient();
  const list = useServerFn(getRecentWellness);
  const upsert = useServerFn(upsertWellnessLog);
  const q = useQuery({ queryKey: KEY, queryFn: () => list() });

  const todayLog = (q.data ?? []).find((l) => l.log_date === today());

  const [sleep, setSleep] = useState<number>(todayLog?.sleep_hours ?? 8);
  const [water, setWater] = useState<number>(todayLog?.water_cups ?? 0);
  const [movement, setMovement] = useState<number>(todayLog?.movement_minutes ?? 0);
  const [mood, setMood] = useState<number>(todayLog?.mood ?? 3);

  useEffect(() => {
    if (todayLog) {
      setSleep(todayLog.sleep_hours ?? 8);
      setWater(todayLog.water_cups ?? 0);
      setMovement(todayLog.movement_minutes ?? 0);
      setMood(todayLog.mood ?? 3);
    }
  }, [todayLog]);

  const save = useMutation({
    mutationFn: (patch: Partial<{ sleep_hours: number; water_cups: number; movement_minutes: number; mood: number }>) =>
      upsert({ data: { log_date: today(), ...patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const streak = (() => {
    const dates = new Set((q.data ?? []).map((l) => l.log_date));
    let n = 0;
    const d = new Date();
    while (dates.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4" /> Wellness</div>
          <div className="text-sm text-muted-foreground">{streak}d streak</div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Moon className="h-4 w-4" /> Sleep last night</h3>
          <div className="flex items-center gap-3">
            <Input type="number" step={0.5} min={0} max={14} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="w-24" />
            <span className="text-sm text-muted-foreground">hours · target 7–9h</span>
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => save.mutate({ sleep_hours: sleep })}>Save</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Droplet className="h-4 w-4" /> Hydration · {water}/8 cups</h3>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                onClick={() => { const v = i < water ? i : i + 1; setWater(v); save.mutate({ water_cups: v }); }}
                className={`h-9 w-9 rounded border ${i < water ? "bg-blue-500 border-blue-500" : "bg-card border-border"}`}
                aria-label={`Cup ${i + 1}`}
              />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Movement today</h3>
          <div className="flex items-center gap-3">
            <Input type="number" min={0} max={600} step={5} value={movement} onChange={(e) => setMovement(Number(e.target.value))} className="w-24" />
            <span className="text-sm text-muted-foreground">minutes · target 20–30m</span>
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => save.mutate({ movement_minutes: movement })}>Save</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Mood</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => { setMood(n); save.mutate({ mood: n }); }}
                className={`h-10 w-10 rounded-full border text-lg ${mood === n ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}
              >
                {["😞", "😕", "😐", "🙂", "😄"][n - 1]}
              </button>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
