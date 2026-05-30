import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Flame, Trophy, Zap, Lock, Check, Swords, Star, Gamepad2 } from "lucide-react";
import {
  ACHIEVEMENTS,
  DAILY_QUESTS,
  rankFor,
  useGamification,
} from "@/lib/gamification";

/** Hex-shaped level badge — universal RPG/HUD vibe. */
function LevelBadge({ level, progress }: { level: number; progress: number }) {
  const C = 2 * Math.PI * 46;
  const dash = C * (progress / 100);
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="lvl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary, 220 90% 60%) / 1)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary, 220 90% 60%) / 0.4)" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* hex frame */}
        <polygon
          points="60,8 108,34 108,86 60,112 12,86 12,34"
          fill="oklch(0.18 0.04 260)"
          stroke="oklch(0.55 0.18 260)"
          strokeWidth="2"
        />
        <polygon
          points="60,18 99,40 99,80 60,102 21,80 21,40"
          fill="none"
          stroke="oklch(0.7 0.18 260)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      {/* progress ring */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="oklch(0.85 0.18 90)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 700ms ease-out", filter: "drop-shadow(0 0 6px oklch(0.85 0.18 90 / 0.7))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">Lvl</span>
        <span className="text-3xl font-black tabular-nums leading-none text-primary-foreground" style={{ textShadow: "0 0 12px oklch(0.85 0.18 90 / 0.6)" }}>
          {level}
        </span>
      </div>
    </div>
  );
}

