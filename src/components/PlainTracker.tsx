import { Card } from "@/components/ui/card";
import { Check, Flame } from "lucide-react";
import { useGamification, DAILY_QUESTS } from "@/lib/gamification";

const PLAIN_STEP_LABELS: Record<string, string> = {
  "check-timeline": "Review your upcoming assignments",
  "open-notebook": "Open a class notebook",
  "copy-prompt": "Ask the assistant for today's plan",
  "chat-winston": "Send a message to the assistant",
  "clear-assignment": "Submit an assignment in Canvas",
};

/**
 * Plain-mode daily tracker. No themes, no XP, no companion language —
 * just the concrete actions that auto-check off as you do them, plus
 * the on-time streak. Uses the site's semantic tokens.
 */
export function PlainTracker() {
  const { state, todayQuestsDone } = useGamification();
  const done = todayQuestsDone.length;
  const total = DAILY_QUESTS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <Card className="p-6 border-border/60" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-lg leading-tight">Today's tracker</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            These check off automatically as you do them. Nothing to claim.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold tabular-nums">{state.streak}</span>
            <span className="text-muted-foreground">
              day{state.streak === 1 ? "" : "s"} on-time
            </span>
          </div>
          <div className="text-muted-foreground tabular-nums">
            {done}/{total} done
          </div>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {DAILY_QUESTS.map((q) => {
          const isDone = todayQuestsDone.includes(q.id);
          const label = PLAIN_STEP_LABELS[q.id] ?? q.label;
          return (
            <li
              key={q.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/60 bg-card"
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                  isDone
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background"
                }`}
              >
                {isDone && <Check className="h-3 w-3" />}
              </span>
              <span
                className={`text-sm ${
                  isDone ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
