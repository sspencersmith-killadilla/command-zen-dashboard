import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Shuffle, RotateCcw, Check, Download, Share2,
  User, Eye, Scissors, Shirt, Glasses as GlassesIcon, Sparkles, Image as ImageIcon, Smile, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAvatar } from "@/lib/use-avatar";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import {
  SKIN_TONES, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, EYE_COLORS,
  BROW_STYLES, FACIAL_HAIR, MOUTH_STYLES, LIP_COLORS, FRECKLES,
  GLASSES, EARRINGS, OUTFIT_BASES, OUTFIT_COLORS, BACKGROUNDS,
  BODY_TYPES, DEFAULT_AVATAR, type AvatarParts,
} from "@/lib/cosmetics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/avatar")({
  head: () => ({ meta: [{ title: "Avatar Maker — Command Center" }] }),
  component: AvatarPage,
});

type CategoryId = "face" | "eyes" | "hair" | "mouth" | "style" | "glasses" | "acc" | "scene";

const CATEGORIES: { id: CategoryId; label: string; icon: typeof User }[] = [
  { id: "face",    label: "Face",     icon: User },
  { id: "eyes",    label: "Eyes",     icon: Eye },
  { id: "hair",    label: "Hair",     icon: Scissors },
  { id: "mouth",   label: "Mouth",    icon: Smile },
  { id: "style",   label: "Outfit",   icon: Shirt },
  { id: "glasses", label: "Glasses",  icon: GlassesIcon },
  { id: "acc",     label: "Accents",  icon: Sparkles },
  { id: "scene",   label: "Scene",    icon: ImageIcon },
];

