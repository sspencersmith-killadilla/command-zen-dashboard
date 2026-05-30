import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Flame, Trophy, Zap, Lock, Check, Gamepad2, ChevronRight } from "lucide-react";
import { ACHIEVEMENTS, useGamification } from "@/lib/gamification";
import { getThemePack } from "@/lib/gamification-themes";
import { useWinstonConfig } from "@/lib/winston-store";
import { getCompanion } from "@/lib/companions";

/** Hex-shaped level badge — themed by accent color. */
function LevelBadge({ level, progress, accent, bgHue }: { level: number; progress: number; accent: string; bgHue: string }) {
  const C = 2 * Math.PI * 46;
  const dash = C * (progress / 100);
  const ring = `oklch(0.55 0.18 ${bgHue})`;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
        <polygon
          points="60,8 108,34 108,86 60,112 12,86 12,34"
          fill={`oklch(0.18 0.04 ${bgHue})`}
          stroke={ring}
          strokeWidth="2"
        />
        <polygon
          points="60,18 99,40 99,80 60,102 21,80 21,40"
          fill="none"
          stroke={ring}
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="60" cy="60" r="46" fill="none"
          stroke={accent} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 700ms ease-out", filter: `drop-shadow(0 0 6px ${accent})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">Lvl</span>
        <span className="text-3xl font-black tabular-nums leading-none text-primary-foreground" style={{ textShadow: `0 0 12px ${accent}` }}>
          {level}
        </span>
      </div>
    </div>
  );
}

function rankForXp(xp: number, ranks: { title: string; subtitle: string; minXp: number }[]) {
  let current = ranks[0];
  let next: typeof ranks[number] | null = ranks[1] ?? null;
  let level = 1;
  for (let i = 0; i < ranks.length; i++) {
    if (xp >= ranks[i].minXp) {
      current = ranks[i];
      next = ranks[i + 1] ?? null;
      level = i + 1;
    }
  }
  const floor = current.minXp;
  const ceil = next?.minXp ?? floor + 1;
  const progress = Math.min(100, Math.max(0, ((xp - floor) / (ceil - floor)) * 100));
  return { current, next, level, progress };
}

