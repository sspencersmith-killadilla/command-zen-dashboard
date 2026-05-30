import { getCompanion } from "@/lib/companions";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 40, md: 56, lg: 96 };

/**
 * Pixel-art mascot for any companion. Layered animation:
 *  - outer frame: occasional wiggle (personality)
 *  - bob layer:   steps-based vertical hop (pixel-clean)
 *  - sway layer:  gentle rotation around the feet
 *  - sprite:      breathing scale
 *  - glow:        pulsing radial halo
 * No hardcoded face overlays — works for every sprite.
 */
export function CompanionAvatar({
  companionId,
  size = "md",
  className = "",
  mood = "happy",
}: {
  companionId?: string;
  size?: Size;
  className?: string;
  mood?: "happy" | "concerned" | "sad";
}) {
  const companion = getCompanion(companionId);
  const px = SIZE_PX[size];
  // Soft-consequence mood: desaturate + droop. Never grayscale to zero.
  const moodFilter =
    mood === "sad"
      ? "saturate(0.35) brightness(0.92)"
      : mood === "concerned"
        ? "saturate(0.7)"
        : "none";
  const moodTilt =
    mood === "sad" ? "rotate(-4deg)" : mood === "concerned" ? "rotate(-1.5deg)" : "none";
  return (
    <div
      className={`relative inline-block companion-frame ${className}`}
      style={{ width: px, height: px, filter: moodFilter }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full companion-glow"
        style={{
          background: `radial-gradient(circle, ${companion.glow} 0%, transparent 65%)`,
          filter: "blur(6px)",
          opacity: mood === "happy" ? 1 : 0.55,
        }}
      />
      <div className="absolute inset-0 companion-bob" style={{ transform: moodTilt }}>
        <div className="absolute inset-0 companion-sway">
          <img
            src={companion.sprite}
            alt=""
            width={px}
            height={px}
            loading="lazy"
            draggable={false}
            className="companion-sprite relative block w-full h-full select-none"
            style={{
              imageRendering: "pixelated",
              filter: "drop-shadow(0 2px 0 oklch(0.15 0.04 260 / 0.4))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
