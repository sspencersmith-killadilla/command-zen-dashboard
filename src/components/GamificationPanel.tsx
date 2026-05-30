import { Card } from "@/components/ui/card";
import { Flame, Trophy, Zap, Lock, Check } from "lucide-react";
import {
  ACHIEVEMENTS,
  DAILY_QUESTS,
  rankFor,
  useGamification,
} from "@/lib/gamification";

/**
 * Transmutation Circle SVG — animated, doubles as the level/rank emblem.
 */
function TransmutationCircle({ progress }: { progress: number }) {
  const C = 2 * Math.PI * 46;
  const dash = C * (progress / 100);
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full animate-[spin_60s_linear_infinite]">
        <defs>
          <radialGradient id="alch-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--alch-gold)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--alch-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="url(#alch-glow)" />
        {/* outer circle */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--alch-gold)" strokeWidth="1.25" opacity="0.85" />
        {/* inscribed triangle */}
        <polygon points="60,18 96,82 24,82" fill="none" stroke="var(--alch-gold)" strokeWidth="1" opacity="0.7" />
        {/* inner circle */}
        <circle cx="60" cy="60" r="22" fill="none" stroke="var(--alch-gold)" strokeWidth="0.9" opacity="0.75" />
        {/* hash marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x1 = 60 + Math.cos(a) * 50;
          const y1 = 60 + Math.sin(a) * 50;
          const x2 = 60 + Math.cos(a) * 46;
          const y2 = 60 + Math.sin(a) * 46;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--alch-gold)" strokeWidth="0.8" opacity="0.6" />;
        })}
        {/* runes */}
        <text x="60" y="64" textAnchor="middle" fontSize="14" fill="var(--alch-gold)" fontFamily="serif" opacity="0.9">
          ✦
        </text>
      </svg>
      {/* progress ring (counter-spinning to stay readable) */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="var(--alch-red)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 600ms ease-out" }}
        />
      </svg>
    </div>
  );
}

export function GamificationPanel() {
  const { state, completeQuest, todayQuestsDone } = useGamification();
  const { current, next, progress } = rankFor(state.xp);

  return (
    <Card
      className="p-6 border-border/60 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 400px at 0% 0%, color-mix(in oklab, var(--alch-red) 12%, transparent), transparent), linear-gradient(135deg, oklch(0.18 0.03 30), oklch(0.13 0.02 25))",
        boxShadow: "var(--shadow-soft)",
        color: "oklch(0.96 0.02 80)",
      }}
    >
      {/* faint engraved circle background */}
      <div
        className="pointer-events-none absolute -right-24 -bottom-24 h-[420px] w-[420px] opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--alch-gold) 0 1px, transparent 1px), radial-gradient(circle, var(--alch-gold) 0 1px, transparent 1px)",
          backgroundSize: "30px 30px, 60px 60px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
        }}
      />

      <div className="flex items-start gap-6 mb-6 relative">
        <TransmutationCircle progress={progress} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--alch-gold)" }}>
            <Trophy className="h-3 w-3" />
            Alchemist Codex
          </div>
          <h2 className="font-serif text-3xl mt-1 leading-tight" style={{ color: "oklch(0.96 0.05 75)" }}>
            {current.title}
          </h2>
          <p className="text-sm italic mt-0.5" style={{ color: "oklch(0.75 0.04 70)" }}>
            {current.subtitle}
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs tabular-nums">
            <span className="font-semibold" style={{ color: "var(--alch-gold)" }}>{state.xp} XP</span>
            {next ? (
              <span style={{ color: "oklch(0.7 0.03 70)" }}>
                → {next.minXp} XP for <span className="font-medium">{next.title}</span>
              </span>
            ) : (
              <span style={{ color: "var(--alch-gold)" }}>Truth attained.</span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: "oklch(0.25 0.02 30)" }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--alch-red), var(--alch-gold))",
                boxShadow: "0 0 12px var(--alch-red)",
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" style={{ color: "var(--alch-red)" }} />
              <span className="font-semibold" style={{ color: "oklch(0.96 0.02 80)" }}>{state.streak}</span>
              <span style={{ color: "oklch(0.7 0.03 70)" }}>day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" style={{ color: "var(--alch-gold)" }} />
              <span style={{ color: "oklch(0.7 0.03 70)" }}>
                {todayQuestsDone.length}/{DAILY_QUESTS.length} quests today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="grid gap-4 md:grid-cols-2 relative">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--alch-gold)" }}>
            Today's Contract
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
                      borderColor: done ? "color-mix(in oklab, var(--alch-gold) 50%, transparent)" : "oklch(0.3 0.02 30)",
                      background: done
                        ? "color-mix(in oklab, var(--alch-gold) 8%, transparent)"
                        : "oklch(0.2 0.02 30)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: done ? "var(--alch-gold)" : "transparent",
                          color: done ? "oklch(0.15 0.02 30)" : "var(--alch-gold)",
                          border: done ? "none" : "1px solid var(--alch-gold)",
                        }}
                      >
                        {done ? <Check className="h-3 w-3" /> : "✦"}
                      </span>
                      <span
                        className="text-sm truncate"
                        style={{ color: done ? "oklch(0.75 0.04 70)" : "oklch(0.94 0.02 80)" }}
                      >
                        {q.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold tabular-nums shrink-0"
                      style={{ color: "var(--alch-gold)" }}
                    >
                      +{q.xp} XP
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--alch-gold)" }}>
            Trophies Sealed
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = a.unlocked(state);
              return (
                <div
                  key={a.id}
                  className="group relative aspect-square rounded-lg border flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    borderColor: unlocked
                      ? "color-mix(in oklab, var(--alch-gold) 70%, transparent)"
                      : "oklch(0.3 0.02 30)",
                    background: unlocked
                      ? "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--alch-gold) 30%, transparent), oklch(0.2 0.02 30))"
                      : "oklch(0.18 0.02 30)",
                    boxShadow: unlocked ? "0 0 18px -4px var(--alch-gold)" : "none",
                  }}
                  title={`${a.name} — ${a.hint}`}
                >
                  {unlocked ? (
                    <span className="text-xl" style={{ color: "var(--alch-gold)" }}>✦</span>
                  ) : (
                    <Lock className="h-3.5 w-3.5" style={{ color: "oklch(0.45 0.02 30)" }} />
                  )}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-[10px] px-2 py-1 rounded-md z-20"
                    style={{ background: "oklch(0.1 0.02 30)", color: "oklch(0.94 0.02 80)", border: "1px solid var(--alch-gold)" }}
                  >
                    {a.name}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] italic mt-3" style={{ color: "oklch(0.6 0.03 70)" }}>
            "Humankind cannot gain anything without first giving something in return."
          </p>
        </div>
      </div>
    </Card>
  );
}
