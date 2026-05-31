import { useEffect, useState } from "react";
import { getCompanion } from "@/lib/companions";

/**
 * Floating close-up portrait that pops in when the companion has just sent
 * a new message. Static (no jaw animation, no bob, no audio) — just a larger
 * crop of the face so the student can see who's speaking.
 */
export function CompanionCloseup({
  companionId,
  open,
}: {
  companionId?: string;
  open: boolean;
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

  const SIZE = 240;

  return (
    <div
      className="fixed z-50 pointer-events-none top-24 right-6 sm:top-28 sm:right-10"
      aria-hidden
    >
      <div
        className="relative"
        style={{
          width: SIZE,
          height: SIZE,
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
            filter: "blur(20px)",
            opacity: 0.9,
          }}
        />
        {/* portrait frame — static, no bob or jaw motion */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden border-2"
          style={{
            borderColor: companion.glow,
            background:
              "radial-gradient(circle at 50% 35%, oklch(1 0 0 / 0.08), oklch(0.15 0.04 260 / 0.85))",
            boxShadow:
              "0 18px 40px -12px oklch(0.15 0.04 260 / 0.55), inset 0 0 0 1px oklch(1 0 0 / 0.08)",
          }}
        >
          {(() => {
            const fo = companion.faceOffset ?? {};
            const x = fo.x ?? 0;
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
        </div>
      </div>
    </div>
  );
}
