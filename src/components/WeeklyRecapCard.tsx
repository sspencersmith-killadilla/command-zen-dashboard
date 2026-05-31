import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, X } from "lucide-react";
import { getOrCreateThisWeekRecap, markRecapViewed } from "@/lib/recap.functions";

export function WeeklyRecapCard({ awardXp }: { awardXp?: (delta: number) => void }) {
  const qc = useQueryClient();
  const fetchRecap = useServerFn(getOrCreateThisWeekRecap);
  const markViewed = useServerFn(markRecapViewed);

  const { data } = useQuery({
    queryKey: ["weekly-recap"],
    queryFn: () => fetchRecap(),
    staleTime: 60_000,
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => markViewed({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weekly-recap"] });
      awardXp?.(50);
    },
  });

  if (!data || data.viewedAt) return null;

  const { summary } = data;

  return (
    <Card className="p-5 mb-6 border-primary/30 bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">
            This week
          </div>
          <h3 className="font-semibold text-lg leading-tight mt-0.5">{summary.headline}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span><b className="text-foreground tabular-nums">{summary.focusSessions}</b> focus sessions</span>
            <span><b className="text-foreground tabular-nums">{summary.focusMinutes}</b> min focused</span>
            <span><b className="text-foreground tabular-nums">{summary.flashcardReps}</b> flashcards</span>
            <span><b className="text-foreground tabular-nums">{summary.blocksCompleted}</b> blocks done</span>
            <span><b className="text-foreground tabular-nums">{summary.chatCount}</b> chats</span>
          </div>
          <p className="mt-3 text-sm">
            <span className="font-semibold">Monday focus: </span>
            <span className="text-muted-foreground">{summary.mondayFocus}</span>
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => dismiss.mutate(data.id)}
          disabled={dismiss.isPending}
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
