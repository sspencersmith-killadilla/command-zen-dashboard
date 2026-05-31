import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getParentSharePayload } from "@/lib/parent.functions";

export const Route = createFileRoute("/p/$token")({
  head: () => ({
    meta: [
      { title: "Weekly check-in" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ParentSharePage,
});

function ParentSharePage() {
  const { token } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["parent-share", token],
    queryFn: () => getParentSharePayload({ data: { token } }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!data || data.status !== "ok") {
    return <ExpiredView reason={data?.status ?? "not_found"} />;
  }

  const { payload, parentName } = data;
  const dot =
    payload.status === "green"
      ? "bg-emerald-500"
      : payload.status === "yellow"
        ? "bg-amber-500"
        : "bg-rose-500";
  const ring =
    payload.status === "green"
      ? "ring-emerald-500/30"
      : payload.status === "yellow"
        ? "ring-amber-500/30"
        : "ring-rose-500/30";

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <main className="max-w-xl mx-auto space-y-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Weekly check-in
          </p>
          <h1 className="text-2xl font-semibold">
            How {payload.studentName} is doing
          </h1>
          {parentName && (
            <p className="text-sm text-muted-foreground">
              Shared with {parentName} · week of{" "}
              {new Date(payload.weekOf).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </header>

        <Card className={`p-6 border-border/60 ring-1 ${ring}`}>
          <div className="flex items-center gap-4">
            <span
              className={`inline-block h-6 w-6 rounded-full ${dot} shadow-[0_0_24px_currentColor]`}
              aria-hidden
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                This week
              </div>
              <div className="text-lg font-semibold">{payload.statusLabel}</div>
            </div>
          </div>

          {typeof payload.streakDays === "number" && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="text-foreground font-medium tabular-nums">
                {payload.streakDays}
              </span>{" "}
              focused study session{payload.streakDays === 1 ? "" : "s"} logged
              this week.
            </p>
          )}
        </Card>

        {payload.note && (
          <Card className="p-5 border-border/60">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Note from {payload.studentName}
            </div>
            <p className="italic text-foreground/90 leading-relaxed">
              "{payload.note}"
            </p>
          </Card>
        )}

        <Card className="p-5 border-border/60 bg-muted/30">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            How to help
          </div>
          <p className="text-sm leading-relaxed">{payload.tip}</p>
        </Card>

        <footer className="pt-4 text-xs text-muted-foreground space-y-1 leading-relaxed">
          <p>
            Shared with {payload.studentName}'s consent. They control what you
            see and can stop sharing at any time.
          </p>
          <p>
            This page only shows a weekly status — never assignment names,
            grades, messages, or app activity.
          </p>
          <p>
            Generated{" "}
            {new Date(payload.generatedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            .
          </p>
        </footer>
      </main>
    </div>
  );
}

function ExpiredView({
  reason,
}: {
  reason: "not_found" | "expired" | "revoked";
}) {
  const msg =
    reason === "expired"
      ? "This link has expired. Your student will send you a fresh one with their next weekly check-in."
      : reason === "revoked"
        ? "This sharing connection has been turned off. Reach out to your student directly."
        : "This link isn't valid. Double-check the URL from the most recent email.";
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <main className="max-w-md mx-auto">
        <Card className="p-8 border-border/60 text-center space-y-3">
          <h1 className="text-xl font-semibold">Nothing to show here</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{msg}</p>
        </Card>
      </main>
    </div>
  );
}

// Silence unused import warning in some toolchains
void notFound;
