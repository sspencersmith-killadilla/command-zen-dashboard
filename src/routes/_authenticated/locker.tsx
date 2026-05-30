import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvatar } from "@/lib/use-avatar";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { COSMETICS, type Slot } from "@/lib/cosmetics";

export const Route = createFileRoute("/_authenticated/locker")({
  head: () => ({ meta: [{ title: "Locker — Command Center" }] }),
  component: LockerPage,
});

const SLOTS: { id: Slot; label: string }[] = [
  { id: "hat", label: "Hats" },
  { id: "top", label: "Tops" },
  { id: "accessory", label: "Accessories" },
  { id: "frame", label: "Frames" },
];

function LockerPage() {
  const { state, equip } = useAvatar();
  const owned = new Set(state.inventory);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="font-semibold">Locker</h1>
          <Link to="/avatar" className="text-sm text-muted-foreground hover:text-foreground">Edit avatar →</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <Card className="p-6 border-border/60 flex items-center gap-6">
          <PlayerAvatar parts={state} equipped={state.equipped} size="xl" />
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Your character</h2>
            <p className="text-sm text-muted-foreground">
              You own {state.inventory.length} of {COSMETICS.length} items. Earn more by clearing
              assignments on time and mastering themes (5 full daily arcs in one theme = full set).
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              On-time progress: {state.on_time_count % 3}/3 toward next drop.
            </p>
          </div>
        </Card>

        {SLOTS.map(({ id, label }) => {
          const items = COSMETICS.filter((c) => c.slot === id);
          return (
            <Card key={id} className="p-6 border-border/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{label}</h3>
                {state.equipped[id] && (
                  <Button variant="ghost" size="sm" onClick={() => equip({ slot: id, itemId: null })}>
                    <X className="h-3.5 w-3.5 mr-1" /> Unequip
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {items.map((item) => {
                  const isOwned = owned.has(item.id);
                  const isEquipped = state.equipped[id] === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!isOwned}
                      onClick={() => isOwned && equip({ slot: id, itemId: item.id })}
                      className={`text-left rounded-lg border p-3 transition-colors ${
                        isEquipped
                          ? "border-primary bg-primary/5"
                          : isOwned
                          ? "border-border/60 bg-card hover:border-border hover:bg-muted/40"
                          : "border-border/40 bg-muted/20 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-6 rounded shrink-0 border border-border/40"
                          style={{ background: item.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate flex items-center gap-1">
                            {item.name}
                            {!isOwned && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">{item.blurb}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
