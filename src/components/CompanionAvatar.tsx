import { getCompanion } from "@/lib/companions";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 40, md: 56, lg: 96 };

/**
 * Pixel-art mascot for any companion. Idle-bobs, soft pulsing glow,
 * periodic "blink" wipe — all CSS, no sprite-sheet juggling.
 */
export function CompanionAvatar({
  companionId,
  size = "md",
  className = "",
}: {
  companionId?: string;
  size?: Size;
  className?: string;
}) {
  const companion = getCompanion(companionId);
  const px = SIZE_PX[size];
  return (
    <div
      className={`relative inline-block barnaby-bob ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full barnaby-glow"
        style={{
          background: `radial-gradient(circle, ${companion.glow} 0%, transparent 65%)`,
          filter: "blur(6px)",
        }}
      />
      <img
        src={companion.sprite}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        className="relative block w-full h-full"
        style={{
          imageRendering: "pixelated",
          filter: "drop-shadow(0 2px 0 oklch(0.15 0.04 260 / 0.4))",
        }}
      />
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
    </div>
  );
}
