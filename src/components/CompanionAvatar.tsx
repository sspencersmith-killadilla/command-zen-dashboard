import { getCompanion, type CompanionId } from "@/lib/companions";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<Size, number> = { sm: 40, md: 56, lg: 96, xl: 144 };

/**
 * Pixel-art mascot. Idle-bobs, has a soft pulsing glow tinted per companion,
 * and a periodic "blink" wipe — all CSS, no sprite-sheet juggling.
 */
export function CompanionAvatar({
  id,
  size = "md",
  className = "",
  animate = true,
}: {
  id: CompanionId;
  size?: Size;
  className?: string;
  animate?: boolean;
}) {
  const px = SIZE_PX[size];
  const c = getCompanion(id);
  return (
    <div
      className={`relative inline-block ${animate ? "barnaby-bob" : ""} ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <div
        className={`absolute inset-0 rounded-full ${animate ? "barnaby-glow" : ""}`}
        style={{
          background: `radial-gradient(circle, ${c.glow} 0%, transparent 65%)`,
          filter: "blur(6px)",
        }}
      />
      <img
        src={c.sprite}
        alt={c.name}
        width={px}
        height={px}
        loading="lazy"
        className="relative block w-full h-full"
        style={{
          imageRendering: "pixelated",
          filter: "drop-shadow(0 2px 0 oklch(0.15 0.04 260 / 0.4))",
        }}
      />
      {animate && (
        <div
          className="absolute left-0 right-0 pointer-events-none barnaby-blink"
          style={{
            top: "30%",
            height: "10%",
            background: "oklch(0.2 0.04 260)",
            mixBlendMode: "multiply",
            opacity: 0,
          }}
        />
      )}
    </div>
  );
}
