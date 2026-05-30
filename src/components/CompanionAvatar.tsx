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
}: {
  companionId?: string;
  size?: Size;
  className?: string;
}) {
  const companion = getCompanion(companionId);
  const px = SIZE_PX[size];
  return (
    <div
      className={`relative inline-block companion-frame ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full companion-glow"
        style={{
          background: `radial-gradient(circle, ${companion.glow} 0%, transparent 65%)`,
          filter: "blur(6px)",
        }}
      />
      <div className="absolute inset-0 companion-bob">
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