function AvatarPage() {
  const { state, updateParts } = useAvatar();
  const [category, setCategory] = useState<CategoryId>("hair");

  function set<K extends keyof AvatarParts>(key: K, value: string) {
    updateParts({ [key]: value } as Partial<AvatarParts>);
  }

  function randomize() {
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    updateParts({
      skin_tone:    pick(SKIN_TONES).id,
      hair_style:   pick(HAIR_STYLES),
      hair_color:   pick(HAIR_COLORS).id,
      eye_style:    pick(EYE_STYLES),
      eye_color:    pick(EYE_COLORS).id,
      brow_style:   pick(BROW_STYLES),
      facial_hair:  pick(FACIAL_HAIR),
      mouth_style:  pick(MOUTH_STYLES),
      lip_color:    pick(LIP_COLORS).id,
      freckles:     pick(FRECKLES),
      glasses:      pick(GLASSES),
      earrings:     pick(EARRINGS),
      outfit_base:  pick(OUTFIT_BASES).id,
      outfit_color: pick(OUTFIT_COLORS).id,
      background:   pick(BACKGROUNDS).id,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <Link to="/locker" className="text-sm text-muted-foreground hover:text-foreground">Locker →</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-3xl border border-border/60 bg-card/40 shadow-xl overflow-hidden grid lg:grid-cols-[minmax(0,440px)_1fr]">
          {/* LEFT — preview */}
          <div className="relative flex flex-col">
            {/* Brand block */}
            <div className="absolute top-5 left-5 z-10 leading-[0.9] font-serif">
              <div className="text-[28px] tracking-tight font-bold">AVATAR</div>
              <div className="text-[28px] tracking-[0.3em] text-muted-foreground/80">MAKER</div>
            </div>

            <div
              className="flex-1 flex items-center justify-center min-h-[440px] p-8"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, hsl(var(--muted) / 0.5) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted) / 0.5) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted) / 0.5) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted) / 0.5) 75%)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
              }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/40">
                <PlayerAvatar parts={state} equipped={state.equipped} size="xl" />
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="border-t border-border/60 bg-card/80 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" onClick={randomize} className="gap-1.5">
                  <Shuffle className="h-3.5 w-3.5" /> Random
                </Button>
                <Button size="sm" variant="ghost" onClick={() => updateParts(DEFAULT_AVATAR)} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" className="gap-1.5" disabled>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
                <Button size="sm" className="gap-1.5" disabled>
                  <Download className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT — controls */}
          <div className="bg-card/60 border-l border-border/60 flex flex-col">
            {/* Category icons row */}
            <div className="flex items-center gap-1 p-3 border-b border-border/60 overflow-x-auto">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    aria-pressed={active}
                    title={c.label}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl min-w-[64px] transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Saved indicator */}
            <div className="flex items-center justify-between px-5 py-2 text-xs text-muted-foreground border-b border-border/60">
              <span className="uppercase tracking-[0.18em]">{CATEGORIES.find(c => c.id === category)?.label}</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> Auto-saved</span>
            </div>

            {/* Option grid */}
            <div className="p-5 overflow-y-auto max-h-[640px] space-y-6">
              {category === "face" && (
                <>
                  <PanelLabel>Skin tone</PanelLabel>
                  <PartGrid
                    items={SKIN_TONES.map(s => ({ id: s.id, override: { skin_tone: s.id } as Partial<AvatarParts> }))}
                    current={state.skin_tone} state={state} onPick={(id) => set("skin_tone", id)}
                  />
                  <PanelLabel>Freckles</PanelLabel>
                  <PartGrid
                    items={FRECKLES.map(id => ({ id, override: { freckles: id } as Partial<AvatarParts> }))}
                    current={state.freckles} state={state} onPick={(id) => set("freckles", id)}
                  />
                </>
              )}

              {category === "eyes" && (
                <>
                  <PanelLabel>Eye shape</PanelLabel>
                  <PartGrid
                    items={EYE_STYLES.map(id => ({ id, override: { eye_style: id } as Partial<AvatarParts> }))}
                    current={state.eye_style} state={state} onPick={(id) => set("eye_style", id)}
                  />
                  <PanelLabel>Eye color</PanelLabel>
                  <SwatchGrid items={EYE_COLORS} current={state.eye_color} onPick={(id) => set("eye_color", id)} />
                  <PanelLabel>Brows</PanelLabel>
                  <PartGrid
                    items={BROW_STYLES.map(id => ({ id, override: { brow_style: id } as Partial<AvatarParts> }))}
                    current={state.brow_style} state={state} onPick={(id) => set("brow_style", id)}
                  />
                </>
              )}

              {category === "hair" && (
                <>
                  <PanelLabel>Style</PanelLabel>
                  <PartGrid
                    items={HAIR_STYLES.map(id => ({ id, override: { hair_style: id } as Partial<AvatarParts> }))}
                    current={state.hair_style} state={state} onPick={(id) => set("hair_style", id)}
                    noneId="bald"
                  />
                  <PanelLabel>Color</PanelLabel>
                  <SwatchGrid items={HAIR_COLORS} current={state.hair_color} onPick={(id) => set("hair_color", id)} />
                  <PanelLabel>Facial hair</PanelLabel>
                  <PartGrid
                    items={FACIAL_HAIR.map(id => ({ id, override: { facial_hair: id } as Partial<AvatarParts> }))}
                    current={state.facial_hair} state={state} onPick={(id) => set("facial_hair", id)}
                    noneId="none"
                  />
                </>
              )}

              {category === "mouth" && (
                <>
                  <PanelLabel>Mouth</PanelLabel>
                  <PartGrid
                    items={MOUTH_STYLES.map(id => ({ id, override: { mouth_style: id } as Partial<AvatarParts> }))}
                    current={state.mouth_style} state={state} onPick={(id) => set("mouth_style", id)}
                  />
                  <PanelLabel>Lip color</PanelLabel>
                  <SwatchGrid items={LIP_COLORS} current={state.lip_color} onPick={(id) => set("lip_color", id)} />
                </>
              )}

              {category === "style" && (
                <>
                  <PanelLabel>Outfit</PanelLabel>
                  <PartGrid
                    items={OUTFIT_BASES.map(o => ({ id: o.id, override: { outfit_base: o.id } as Partial<AvatarParts> }))}
                    current={state.outfit_base} state={state} onPick={(id) => set("outfit_base", id)}
                  />
                  <PanelLabel>Color</PanelLabel>
                  <SwatchGrid items={OUTFIT_COLORS} current={state.outfit_color} onPick={(id) => set("outfit_color", id)} />
                  <PanelLabel>Body</PanelLabel>
                  <PartGrid
                    items={BODY_TYPES.map(id => ({ id, override: { body_type: id } as Partial<AvatarParts> }))}
                    current={state.body_type} state={state} onPick={(id) => set("body_type", id)}
                  />
                </>
              )}

              {category === "glasses" && (
                <>
                  <PanelLabel>Glasses</PanelLabel>
                  <PartGrid
                    items={GLASSES.map(id => ({ id, override: { glasses: id } as Partial<AvatarParts> }))}
                    current={state.glasses} state={state} onPick={(id) => set("glasses", id)}
                    noneId="none"
                  />
                </>
              )}

              {category === "acc" && (
                <>
                  <PanelLabel>Earrings</PanelLabel>
                  <PartGrid
                    items={EARRINGS.map(id => ({ id, override: { earrings: id } as Partial<AvatarParts> }))}
                    current={state.earrings} state={state} onPick={(id) => set("earrings", id)}
                    noneId="none"
                  />
                  <p className="text-xs text-muted-foreground pt-2">
                    Earned hats, jackets, pins, and frames live in your <Link to="/locker" className="underline">Locker</Link>.
                  </p>
                </>
              )}

              {category === "scene" && (
                <>
                  <PanelLabel>Background</PanelLabel>
                  <div className="grid grid-cols-4 gap-2.5">
                    {BACKGROUNDS.map((bg) => {
                      const active = bg.id === state.background;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => set("background", bg.id)}
                          aria-pressed={active}
                          className={cn(
                            "aspect-square rounded-xl border-2 transition-all",
                            active ? "border-primary ring-2 ring-primary/30 scale-[1.03]" : "border-border/60 hover:border-primary/50",
                          )}
                          style={{ background: bg.color }}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PanelLabel({ children }: { children: ReactNode }) {
  return <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{children}</h3>;
}

function PartGrid({
  items, current, state, onPick, noneId,
}: {
  items: { id: string; override: Partial<AvatarParts> }[];
  current: string;
  state: AvatarParts;
  onPick: (id: string) => void;
  noneId?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {items.map((it) => {
        const active = it.id === current;
        const isNone = noneId && it.id === noneId;
        const previewParts = { ...state, ...it.override };
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onPick(it.id)}
            aria-pressed={active}
            title={it.id.replace(/-/g, " ")}
            className={cn(
              "aspect-square rounded-xl border-2 transition-all overflow-hidden bg-muted/30 flex items-center justify-center relative",
              active
                ? "border-primary ring-2 ring-primary/30 scale-[1.03] shadow-md"
                : "border-border/60 hover:border-primary/50",
            )}
          >
            {isNone ? (
              <X className="h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
            ) : (
              <div className="scale-[1.4] origin-top translate-y-1 pointer-events-none">
                <PlayerAvatar parts={previewParts} size="sm" animate={false} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SwatchGrid({
  items, current, onPick,
}: {
  items: readonly { id: string; color: string }[];
  current: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {items.map((it) => {
        const active = it.id === current;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onPick(it.id)}
            aria-pressed={active}
            aria-label={it.id}
            className={cn(
              "aspect-square rounded-full border-2 transition-all",
              active ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border/60 hover:scale-110",
            )}
            style={{ background: it.color }}
          />
        );
      })}
    </div>
  );
}
