import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvatar } from "@/lib/use-avatar";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { STEPPER_OPTIONS, type AvatarParts } from "@/lib/cosmetics";

export const Route = createFileRoute("/_authenticated/avatar")({
  head: () => ({ meta: [{ title: "Avatar Builder — Command Center" }] }),
  component: AvatarPage,
});

const ROWS: { key: keyof AvatarParts; label: string }[] = [
  { key: "body_type",   label: "Body" },
  { key: "skin_tone",   label: "Skin" },
  { key: "hair_style",  label: "Hair style" },
  { key: "hair_color",  label: "Hair color" },
  { key: "eye_style",   label: "Eyes" },
  { key: "brow_style",  label: "Brows" },
  { key: "mouth_style", label: "Mouth" },
  { key: "outfit_base", label: "Outfit" },
  { key: "background",  label: "Background" },
];

function AvatarPage() {
  const { state, updateParts } = useAvatar();

  function cycle(key: keyof AvatarParts, dir: 1 | -1) {
    const opts = STEPPER_OPTIONS[key];
    const cur = opts.findIndex((o) => o.id === (state as AvatarParts)[key]);
    const next = (cur + dir + opts.length) % opts.length;
    updateParts({ [key]: opts[next].id } as Partial<AvatarParts>);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="font-semibold">Avatar Builder</h1>
          <Link to="/locker" className="text-sm text-muted-foreground hover:text-foreground">Locker →</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-[200px_1fr]">
        <Card className="p-4 border-border/60 flex items-center justify-center">
          <PlayerAvatar parts={state} equipped={state.equipped} size="xl" />
        </Card>

        <Card className="p-6 border-border/60 space-y-3">
          <div>
            <h2 className="font-semibold text-lg">Build your character</h2>
            <p className="text-sm text-muted-foreground">
              Changes save automatically. Earn hats, jackets, pins, and frames by clearing assignments on time.
            </p>
          </div>
          <div className="space-y-2">
            {ROWS.map(({ key, label }) => {
              const opts = STEPPER_OPTIONS[key];
              const cur = opts.find((o) => o.id === (state as AvatarParts)[key]);
              return (
                <div key={key} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
                  <div className="text-sm font-medium w-28 text-muted-foreground">{label}</div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => cycle(key, -1)} aria-label="Previous">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium w-24 text-center tabular-nums">
                      {cur?.label ?? "—"}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => cycle(key, 1)} aria-label="Next">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              <Check className="inline h-3 w-3 mr-1 text-primary" />
              Saved automatically
            </p>
            <Link to="/locker">
              <Button size="sm">Open Locker</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
