import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, X, Sparkles, Trophy, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAvatar } from "@/lib/use-avatar";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { COSMETICS, RARITY_META, type Slot, type Rarity, type CosmeticItem } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";

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

const RARITY_ORDER: Rarity[] = ["legendary", "epic", "rare", "common"];

function LockerPage() {
  const { state, equip } = useAvatar();
  const owned = useMemo(() => new Set(state.inventory), [state.inventory]);
  const [filter, setFilter] = useState<Rarity | "all">("all");

  const stats = useMemo(() => {
    const total = COSMETICS.length;
    const ownedCount = state.inventory.length;
    const byRarity = COSMETICS.reduce(
      (acc, c) => {
        acc[c.rarity].total += 1;
        if (owned.has(c.id)) acc[c.rarity].owned += 1;
        return acc;
      },
      {
        common: { owned: 0, total: 0 },
        rare: { owned: 0, total: 0 },
        epic: { owned: 0, total: 0 },
        legendary: { owned: 0, total: 0 },
      } as Record<Rarity, { owned: number; total: number }>,
    );
    return { total, ownedCount, byRarity };
  }, [state.inventory, owned]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="font-serif text-xl tracking-tight">Locker</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Hero — collection summary */}
        <Card className="p-6 border-border/60 overflow-hidden relative">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Collection</div>
              <h2 className="font-bold text-2xl leading-tight mt-0.5">
                {stats.ownedCount} <span className="text-muted-foreground font-normal">/ {stats.total} items</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Earn drops by submitting on time. Master a theme — five full daily arcs — to unlock its set.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RARITY_ORDER.map((r) => {
                const meta = RARITY_META[r];
                const s = stats.byRarity[r];
                return (
                  <div key={r} className={cn("rounded-xl border px-3 py-2.5", meta.ring)}>
                    <div className={cn("text-[10px] uppercase tracking-wider font-semibold", meta.text)}>
                      {meta.label}
                    </div>
                    <div className="text-lg font-bold tabular-nums leading-tight">
                      {s.owned}<span className="text-sm text-muted-foreground font-normal">/{s.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              On-time progress: <span className="font-medium text-foreground tabular-nums">{state.on_time_count % 3}/3</span> toward next drop.
            </p>
          </div>
        </Card>


        {/* Rarity filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mr-2">Filter</span>
          {(["all", ...RARITY_ORDER] as const).map((r) => {
            const active = filter === r;
            const meta = r === "all" ? null : RARITY_META[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => setFilter(r)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : meta
                      ? cn("bg-card hover:bg-muted/50", meta.chip)
                      : "bg-card text-foreground border-border/60 hover:bg-muted/50",
                )}
              >
                {r === "all" ? "All" : meta!.label}
              </button>
            );
          })}
        </div>

        {SLOTS.map(({ id, label }) => {
          const items = COSMETICS
            .filter((c) => c.slot === id && (filter === "all" || c.rarity === filter))
            .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
          if (items.length === 0) return null;
          return (
            <Card key={id} className="p-6 border-border/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-lg">{label}</h3>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {items.filter((i) => owned.has(i.id)).length}/{items.length}
                  </span>
                </div>
                {state.equipped[id] && (
                  <Button variant="ghost" size="sm" onClick={() => equip({ slot: id, itemId: null })}>
                    <X className="h-3.5 w-3.5 mr-1" /> Unequip
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map((item) => (
                  <ItemTile
                    key={item.id}
                    item={item}
                    owned={owned.has(item.id)}
                    equipped={state.equipped[id] === item.id}
                    onEquip={() => equip({ slot: id, itemId: item.id })}
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </main>
    </div>
  );
}

function ItemTile({
  item, owned, equipped, onEquip,
}: {
  item: CosmeticItem;
  owned: boolean;
  equipped: boolean;
  onEquip: () => void;
}) {
  const meta = RARITY_META[item.rarity];
  const RarityIcon = item.rarity === "legendary" ? Crown : item.rarity === "epic" ? Trophy : item.rarity === "rare" ? Sparkles : null;

  return (
    <button
      type="button"
      disabled={!owned}
      onClick={() => owned && onEquip()}
      className={cn(
        "group relative text-left rounded-xl border-2 p-3.5 transition-all overflow-hidden",
        equipped
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : owned
            ? cn("bg-card hover:-translate-y-0.5 hover:bg-muted/30", meta.ring, owned && meta.glow)
            : "border-border/40 bg-muted/20 opacity-60 cursor-not-allowed",
      )}
    >
      {/* Rarity ribbon */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-[0.14em] font-bold border",
          meta.chip,
        )}>
          {RarityIcon && <RarityIcon className="h-2.5 w-2.5" />}
          {meta.label}
        </span>
        {equipped && (
          <span className="text-[9px] uppercase tracking-wider font-bold text-primary">Equipped</span>
        )}
        {!owned && <Lock className="h-3 w-3 text-muted-foreground" />}
      </div>

      {/* Swatch + name */}
      <div className="flex items-center gap-2.5">
        <div
          className="h-10 w-10 rounded-lg shrink-0 border border-border/40 shadow-inner relative overflow-hidden"
          style={
            item.color2
              ? { background: `linear-gradient(135deg, ${item.color} 0%, ${item.color} 50%, ${item.color2} 50%, ${item.color2} 100%)` }
              : { background: item.color }
          }
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight truncate">{item.name}</div>
          <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{item.blurb}</div>
        </div>
      </div>
    </button>
  );
}
