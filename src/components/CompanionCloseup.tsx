import { useEffect, useState } from "react";
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
}: {
  companionId?: string;
  open: boolean;
  intensity: "idle" | "speaking";
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
              transformOrigin: "50% 30%",
            }}
          >
            {(() => {
              const fo = companion.faceOffset ?? {};
              const x = fo.x ?? 0;
              const y = fo.y ?? -28;
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
                    // Sprites place the eyes/face at ~28% from the top of the
                    // square canvas. translateY(-28%) puts that feature line at
                    // the circle's vertical midpoint regardless of zoom level.
                    // Per-companion faceOffset overrides outliers (e.g. Kaito).
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
      </div>
    </div>
  );
}
