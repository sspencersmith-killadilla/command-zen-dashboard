import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { getCompanion } from "@/lib/companions";

/**
 * Floating close-up portrait that pops in when the companion is speaking
 * or has just sent a new message. The sprite is scaled up and offset so
 * the face fills a circular frame, with a fake jaw-bounce while speaking.
 */
export function CompanionCloseup({
  companionId,
  open,
  intensity,
  canSpeak = false,
  isSpeaking = false,
  onToggleSpeak,
}: {
  companionId?: string;
  open: boolean;
  intensity: "idle" | "speaking";
  /** Show the speak/stop button under the bubble. */
  canSpeak?: boolean;
  isSpeaking?: boolean;
  onToggleSpeak?: () => void;
}) {
  const companion = getCompanion(companionId);
  // Keep mounted briefly during exit so the fade-out animation can play.
  const [render, setRender] = useState(open);

  useEffect(() => {
    if (open) {
      setRender(true);
      return;
    }
    const t = setTimeout(() => setRender(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  if (!render) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none top-24 right-6 sm:top-28 sm:right-10"
      aria-hidden
    >
      <div
        className="closeup-shell relative"
        style={{
          width: 180,
          height: 180,
          animation: open
            ? "closeup-enter 280ms cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards"
            : "closeup-exit 200ms ease-in forwards",
        }}
      >
        {/* glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${companion.glow} 0%, transparent 70%)`,
            filter: "blur(18px)",
            opacity: 0.9,
          }}
        />
        {/* portrait frame */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden border-2 closeup-bob"
          style={{
            borderColor: companion.glow,
            background:
              "radial-gradient(circle at 50% 35%, oklch(1 0 0 / 0.08), oklch(0.15 0.04 260 / 0.85))",
            boxShadow:
              "0 18px 40px -12px oklch(0.15 0.04 260 / 0.55), inset 0 0 0 1px oklch(1 0 0 / 0.08)",
          }}
        >
          <div
            className={intensity === "speaking" ? "closeup-jaw" : ""}
            style={{
              width: "100%",
              height: "100%",
              // Pivot the jaw-bounce around the mouth area rather than the eyes
              // so the motion reads as a talking mouth instead of a head nod.
              transformOrigin: "50% 60%",
            }}
          >
            {(() => {
              const fo = companion.faceOffset ?? {};
              const x = fo.x ?? 0;
              // Default places the mouth (≈45% from the top of the sprite)
              // at the vertical center of the circular frame. Companions whose
              // mouths sit higher/lower can override via `faceOffset.y`.
              const y = fo.y ?? -40;
              const zoom = fo.zoom ?? 220;
              return (
                <img
                  src={companion.sprite}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: `${50 + x}%`,
                    top: "50%",
                    width: `${zoom}%`,
                    height: `${zoom}%`,
                    transform: `translate(-50%, ${y}%)`,
                    imageRendering: "pixelated",
                    filter: "drop-shadow(0 3px 0 oklch(0.15 0.04 260 / 0.5))",
                  }}
                />
              );
            })()}
          </div>
        </div>
        {/* name plate */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap"
          style={{
            background: "oklch(0.18 0.04 260 / 0.92)",
            color: "oklch(0.98 0 0)",
            border: `1px solid ${companion.glow}`,
            boxShadow: "0 4px 12px -4px oklch(0.15 0.04 260 / 0.6)",
          }}
        >
          {companion.name}
          {intensity === "speaking" && (
            <span className="ml-1.5 inline-flex gap-0.5 align-middle">
              <span className="closeup-dot" style={{ animationDelay: "0ms" }} />
              <span className="closeup-dot" style={{ animationDelay: "120ms" }} />
              <span className="closeup-dot" style={{ animationDelay: "240ms" }} />
            </span>
          )}
        </div>
        {/* speak / stop control */}
        {canSpeak && onToggleSpeak && (
          <button
            type="button"
            onClick={onToggleSpeak}
            aria-label={isSpeaking ? `Stop ${companion.name}'s voice` : `Hear ${companion.name} speak`}
            title={isSpeaking ? "Stop" : `${companion.name}'s voice`}
            className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -bottom-11 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-foreground"
            style={{
              background: "oklch(0.18 0.04 260 / 0.92)",
              color: "oklch(0.92 0 0)",
              borderColor: companion.glow,
              boxShadow: "0 4px 12px -4px oklch(0.15 0.04 260 / 0.6)",
            }}
          >
            {isSpeaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {isSpeaking ? "stop" : "speak"}
          </button>
        )}
      </div>
    </div>
  );
}