export function GamificationPanel() {
  const { state, todayQuestsDone, lastGain } = useGamification();
  const { cfg } = useWinstonConfig();
  const companion = getCompanion(cfg.companionId);
  const pack = useMemo(() => getThemePack(companion.theme), [companion.theme]);

  const { current, next, level, progress } = rankForXp(state.xp, pack.ranks);
  const [pop, setPop] = useState<{ xp: number; key: number } | null>(null);

  useEffect(() => {
    if (!lastGain) return;
    setPop({ xp: lastGain.xp, key: lastGain.at });
    const t = setTimeout(() => setPop(null), 1400);
    return () => clearTimeout(t);
  }, [lastGain]);

  const stepsDone = todayQuestsDone.length;
  const totalSteps = pack.quests.length;
  const arcDone = stepsDone >= totalSteps;
  const arcPct = (stepsDone / totalSteps) * 100;

  const accent = pack.accent;
  const bgHue = pack.bgHue;
  const ink = "oklch(0.96 0.02 250)";
  const muted = `oklch(0.72 0.03 ${bgHue})`;

  return (
    <Card
      className="p-6 border-border/60 relative overflow-hidden"
      style={{
        background: `radial-gradient(900px 360px at 0% 0%, oklch(0.4 0.18 ${bgHue} / 0.35), transparent), linear-gradient(135deg, oklch(0.18 0.04 ${bgHue}), oklch(0.13 0.03 ${bgHue}))`,
        boxShadow: "var(--shadow-soft)",
        color: ink,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(circle at 80% 30%, black 0%, transparent 70%)",
        }}
      />

      {pop && (
        <div
          key={pop.key}
          className="absolute top-6 right-6 z-10 px-3 py-1.5 rounded-md text-sm font-bold tabular-nums pointer-events-none"
          style={{
            background: accent,
            color: `oklch(0.15 0.04 ${bgHue})`,
            boxShadow: `0 0 24px ${accent}`,
            animation: "fade-up 1.2s ease-out forwards",
          }}
        >
          +{pop.xp} XP
        </div>
      )}

      {/* Header: rank + XP */}
      <div className="flex items-start gap-6 mb-6 relative">
        <LevelBadge level={level} progress={progress} accent={accent} bgHue={bgHue} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
            <Gamepad2 className="h-3 w-3" />
            {pack.hudLabel}
          </div>
          <h2 className="font-bold text-3xl mt-1 leading-tight tracking-tight">{current.title}</h2>
          <p className="text-sm mt-0.5" style={{ color: muted }}>{current.subtitle}</p>

          <div className="mt-4 flex items-center gap-3 text-xs tabular-nums">
            <span className="font-bold" style={{ color: accent }}>{state.xp} XP</span>
            {next ? (
              <span style={{ color: muted }}>
                {next.minXp - state.xp} XP to <span className="font-medium" style={{ color: ink }}>{next.title}</span>
              </span>
            ) : (
              <span style={{ color: accent }}>Max level reached.</span>
            )}
          </div>
          <div className="mt-2 h-2 w-full rounded-full overflow-hidden relative" style={{ background: `oklch(0.25 0.03 ${bgHue})` }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, oklch(0.7 0.2 ${bgHue}), ${accent})`,
                boxShadow: `0 0 14px ${accent}`,
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" style={{ color: "oklch(0.72 0.2 35)" }} />
              <span className="font-bold tabular-nums">{state.streak}</span>
              <span style={{ color: muted }}>day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" style={{ color: accent }} />
              <span style={{ color: muted }}>{stepsDone}/{totalSteps} steps today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" style={{ color: "oklch(0.78 0.15 80)" }} />
              <span style={{ color: muted }}>
                {ACHIEVEMENTS.filter((a) => a.unlocked(state)).length}/{ACHIEVEMENTS.length} trophies
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The narrative arc — one outcome that fills in as steps complete */}
      <div
        className="relative rounded-xl border p-4 mb-5"
        style={{
          borderColor: arcDone ? `${accent}` : `oklch(0.3 0.03 ${bgHue})`,
          background: arcDone
            ? `linear-gradient(135deg, oklch(0.22 0.06 ${bgHue}), oklch(0.18 0.05 ${bgHue}))`
            : `oklch(0.16 0.03 ${bgHue})`,
          boxShadow: arcDone ? `0 0 24px -8px ${accent}` : "none",
        }}
      >
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>{pack.arcTitle}</div>
            <p className="text-sm mt-0.5" style={{ color: arcDone ? ink : muted }}>
              {arcDone ? pack.arcCompletePhrase : pack.arcSubtitle}
            </p>
          </div>
          <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: accent }}>
            {stepsDone}/{totalSteps}
          </span>
        </div>

        {/* Arc step indicators — each icon lights up as its quest completes */}
        <div className="flex items-center gap-1.5 mt-3">
          {pack.quests.map((q, i) => {
            const done = todayQuestsDone.includes(q.id);
            const Icon = q.icon;
            return (
              <div key={q.id} className="flex items-center gap-1.5 flex-1 min-w-0">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: done ? accent : `oklch(0.22 0.03 ${bgHue})`,
                    color: done ? `oklch(0.15 0.04 ${bgHue})` : muted,
                    border: `1px solid ${done ? accent : `oklch(0.3 0.03 ${bgHue})`}`,
                    boxShadow: done ? `0 0 12px -2px ${accent}` : "none",
                  }}
                  title={done ? q.outcome : q.label}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {i < pack.quests.length - 1 && (
                  <div
                    className="h-px flex-1 transition-all"
                    style={{ background: done ? accent : `oklch(0.3 0.03 ${bgHue})`, opacity: done ? 0.6 : 1 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quest list + trophies */}
      <div className="grid gap-5 md:grid-cols-2 relative">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: accent }}>
            <ChevronRight className="h-3 w-3" />
            Steps
          </div>
          <ul className="space-y-1.5">
            {pack.quests.map((q) => {
              const done = todayQuestsDone.includes(q.id);
              const Icon = q.icon;
              return (
                <li key={q.id}>
                  <div
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-left transition-all"
                    style={{
                      borderColor: done ? `${accent}` : `oklch(0.3 0.03 ${bgHue})`,
                      background: done ? `oklch(0.85 0.18 90 / 0.0)` : `oklch(0.2 0.03 ${bgHue})`,
                      opacity: done ? 0.85 : 1,
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          background: done ? accent : "transparent",
                          color: done ? `oklch(0.15 0.04 ${bgHue})` : accent,
                          border: done ? "none" : `1px solid ${accent}`,
                        }}
                      >
                        {done ? <Check className="h-3 w-3" /> : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm truncate" style={{ color: done ? muted : ink }}>
                          {q.label}
                        </div>
                        {done && (
                          <div className="text-[10px] uppercase tracking-wider truncate" style={{ color: accent }}>
                            ✓ {q.outcome}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: accent }}>
                      +{q.xp}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: accent }}>
            <Trophy className="h-3 w-3" />
            Trophies
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = a.unlocked(state);
              const name = pack.achievementNames[a.id] ?? a.name;
              return (
                <div
                  key={a.id}
                  className="group relative aspect-square rounded-lg border flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    borderColor: unlocked ? "oklch(0.78 0.15 80 / 0.7)" : `oklch(0.3 0.03 ${bgHue})`,
                    background: unlocked
                      ? `radial-gradient(circle at 30% 30%, oklch(0.78 0.15 80 / 0.35), oklch(0.2 0.03 ${bgHue}))`
                      : `oklch(0.18 0.03 ${bgHue})`,
                    boxShadow: unlocked ? "0 0 16px -4px oklch(0.78 0.15 80)" : "none",
                  }}
                  title={`${name} — ${a.hint}`}
                >
                  {unlocked ? (
                    <Trophy className="h-4 w-4" style={{ color: "oklch(0.85 0.15 80)" }} />
                  ) : (
                    <Lock className="h-3.5 w-3.5" style={{ color: `oklch(0.45 0.03 ${bgHue})` }} />
                  )}
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-[10px] px-2 py-1 rounded-md z-20"
                    style={{
                      background: `oklch(0.1 0.03 ${bgHue})`,
                      color: ink,
                      border: `1px solid oklch(0.5 0.1 ${bgHue})`,
                    }}
                  >
                    {name}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] mt-3" style={{ color: `oklch(0.65 0.03 ${bgHue})` }}>
            Tap a step to claim it. Finish all five to complete today's arc.
          </p>
        </div>
      </div>
    </Card>
  );
}
