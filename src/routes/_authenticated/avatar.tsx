import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shuffle, RotateCcw, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  head: () => ({ meta: [{ title: "Avatar Studio — Command Center" }] }),
  component: AvatarPage,
});

function AvatarPage() {
  const { state, updateParts } = useAvatar();

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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="font-serif text-xl tracking-tight">Avatar Studio</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Portrait composer</p>
          </div>
          <Link to="/locker" className="text-sm text-muted-foreground hover:text-foreground">Locker →</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* Live portrait */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-6 flex flex-col items-center gap-4">
            <div className="rounded-2xl overflow-hidden">
              <PlayerAvatar parts={state} equipped={state.equipped} size="xl" />
            </div>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Check className="h-3 w-3 text-primary" /> Saved automatically
            </p>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={randomize} className="gap-2">
              <Shuffle className="h-4 w-4" /> Randomize
            </Button>
            <Button variant="ghost" onClick={() => updateParts(DEFAULT_AVATAR)} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-border/60 p-6">
          <Tabs defaultValue="face">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="face">Face</TabsTrigger>
              <TabsTrigger value="hair">Hair</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="acc">Accessories</TabsTrigger>
              <TabsTrigger value="scene">Scene</TabsTrigger>
            </TabsList>

            <TabsContent value="face" className="space-y-6">
              <Section title="Skin tone">
                <SwatchRow items={SKIN_TONES} current={state.skin_tone} onPick={(id) => set("skin_tone", id)} />
              </Section>
              <Section title="Eye shape">
                <ChipRow items={EYE_STYLES} current={state.eye_style} onPick={(id) => set("eye_style", id)} />
              </Section>
              <Section title="Eye color">
                <SwatchRow items={EYE_COLORS} current={state.eye_color} onPick={(id) => set("eye_color", id)} />
              </Section>
              <Section title="Brows">
                <ChipRow items={BROW_STYLES} current={state.brow_style} onPick={(id) => set("brow_style", id)} />
              </Section>
              <Section title="Freckles">
                <ChipRow items={FRECKLES} current={state.freckles} onPick={(id) => set("freckles", id)} />
              </Section>
              <Section title="Mouth">
                <ChipRow items={MOUTH_STYLES} current={state.mouth_style} onPick={(id) => set("mouth_style", id)} />
              </Section>
              <Section title="Lip color">
                <SwatchRow items={LIP_COLORS} current={state.lip_color} onPick={(id) => set("lip_color", id)} />
              </Section>
            </TabsContent>

            <TabsContent value="hair" className="space-y-6">
              <Section title="Hair style">
                <ChipRow items={HAIR_STYLES} current={state.hair_style} onPick={(id) => set("hair_style", id)} />
              </Section>
              <Section title="Hair color">
                <SwatchRow items={HAIR_COLORS} current={state.hair_color} onPick={(id) => set("hair_color", id)} />
              </Section>
              <Section title="Facial hair">
                <ChipRow items={FACIAL_HAIR} current={state.facial_hair} onPick={(id) => set("facial_hair", id)} />
              </Section>
            </TabsContent>

            <TabsContent value="style" className="space-y-6">
              <Section title="Outfit">
                <ChipRow items={OUTFIT_BASES.map((o) => o.id)} labels={OUTFIT_BASES.reduce((acc, o) => ({ ...acc, [o.id]: o.label }), {} as Record<string, string>)} current={state.outfit_base} onPick={(id) => set("outfit_base", id)} />
              </Section>
              <Section title="Outfit color">
                <SwatchRow items={OUTFIT_COLORS} current={state.outfit_color} onPick={(id) => set("outfit_color", id)} />
              </Section>
              <Section title="Body">
                <ChipRow items={BODY_TYPES} current={state.body_type} onPick={(id) => set("body_type", id)} />
              </Section>
            </TabsContent>

            <TabsContent value="acc" className="space-y-6">
              <Section title="Glasses">
                <ChipRow items={GLASSES} current={state.glasses} onPick={(id) => set("glasses", id)} />
              </Section>
              <Section title="Earrings">
                <ChipRow items={EARRINGS} current={state.earrings} onPick={(id) => set("earrings", id)} />
              </Section>
              <p className="text-xs text-muted-foreground">
                Earned hats, jackets, pins, and frames live in your <Link to="/locker" className="underline">Locker</Link>.
              </p>
            </TabsContent>

            <TabsContent value="scene" className="space-y-6">
              <Section title="Background">
                <SwatchRow items={BACKGROUNDS} current={state.background} onPick={(id) => set("background", id)} large />
              </Section>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{title}</h3>
      {children}
    </div>
  );
}

function SwatchRow({
  items, current, onPick, large = false,
}: {
  items: readonly { id: string; color: string }[];
  current: string;
  onPick: (id: string) => void;
  large?: boolean;
}) {
  const size = large ? "h-12 w-12" : "h-9 w-9";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.id === current;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onPick(it.id)}
            aria-label={it.id}
            aria-pressed={active}
            className={cn(
              size,
              "rounded-lg border border-border/60 transition-all hover:scale-110",
              active && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105",
            )}
            style={{ background: it.color }}
          />
        );
      })}
    </div>
  );
}

function ChipRow({
  items, current, onPick, labels,
}: {
  items: readonly string[];
  current: string;
  onPick: (id: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((id) => {
        const active = id === current;
        const label = labels?.[id] ?? id.replace(/-/g, " ");
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            aria-pressed={active}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize",
              active
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border/60 hover:border-primary/50 hover:bg-accent/40",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