export function GamificationPanel() {
  const { state, completeQuest, todayQuestsDone, lastGain } = useGamification();
  const { current, next, level, progress } = rankFor(state.xp);
  const [pop, setPop] = useState<{ xp: number; key: number } | null>(null);

  useEffect(() => {
    if (!lastGain) return;
    setPop({ xp: lastGain.xp, key: lastGain.at });
    const t = setTimeout(() => setPop(null), 1400);
    return () => clearTimeout(t);
  }, [lastGain]);

  return (
    <Card
      className="p-6 border-border/60 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(900px 360px at 0% 0%, oklch(0.4 0.18 260 / 0.35), transparent), linear-gradient(135deg, oklch(0.18 0.04 265), oklch(0.13 0.03 260))",
        boxShadow: "var(--shadow-soft)",
        color: "oklch(0.96 0.02 250)",
      }}
    >
      {/* scanline / grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.18 90) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 90) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(circle at 80% 30%, black 0%, transparent 70%)",
        }}
      />

      {/* XP gain pop */}
      {pop && (
        <div
          key={pop.key}
          className="absolute top-6 right-6 z-10 px-3 py-1.5 rounded-md text-sm font-bold tabular-nums pointer-events-none"
          style={{
            background: "oklch(0.85 0.18 90)",
            color: "oklch(0.15 0.04 260)",
            boxShadow: "0 0 24px oklch(0.85 0.18 90 / 0.7)",
            animation: "fade-up 1.2s ease-out forwards",
          }}
        >
          +{pop.xp} XP
        </div>
      )}

      <div className="flex items-start gap-6 mb-6 relative">
        <LevelBadge level={level} progress={progress} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: "oklch(0.85 0.18 90)" }}>
            <Gamepad2 className="h-3 w-3" />
            Player Profile
          </div>
          <h2 className="font-bold text-3xl mt-1 leading-tight tracking-tight">
            {current.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.75 0.04 260)" }}>
            {current.subtitle}
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs tabular-nums">
            <span className="font-bold" style={{ color: "oklch(0.85 0.18 90)" }}>{state.xp} XP</span>
            {next ? (
              <span style={{ color: "oklch(0.72 0.03 260)" }}>
                {next.minXp - state.xp} XP to <span className="font-medium text-foreground/90" style={{ color: "oklch(0.92 0.02 250)" }}>{next.title}</span>
              </span>
            ) : (
              <span style={{ color: "oklch(0.85 0.18 90)" }}>Max level reached.</span>
            )}
          </div>
          <div className="mt-2 h-2 w-full rounded-full overflow-hidden relative" style={{ background: "oklch(0.25 0.03 260)" }}>
            <div
              className="h-full transition-all duration-700 relative"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, oklch(0.7 0.2 260), oklch(0.85 0.18 90))",
                boxShadow: "0 0 14px oklch(0.85 0.18 90 / 0.6)",
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" style={{ color: "oklch(0.72 0.2 35)" }} />
              <span className="font-bold tabular-nums">{state.streak}</span>
              <span style={{ color: "oklch(0.72 0.03 260)" }}>day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" style={{ color: "oklch(0.85 0.18 90)" }} />
              <span style={{ color: "oklch(0.72 0.03 260)" }}>
                {todayQuestsDone.length}/{DAILY_QUESTS.length} quests today
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" style={{ color: "oklch(0.78 0.15 80)" }} />
              <span style={{ color: "oklch(0.72 0.03 260)" }}>
                {ACHIEVEMENTS.filter((a) => a.unlocked(state)).length}/{ACHIEVEMENTS.length} trophies
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests + Achievements */}
      <div className="grid gap-5 md:grid-cols-2 relative">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: "oklch(0.85 0.18 90)" }}>
            <Swords className="h-3 w-3" />
            Daily Quests
          </div>
          <ul className="space-y-1.5">
            {DAILY_QUESTS.map((q) => {
              const done = todayQuestsDone.includes(q.id);
              return (
                <li key={q.id}>
                  <button
                    onClick={() => completeQuest(q.id)}
                    disabled={done}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-left transition-all hover:translate-x-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      borderColor: done ? "oklch(0.85 0.18 90 / 0.5)" : "oklch(0.3 0.03 260)",
                      background: done ? "oklch(0.85 0.18 90 / 0.1)" : "oklch(0.2 0.03 260)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          background: done ? "oklch(0.85 0.18 90)" : "transparent",
                          color: done ? "oklch(0.15 0.04 260)" : "oklch(0.85 0.18 90)",
                          border: done ? "none" : "1px solid oklch(0.85 0.18 90)",
                        }}
                      >
                        {done ? <Check className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                      </span>
                      <span
                        className="text-sm truncate"
                        style={{ color: done ? "oklch(0.72 0.03 260)" : "oklch(0.94 0.02 250)" }}
                      >
                        {q.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums shrink-0"
                      style={{ color: "oklch(0.85 0.18 90)" }}
                    >
                      +{q.xp}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: "oklch(0.85 0.18 90)" }}>
            <Trophy className="h-3 w-3" />
            Trophies
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = a.unlocked(state);
              return (
                <div
                  key={a.id}
                  className="group relative aspect-square rounded-lg border flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    borderColor: unlocked ? "oklch(0.78 0.15 80 / 0.7)" : "oklch(0.3 0.03 260)",
                    background: unlocked
                      ? "radial-gradient(circle at 30% 30%, oklch(0.78 0.15 80 / 0.35), oklch(0.2 0.03 260))"
                      : "oklch(0.18 0.03 260)",
                    boxShadow: unlocked ? "0 0 16px -4px oklch(0.78 0.15 80)" : "none",
                  }}
                  title={`${a.name} — ${a.hint}`}
                >
                  {unlocked ? (
                    <Trophy className="h-4 w-4" style={{ color: "oklch(0.85 0.15 80)" }} />
                  ) : (
                    <Lock className="h-3.5 w-3.5" style={{ color: "oklch(0.45 0.03 260)" }} />
                  )}
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-[10px] px-2 py-1 rounded-md z-20"
                    style={{
                      background: "oklch(0.1 0.03 260)",
                      color: "oklch(0.94 0.02 250)",
                      border: "1px solid oklch(0.5 0.1 260)",
                    }}
                  >
                    {a.name}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] mt-3" style={{ color: "oklch(0.65 0.03 260)" }}>
            Tap a quest to claim XP. Streaks reset if you miss a day.
          </p>
        </div>
      </div>
    </Card>
  );
}
