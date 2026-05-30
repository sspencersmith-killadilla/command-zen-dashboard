import barnabySprite from "@/assets/barnaby-sprite.png";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 40, md: 56, lg: 96 };

/**
 * Pixel-art mascot for Barnaby. Idle-bobs, has a soft pulsing glow
 * and a periodic "blink" wipe — all CSS, no sprite-sheet juggling.
 */
export function BarnabyAvatar({ size = "md", className = "" }: { size?: Size; className?: string }) {
  const px = SIZE_PX[size];
  return (
    <div
      className={`relative inline-block barnaby-bob ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      {/* glow halo */}
      <div
        className="absolute inset-0 rounded-full barnaby-glow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.2 260 / 0.55) 0%, transparent 65%)",
          filter: "blur(6px)",
        }}
      />
      {/* sprite */}
      <img
        src={barnabySprite}
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
      {/* blink wipe */}
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
