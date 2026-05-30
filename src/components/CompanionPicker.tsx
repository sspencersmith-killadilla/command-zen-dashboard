import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { COMPANIONS, useCompanions, type CompanionId } from "@/lib/companions";
import { Check, Sparkles } from "lucide-react";

/**
 * Full-screen picker shown when the user hasn't selected a companion yet.
 * Pick one of five to start the journey. The others can be earned later.
 */
export function CompanionPicker({ onChosen }: { onChosen?: (id: CompanionId) => void }) {
  const { choose } = useCompanions();
  const [hover, setHover] = useState<CompanionId | null>(null);
  const [selected, setSelected] = useState<CompanionId | null>(null);

  const focus = selected ?? hover ?? "barnaby";
  const focusCompanion = COMPANIONS.find((c) => c.id === focus)!;

  function confirm() {
    if (!selected) return;
    choose(selected);
    onChosen?.(selected);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-primary font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Choose your companion
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Pick who starts your journey.
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            One companion joins you today. The other four are earned as you level up.
          </p>
        </div>

        <Card
          className="p-6 md:p-8 border-border/60 mb-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <CompanionAvatar id={focusCompanion.id} size="xl" />
            <div className="text-center md:text-left flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                {focusCompanion.species}
              </div>
              <h2 className="text-2xl font-bold mt-0.5">{focusCompanion.name}</h2>
              <p className="text-muted-foreground mt-1">{focusCompanion.tagline}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {COMPANIONS.map((c) => {
              const isSelected = selected === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelected(c.id)}
                  className={`relative group rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border/60 hover:border-border bg-muted/30 hover:bg-muted/60"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <CompanionAvatar id={c.id} size="md" animate={isSelected || hover === c.id} />
                  <div className="text-center">
                    <div className="text-sm font-semibold leading-tight">{c.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {c.species}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            You can swap to any unlocked companion later from Settings.
          </p>
          <Button size="lg" onClick={confirm} disabled={!selected} className="gap-1.5">
            {selected ? `Begin with ${COMPANIONS.find((c) => c.id === selected)!.name}` : "Pick one to continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
