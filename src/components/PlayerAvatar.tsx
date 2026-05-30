import {
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_BASES,
  BACKGROUNDS,
  getCosmetic,
  type AvatarParts,
  type EquippedMap,
} from "@/lib/cosmetics";
import { useTarnishFlag } from "@/lib/consequences";

type Size = "sm" | "md" | "lg" | "xl";
const PX: Record<Size, number> = { sm: 40, md: 56, lg: 96, xl: 200 };

function look<T extends { id: string; color: string }>(arr: readonly T[], id: string, fb: string) {
  return arr.find((x) => x.id === id)?.color ?? fb;
}

// Darken a hex color for outlines / shading.
function shade(hex: string, amt = -0.25) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const INK = "#1f1a17";

/**
 * Hand-drawn vector avatar. 100×100 viewBox with smooth strokes, soft
 * shading and rounded organic shapes — no pixel art. Layered back→front:
 * background → frame → body → outfit → top → mouth → eyes/brows → hair → hat → accessory.
 */
export function PlayerAvatar({
  parts,
  equipped = {},
  size = "md",
  className = "",
  animate = true,
}: {
  parts: AvatarParts;
  equipped?: EquippedMap;
  size?: Size;
  className?: string;
  animate?: boolean;
}) {
  const px = PX[size];
  const skin = look(SKIN_TONES, parts.skin_tone, "#d9a37a");
  const skinShade = shade(skin, -0.2);
  const hair = look(HAIR_COLORS, parts.hair_color, "#4a2c14");
  const hairShade = shade(hair, -0.25);
  const outfit = look(OUTFIT_BASES, parts.outfit_base, "#2e4f8a");
  const outfitShade = shade(outfit, -0.22);
  const bg = look(BACKGROUNDS, parts.background, "#a8c6e8");
  const bgShade = shade(bg, -0.15);

  const hatItem = getCosmetic(equipped.hat);
  const topItem = getCosmetic(equipped.top);
  const accItem = getCosmetic(equipped.accessory);
  const frmItem = getCosmetic(equipped.frame);

  // Body silhouette width based on type
  const shoulderW =
    parts.body_type === "broad" ? 60 : parts.body_type === "slim" ? 42 : 50;
  const tarnished = useTarnishFlag();
  const uid = `${parts.skin_tone}-${parts.hair_color}-${size}`;

  return (
    <div
      className={`relative inline-block ${animate ? "companion-frame" : ""} ${className}`}
      style={{
        width: px,
        height: px,
        filter: tarnished ? "saturate(0.4) brightness(0.94)" : undefined,
      }}
      aria-hidden
      title={tarnished ? "Your gear is gathering dust — clear past-due work to polish it up." : undefined}
    >
      <div className={animate ? "absolute inset-0 companion-bob" : "absolute inset-0"}>
        <div className={animate ? "absolute inset-0 companion-sway" : "absolute inset-0"}>
          <svg
            viewBox="0 0 100 100"
            width={px}
            height={px}
            style={{ display: "block", overflow: "visible" }}
          >
            <defs>
              <radialGradient id={`bg-${uid}`} cx="50%" cy="35%" r="75%">
                <stop offset="0%" stopColor={bg} />
                <stop offset="100%" stopColor={bgShade} />
              </radialGradient>
              <radialGradient id={`skin-${uid}`} cx="50%" cy="40%" r="70%">
                <stop offset="60%" stopColor={skin} />
                <stop offset="100%" stopColor={skinShade} />
              </radialGradient>
              <linearGradient id={`outfit-${uid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={outfit} />
                <stop offset="100%" stopColor={outfitShade} />
              </linearGradient>
              <clipPath id={`card-${uid}`}>
                <rect x="2" y="2" width="96" height="96" rx="14" />
              </clipPath>
            </defs>

            {/* Background card */}
            <rect x="2" y="2" width="96" height="96" rx="14" fill={`url(#bg-${uid})`} />

            <g clipPath={`url(#card-${uid})`}>
              {/* Soft horizon glow behind subject */}
              <ellipse cx="50" cy="92" rx="46" ry="14" fill={shade(bg, -0.25)} opacity="0.35" />

              {/* Neck */}
              <path
                d="M44 56 Q50 60 56 56 L56 64 Q50 67 44 64 Z"
                fill={`url(#skin-${uid})`}
                stroke={INK}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Torso / outfit */}
              <path
                d={`M${50 - shoulderW / 2} 96
                    Q${50 - shoulderW / 2} 72 50 66
                    Q${50 + shoulderW / 2} 72 ${50 + shoulderW / 2} 96 Z`}
                fill={`url(#outfit-${uid})`}
                stroke={INK}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Outfit collar shading */}
              <path
                d="M42 70 Q50 76 58 70"
                fill="none"
                stroke={INK}
                strokeOpacity="0.5"
                strokeWidth="1.1"
                strokeLinecap="round"
              />

              {/* Top cosmetic */}
              {topItem && (
                <path
                  d={`M${50 - shoulderW / 2} 96
                      Q${50 - shoulderW / 2} 72 50 66
                      Q${50 + shoulderW / 2} 72 ${50 + shoulderW / 2} 96 Z`}
                  fill={topItem.color}
                  stroke={INK}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              )}
              {topItem?.color2 && (
                <rect x="48" y="66" width="4" height="30" fill={topItem.color2} />
              )}

              {/* Head */}
              <ellipse
                cx="50"
                cy="40"
                rx="20"
                ry="22"
                fill={`url(#skin-${uid})`}
                stroke={INK}
                strokeWidth="1.4"
              />
              {/* Cheek blush */}
              <ellipse cx="36" cy="46" rx="3" ry="2" fill="#e88a8a" opacity="0.35" />
              <ellipse cx="64" cy="46" rx="3" ry="2" fill="#e88a8a" opacity="0.35" />
              {/* Ears */}
              <ellipse cx="29" cy="42" rx="2.5" ry="4" fill={skin} stroke={INK} strokeWidth="1.1" />
              <ellipse cx="71" cy="42" rx="2.5" ry="4" fill={skin} stroke={INK} strokeWidth="1.1" />

              {/* Face features */}
              <Brows style={parts.brow_style} />
              <Eyes style={parts.eye_style} />
              <Nose />
              <Mouth style={parts.mouth_style} />

              {/* Hair */}
              <Hair style={parts.hair_style} color={hair} shadeColor={hairShade} />

              {/* Hat */}
              {hatItem && <Hat color={hatItem.color} color2={hatItem.color2} />}

              {/* Accessory pin */}
              {accItem && (
                <g>
                  <circle cx="62" cy="78" r="3" fill={accItem.color} stroke={INK} strokeWidth="1" />
                  <circle cx="62" cy="78" r="1" fill="#fff" opacity="0.7" />
                </g>
              )}
            </g>

            {/* Frame cosmetic on top */}
            {frmItem && (
              <rect
                x="3"
                y="3"
                width="94"
                height="94"
                rx="13"
                fill="none"
                stroke={frmItem.color}
                strokeWidth="3"
              />
            )}
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="14"
              fill="none"
              stroke={INK}
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Eyes({ style }: { style: string }) {
  const eyeWhite = "#fdfdfb";
  switch (style) {
    case "narrow":
      return (
        <g stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M38 46 Q42 44.5 46 46" />
          <path d="M54 46 Q58 44.5 62 46" />
        </g>
      );
    case "wide":
      return (
        <g>
          <ellipse cx="42" cy="46" rx="3.2" ry="3.6" fill={eyeWhite} stroke={INK} strokeWidth="1.2" />
          <ellipse cx="58" cy="46" rx="3.2" ry="3.6" fill={eyeWhite} stroke={INK} strokeWidth="1.2" />
          <circle cx="42.5" cy="46.5" r="1.6" fill={INK} />
          <circle cx="58.5" cy="46.5" r="1.6" fill={INK} />
          <circle cx="43" cy="45.8" r="0.5" fill="#fff" />
          <circle cx="59" cy="45.8" r="0.5" fill="#fff" />
        </g>
      );
    case "sleepy":
      return (
        <g stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none">
          <path d="M38 47 Q42 48.5 46 47" />
          <path d="M54 47 Q58 48.5 62 47" />
        </g>
      );
    case "sharp":
      return (
        <g>
          <path d="M38 47 Q42 44 46 47" fill={INK} />
          <path d="M54 47 Q58 44 62 47" fill={INK} />
        </g>
      );
    case "round":
    default:
      return (
        <g>
          <circle cx="42" cy="46" r="2" fill={INK} />
          <circle cx="58" cy="46" r="2" fill={INK} />
          <circle cx="42.6" cy="45.4" r="0.6" fill="#fff" />
          <circle cx="58.6" cy="45.4" r="0.6" fill="#fff" />
        </g>
      );
  }
}

function Brows({ style }: { style: string }) {
  const s = { stroke: INK, strokeWidth: 1.8, strokeLinecap: "round" as const, fill: "none" };
  switch (style) {
    case "raised":
      return (
        <g {...s}>
          <path d="M37 40 Q42 38 47 40" />
          <path d="M53 40 Q58 38 63 40" />
        </g>
      );
    case "furrowed":
      return (
        <g {...s}>
          <path d="M37 41 L47 39" />
          <path d="M53 39 L63 41" />
        </g>
      );
    case "thin":
      return (
        <g {...s} strokeWidth={1.2}>
          <path d="M38 41 Q42 40 46 41" />
          <path d="M54 41 Q58 40 62 41" />
        </g>
      );
    case "neutral":
    default:
      return (
        <g {...s}>
          <path d="M37 41 Q42 40 47 41" />
          <path d="M53 41 Q58 40 63 41" />
        </g>
      );
  }
}

function Nose() {
  return (
    <path
      d="M50 47 Q49 51 50 53 Q51 53.5 52 53"
      fill="none"
      stroke={INK}
      strokeOpacity="0.55"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  );
}

function Mouth({ style }: { style: string }) {
  const s = { stroke: INK, strokeWidth: 1.6, strokeLinecap: "round" as const, fill: "none" };
  switch (style) {
    case "smirk":
      return <path d="M45 57 Q50 60 55 56" {...s} />;
    case "neutral":
      return <path d="M45 57 L55 57" {...s} />;
    case "open":
      return (
        <g>
          <ellipse cx="50" cy="58" rx="3.5" ry="2.5" fill="#5a2a2a" stroke={INK} strokeWidth="1.2" />
          <path d="M47 58 Q50 59.5 53 58" stroke="#fff" strokeWidth="0.8" fill="none" />
        </g>
      );
    case "grin":
      return (
        <g>
          <path d="M44 56 Q50 62 56 56 Z" fill="#5a2a2a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M45 57 L55 57" stroke="#fff" strokeWidth="0.8" />
        </g>
      );
    case "smile":
    default:
      return <path d="M44 56 Q50 60.5 56 56" {...s} />;
  }
}

function Hair({ style, color, shadeColor }: { style: string; color: string; shadeColor: string }) {
  const stroke = { stroke: INK, strokeWidth: 1.3, strokeLinejoin: "round" as const };
  switch (style) {
    case "bald":
      return null;
    case "buzz":
      return (
        <path
          d="M30 36 Q30 22 50 20 Q70 22 70 36 Q60 30 50 30 Q40 30 30 36 Z"
          fill={color}
          {...stroke}
        />
      );
    case "wavy":
      return (
        <g>
          <path
            d="M28 38 Q28 18 50 17 Q72 18 72 38 Q68 30 60 32 Q56 26 50 27 Q44 26 40 32 Q32 30 28 38 Z"
            fill={color}
            {...stroke}
          />
          <path d="M34 36 Q40 32 46 34" fill="none" stroke={shadeColor} strokeWidth="1" />
        </g>
      );
    case "long":
      return (
        <g>
          <path
            d="M26 50 Q24 28 50 18 Q76 28 74 50 Q72 38 64 36 L64 30 Q50 24 36 30 L36 36 Q28 38 26 50 Z"
            fill={color}
            {...stroke}
          />
          <path d="M28 50 Q30 60 32 70" fill="none" stroke={shadeColor} strokeWidth="1" strokeLinecap="round" />
          <path d="M72 50 Q70 60 68 70" fill="none" stroke={shadeColor} strokeWidth="1" strokeLinecap="round" />
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx="50" cy="14" r="6" fill={color} {...stroke} />
          <path
            d="M30 36 Q30 22 50 20 Q70 22 70 36 Q60 30 50 30 Q40 30 30 36 Z"
            fill={color}
            {...stroke}
          />
        </g>
      );
    case "afro":
      return (
        <g>
          <path
            d="M24 38 Q22 14 50 12 Q78 14 76 38 Q74 30 68 30 Q66 26 60 26 Q58 22 50 22 Q42 22 40 26 Q34 26 32 30 Q26 30 24 38 Z"
            fill={color}
            {...stroke}
          />
        </g>
      );
    case "mohawk":
      return (
        <g>
          <path d="M30 36 Q30 30 50 28 Q70 30 70 36 Q60 32 50 32 Q40 32 30 36 Z" fill={color} {...stroke} />
          <path d="M44 30 Q46 8 50 6 Q54 8 56 30 Z" fill={color} {...stroke} />
        </g>
      );
    case "short":
    default:
      return (
        <path
          d="M28 38 Q28 20 50 18 Q72 20 72 38 Q66 30 56 30 Q50 28 44 30 Q34 30 28 38 Z"
          fill={color}
          {...stroke}
        />
      );
  }
}

function Hat({ color, color2 }: { color: string; color2?: string }) {
  return (
    <g>
      {/* brim */}
      <ellipse cx="50" cy="22" rx="26" ry="3.5" fill={color} stroke={INK} strokeWidth="1.3" />
      {/* crown */}
      <path
        d="M34 22 Q34 8 50 7 Q66 8 66 22 Z"
        fill={color}
        stroke={INK}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {color2 && (
        <rect x="34" y="19" width="32" height="3" fill={color2} stroke={INK} strokeWidth="0.8" />
      )}
      <path d="M38 14 Q44 10 50 11" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" fill="none" />
    </g>
  );
}
