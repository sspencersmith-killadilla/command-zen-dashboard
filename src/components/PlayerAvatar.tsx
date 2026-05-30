import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  LIP_COLORS,
  OUTFIT_COLORS,
  BACKGROUNDS,
  getCosmetic,
  type AvatarParts,
  type EquippedMap,
} from "@/lib/cosmetics";
import { useTarnishFlag } from "@/lib/consequences";

type Size = "sm" | "md" | "lg" | "xl";
const PX: Record<Size, number> = { sm: 40, md: 56, lg: 96, xl: 320 };

function lookColor<T extends { id: string; color: string }>(arr: readonly T[], id: string, fb: string) {
  return arr.find((x) => x.id === id)?.color ?? fb;
}

function shade(hex: string, amt = -0.25) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const INK = "#1a1410";

/**
 * Editorial illustrated portrait. 200×240 viewBox renders a bust:
 * background → shoulders/outfit → neck → head → ears → freckles → lips →
 * nose → eyes (sclera/iris/pupil/highlight) → brows → facial hair →
 * back hair → front hair → glasses → earrings → hat → accessory → frame.
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
  const tarnished = useTarnishFlag();

  const skin = lookColor(SKIN_TONES, parts.skin_tone, "#d9a37a");
  const skinShade = shade(skin, -0.18);
  const skinHi = shade(skin, 0.18);
  const hair = lookColor(HAIR_COLORS, parts.hair_color, "#4a2c14");
  const hairShade = shade(hair, -0.3);
  const hairHi = shade(hair, 0.18);
  const eyeC = lookColor(EYE_COLORS, parts.eye_color, "#5a3a1a");
  const lip = lookColor(LIP_COLORS, parts.lip_color, "#b87060");
  const lipShade = shade(lip, -0.25);
  const outfitC = lookColor(OUTFIT_COLORS, parts.outfit_color, "#1f3a6e");
  const outfitShade = shade(outfitC, -0.22);
  const outfitHi = shade(outfitC, 0.1);
  const bg = lookColor(BACKGROUNDS, parts.background, "#2a2a30");
  const bgTop = shade(bg, 0.12);
  const bgBot = shade(bg, -0.22);

  const hatItem = getCosmetic(equipped.hat);
  const topItem = getCosmetic(equipped.top);
  const accItem = getCosmetic(equipped.accessory);
  const frmItem = getCosmetic(equipped.frame);

  const shoulderW =
    parts.body_type === "broad" ? 150 : parts.body_type === "slim" ? 110 : 130;

  const uid = `${parts.skin_tone}-${parts.hair_color}-${parts.eye_color}-${parts.outfit_color}-${parts.background}-${size}`;

  // Equipped top overrides outfit color
  const finalOutfit = topItem?.color ?? outfitC;
  const finalOutfitShade = shade(finalOutfit, -0.22);
  const finalOutfitHi = shade(finalOutfit, 0.1);

  return (
    <div
      className={`relative inline-block ${animate ? "companion-frame" : ""} ${className}`}
      style={{
        width: px,
        height: px * 1.2,
        filter: tarnished ? "saturate(0.4) brightness(0.94)" : undefined,
      }}
      aria-hidden
      title={tarnished ? "Your gear is gathering dust — clear past-due work to polish it up." : undefined}
    >
      <div className={animate ? "absolute inset-0 companion-bob" : "absolute inset-0"}>
        <div className={animate ? "absolute inset-0 companion-sway" : "absolute inset-0"}>
          <svg
            viewBox="0 0 200 240"
            width={px}
            height={px * 1.2}
            style={{ display: "block", overflow: "visible" }}
          >
            <defs>
              <linearGradient id={`bg-${uid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={bgTop} />
                <stop offset="100%" stopColor={bgBot} />
              </linearGradient>
              <radialGradient id={`bgGlow-${uid}`} cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor={shade(bg, 0.25)} stopOpacity="0.6" />
                <stop offset="100%" stopColor={bg} stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`skin-${uid}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor={skinHi} />
                <stop offset="55%" stopColor={skin} />
                <stop offset="100%" stopColor={skinShade} />
              </linearGradient>
              <linearGradient id={`outfit-${uid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={finalOutfitHi} />
                <stop offset="60%" stopColor={finalOutfit} />
                <stop offset="100%" stopColor={finalOutfitShade} />
              </linearGradient>
              <linearGradient id={`hair-${uid}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={hairHi} />
                <stop offset="60%" stopColor={hair} />
                <stop offset="100%" stopColor={hairShade} />
              </linearGradient>
              <radialGradient id={`iris-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={shade(eyeC, 0.25)} />
                <stop offset="70%" stopColor={eyeC} />
                <stop offset="100%" stopColor={shade(eyeC, -0.35)} />
              </radialGradient>
              <clipPath id={`card-${uid}`}>
                <rect x="0" y="0" width="200" height="240" rx="18" />
              </clipPath>
              <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
                <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0" />
                <feComposite in2="SourceGraphic" operator="in" />
              </filter>
            </defs>

            {/* Background */}
            <rect x="0" y="0" width="200" height="240" rx="18" fill={`url(#bg-${uid})`} />

            <g clipPath={`url(#card-${uid})`}>
              <rect x="0" y="0" width="200" height="240" fill={`url(#bgGlow-${uid})`} />

              {/* Outfit / shoulders */}
              <path
                d={`M${100 - shoulderW / 2} 240
                    Q${100 - shoulderW / 2} 175 100 162
                    Q${100 + shoulderW / 2} 175 ${100 + shoulderW / 2} 240 Z`}
                fill={`url(#outfit-${uid})`}
                stroke={INK}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <OutfitDetail base={parts.outfit_base} color={finalOutfit} shadeColor={finalOutfitShade} highlight={finalOutfitHi} accent={topItem?.color2} />

              {/* Neck */}
              <path
                d="M84 152 Q100 158 116 152 L116 170 Q100 176 84 170 Z"
                fill={`url(#skin-${uid})`}
                stroke={INK}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Neck shadow */}
              <path d="M84 170 Q100 174 116 170 Q108 166 100 167 Q92 166 84 170 Z" fill={skinShade} opacity="0.55" />

              {/* Back hair (behind head) */}
              <BackHair style={parts.hair_style} hairUid={uid} />

              {/* Head */}
              <ellipse cx="100" cy="98" rx="48" ry="56" fill={`url(#skin-${uid})`} stroke={INK} strokeWidth="1.6" />

              {/* Jawline shadow */}
              <path d="M62 110 Q100 156 138 110" fill="none" stroke={skinShade} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

              {/* Ears */}
              <ellipse cx="54" cy="102" rx="6" ry="10" fill={skin} stroke={INK} strokeWidth="1.4" />
              <ellipse cx="146" cy="102" rx="6" ry="10" fill={skin} stroke={INK} strokeWidth="1.4" />
              <path d="M53 100 Q55 104 53 108" fill="none" stroke={skinShade} strokeWidth="1.2" strokeLinecap="round" />
              <path d="M147 100 Q145 104 147 108" fill="none" stroke={skinShade} strokeWidth="1.2" strokeLinecap="round" />

              {/* Earrings */}
              <Earrings style={parts.earrings} />

              {/* Cheek blush */}
              <ellipse cx="68" cy="116" rx="9" ry="5" fill="#e88a8a" opacity="0.25" />
              <ellipse cx="132" cy="116" rx="9" ry="5" fill="#e88a8a" opacity="0.25" />

              {/* Freckles */}
              <Freckles style={parts.freckles} color={shade(skin, -0.32)} />

              {/* Facial features */}
              <Brows style={parts.brow_style} color={hairShade} />
              <Eyes style={parts.eye_style} irisFill={`url(#iris-${uid})`} />
              <Nose color={skinShade} />
              <Lips style={parts.mouth_style} fill={lip} shadeColor={lipShade} />

              {/* Facial hair */}
              <FacialHair style={parts.facial_hair} hairUid={uid} />

              {/* Front hair */}
              <FrontHair style={parts.hair_style} hairUid={uid} />

              {/* Glasses on top of hair fringe */}
              <Glasses style={parts.glasses} />

              {/* Hat */}
              {hatItem && <Hat color={hatItem.color} color2={hatItem.color2} />}

              {/* Accessory pin on chest */}
              {accItem && (
                <g>
                  <circle cx="130" cy="200" r="5" fill={accItem.color} stroke={INK} strokeWidth="1.2" />
                  <circle cx="129" cy="199" r="1.4" fill="#fff" opacity="0.8" />
                </g>
              )}

              {/* Grain overlay */}
              <rect x="0" y="0" width="200" height="240" filter={`url(#grain-${uid})`} opacity="0.6" />
            </g>

            {/* Frame */}
            {frmItem && (
              <rect
                x="2"
                y="2"
                width="196"
                height="236"
                rx="16"
                fill="none"
                stroke={frmItem.color}
                strokeWidth="3"
              />
            )}
            <rect
              x="0"
              y="0"
              width="200"
              height="240"
              rx="18"
              fill="none"
              stroke={INK}
              strokeOpacity="0.3"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ============ Sub-components ============

function Eyes({ style, irisFill }: { style: string; irisFill: string }) {
  const sclera = "#fdfaf3";
  const w = 7, h = 5;
  const lx = 80, rx = 120, y = 100;
  const iris = (cx: number) => (
    <g>
      <circle cx={cx} cy={y} r={3.6} fill={irisFill} />
      <circle cx={cx} cy={y} r={1.8} fill={INK} />
      <circle cx={cx - 0.8} cy={y - 1} r={1} fill="#fff" />
      <circle cx={cx + 1.2} cy={y + 1.4} r={0.4} fill="#fff" opacity="0.6" />
    </g>
  );
  const lashes = (cx: number, path: string) => (
    <path d={path} fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" transform={`translate(${cx - 90} 0)`} />
  );

  if (style === "narrow" || style === "sleepy") {
    return (
      <g>
        <path d={`M${lx - w} ${y} Q${lx} ${y - 2} ${lx + w} ${y} Q${lx} ${y + 2} ${lx - w} ${y} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        <path d={`M${rx - w} ${y} Q${rx} ${y - 2} ${rx + w} ${y} Q${rx} ${y + 2} ${rx - w} ${y} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        {iris(lx)}{iris(rx)}
      </g>
    );
  }
  if (style === "wide") {
    return (
      <g>
        <ellipse cx={lx} cy={y} rx={w + 1} ry={h + 1.5} fill={sclera} stroke={INK} strokeWidth="1.4" />
        <ellipse cx={rx} cy={y} rx={w + 1} ry={h + 1.5} fill={sclera} stroke={INK} strokeWidth="1.4" />
        {iris(lx)}{iris(rx)}
      </g>
    );
  }
  if (style === "monolid") {
    return (
      <g>
        <path d={`M${lx - w} ${y - 1} Q${lx} ${y - 3} ${lx + w} ${y - 1} L${lx + w} ${y + 2} Q${lx} ${y + 4} ${lx - w} ${y + 2} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        <path d={`M${rx - w} ${y - 1} Q${rx} ${y - 3} ${rx + w} ${y - 1} L${rx + w} ${y + 2} Q${rx} ${y + 4} ${rx - w} ${y + 2} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        {iris(lx)}{iris(rx)}
      </g>
    );
  }
  if (style === "upturned") {
    return (
      <g>
        <path d={`M${lx - w} ${y + 1} Q${lx} ${y - 4} ${lx + w} ${y - 2} Q${lx} ${y + 3} ${lx - w} ${y + 1} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        <path d={`M${rx - w} ${y - 2} Q${rx} ${y - 4} ${rx + w} ${y + 1} Q${rx} ${y + 3} ${rx - w} ${y - 2} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        {iris(lx)}{iris(rx)}
      </g>
    );
  }
  if (style === "downturned") {
    return (
      <g>
        <path d={`M${lx - w} ${y - 2} Q${lx} ${y - 3} ${lx + w} ${y + 1} Q${lx} ${y + 3} ${lx - w} ${y - 2} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        <path d={`M${rx - w} ${y + 1} Q${rx} ${y - 3} ${rx + w} ${y - 2} Q${rx} ${y + 3} ${rx - w} ${y + 1} Z`} fill={sclera} stroke={INK} strokeWidth="1.3" />
        {iris(lx)}{iris(rx)}
      </g>
    );
  }
  if (style === "hooded") {
    return (
      <g>
        <ellipse cx={lx} cy={y + 0.5} rx={w} ry={h - 1} fill={sclera} stroke={INK} strokeWidth="1.3" />
        <ellipse cx={rx} cy={y + 0.5} rx={w} ry={h - 1} fill={sclera} stroke={INK} strokeWidth="1.3" />
        <path d={`M${lx - w} ${y - 2} Q${lx} ${y - 4} ${lx + w} ${y - 2}`} fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        <path d={`M${rx - w} ${y - 2} Q${rx} ${y - 4} ${rx + w} ${y - 2}`} fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        {iris(lx)}{iris(rx)}
      </g>
    );
  }
  if (style === "sharp") {
    return (
      <g>
        <path d={`M${lx - w} ${y + 1} L${lx + w} ${y - 2} L${lx + w} ${y + 1} Z`} fill={INK} />
        <path d={`M${rx - w} ${y - 2} L${rx + w} ${y + 1} L${rx - w} ${y + 1} Z`} fill={INK} />
      </g>
    );
  }
  if (style === "round") {
    return (
      <g>
        <circle cx={lx} cy={y} r={5} fill={sclera} stroke={INK} strokeWidth="1.4" />
        <circle cx={rx} cy={y} r={5} fill={sclera} stroke={INK} strokeWidth="1.4" />
        {iris(lx)}{iris(rx)}
        {lashes(lx, "M85 95 L88 93")}
        {lashes(rx, "M85 95 L88 93")}
      </g>
    );
  }
  // almond (default)
  return (
    <g>
      <path d={`M${lx - w} ${y} Q${lx} ${y - 4} ${lx + w} ${y} Q${lx} ${y + 3.5} ${lx - w} ${y} Z`} fill={sclera} stroke={INK} strokeWidth="1.4" />
      <path d={`M${rx - w} ${y} Q${rx} ${y - 4} ${rx + w} ${y} Q${rx} ${y + 3.5} ${rx - w} ${y} Z`} fill={sclera} stroke={INK} strokeWidth="1.4" />
      {iris(lx)}{iris(rx)}
    </g>
  );
}

function Brows({ style, color }: { style: string; color: string }) {
  const s = { fill: color, stroke: INK, strokeWidth: 0.8, strokeLinejoin: "round" as const };
  switch (style) {
    case "arched":
      return (
        <g {...s}>
          <path d="M72 86 Q80 81 90 84 Q82 84 72 88 Z" />
          <path d="M110 84 Q120 81 128 86 Q120 84 110 88 Z" />
        </g>
      );
    case "bold":
      return (
        <g {...s}>
          <path d="M70 88 Q80 82 92 86 L92 91 Q80 87 70 92 Z" />
          <path d="M108 86 Q120 82 130 88 L130 92 Q120 87 108 91 Z" />
        </g>
      );
    case "raised":
      return (
        <g fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
          <path d="M72 84 Q80 80 90 84" />
          <path d="M110 84 Q120 80 128 84" />
        </g>
      );
    case "furrowed":
      return (
        <g fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
          <path d="M72 88 L90 84" />
          <path d="M110 84 L128 88" />
        </g>
      );
    case "thin":
      return (
        <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
          <path d="M74 86 Q82 84 90 86" />
          <path d="M110 86 Q118 84 126 86" />
        </g>
      );
    case "feathered":
      return (
        <g stroke={color} strokeWidth="1" strokeLinecap="round">
          {[0, 3, 6, 9, 12, 15, 18].map((i) => (
            <line key={`l${i}`} x1={72 + i} y1={88 - i * 0.25} x2={73 + i} y2={84 - i * 0.25} />
          ))}
          {[0, 3, 6, 9, 12, 15, 18].map((i) => (
            <line key={`r${i}`} x1={110 + i} y1={84 + i * 0.25} x2={111 + i} y2={88 + i * 0.25} />
          ))}
        </g>
      );
    case "neutral":
    default:
      return (
        <g {...s}>
          <path d="M72 87 Q82 83 90 86 L90 89 Q82 87 72 90 Z" />
          <path d="M110 86 Q118 83 128 87 L128 90 Q118 87 110 89 Z" />
        </g>
      );
  }
}

function Nose({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
      <path d="M100 105 Q97 122 100 128 Q103 130 106 128" />
      <path d="M95 128 Q100 131 105 128" opacity="0.5" />
    </g>
  );
}

function Lips({ style, fill, shadeColor }: { style: string; fill: string; shadeColor: string }) {
  const s = { fill, stroke: INK, strokeWidth: 1.1, strokeLinejoin: "round" as const };
  switch (style) {
    case "smile":
      return (
        <g>
          <path d="M84 138 Q100 152 116 138 Q100 146 84 138 Z" {...s} />
          <path d="M84 138 Q100 134 116 138" fill={shadeColor} opacity="0.5" />
        </g>
      );
    case "slight-smile":
      return (
        <g>
          <path d="M86 140 Q100 146 114 140 Q100 144 86 140 Z" {...s} />
        </g>
      );
    case "smirk":
      return <path d="M86 142 Q100 146 116 138" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />;
    case "neutral":
      return (
        <g>
          <path d="M86 141 Q100 143 114 141 Q100 144 86 141 Z" {...s} />
        </g>
      );
    case "serious":
      return <line x1="86" y1="141" x2="114" y2="141" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />;
    case "pursed":
      return (
        <g>
          <ellipse cx="100" cy="141" rx="8" ry="3" {...s} />
          <path d="M93 141 L107 141" stroke={shadeColor} strokeWidth="0.8" />
        </g>
      );
    case "open":
      return (
        <g>
          <ellipse cx="100" cy="142" rx="8" ry="5" fill="#4a1a1a" stroke={INK} strokeWidth="1.2" />
          <path d="M93 141 Q100 138 107 141" fill={fill} />
          <path d="M93 143 Q100 147 107 143" fill={shadeColor} />
        </g>
      );
    case "grin":
      return (
        <g>
          <path d="M82 138 Q100 152 118 138 Z" fill="#4a1a1a" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M85 139 L115 139" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M82 138 Q100 134 118 138" fill={fill} />
        </g>
      );
    default:
      return <path d="M86 140 Q100 145 114 140" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />;
  }
}

function Freckles({ style, color }: { style: string; color: string }) {
  if (style === "none") return null;
  const dots: [number, number, number][] =
    style === "heavy"
      ? [[80, 112, 1], [86, 116, 0.8], [92, 113, 1], [98, 117, 0.7], [104, 115, 0.9], [110, 113, 1], [116, 116, 0.8], [120, 114, 0.7], [76, 116, 0.7], [88, 119, 0.6], [108, 118, 0.6]]
      : [[84, 115, 0.8], [92, 117, 0.7], [108, 117, 0.7], [116, 115, 0.8]];
  return (
    <g fill={color} opacity="0.7">
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </g>
  );
}

function FacialHair({ style, hairUid }: { style: string; hairUid: string }) {
  const fill = `url(#hair-${hairUid})`;
  switch (style) {
    case "none":
      return null;
    case "stubble":
      return (
        <g fill={INK} opacity="0.25">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={70 + (i * 7) % 60} cy={140 + ((i * 11) % 18)} r="0.6" />
          ))}
        </g>
      );
    case "mustache":
      return (
        <path d="M78 134 Q88 130 100 134 Q112 130 122 134 Q116 140 110 138 Q100 136 90 138 Q84 140 78 134 Z" fill={fill} stroke={INK} strokeWidth="1" />
      );
    case "goatee":
      return (
        <g>
          <path d="M88 144 Q100 148 112 144 Q110 158 100 162 Q90 158 88 144 Z" fill={fill} stroke={INK} strokeWidth="1" />
        </g>
      );
    case "soul-patch":
      return <ellipse cx="100" cy="150" rx="4" ry="3" fill={fill} stroke={INK} strokeWidth="0.9" />;
    case "full-beard":
      return (
        <g>
          <path
            d="M58 118 Q62 156 100 168 Q138 156 142 118 Q138 140 124 142 Q112 138 100 140 Q88 138 76 142 Q62 140 58 118 Z"
            fill={fill}
            stroke={INK}
            strokeWidth="1.2"
          />
          <path d="M78 134 Q88 130 100 134 Q112 130 122 134 Q116 140 110 138 Q100 136 90 138 Q84 140 78 134 Z" fill={fill} stroke={INK} strokeWidth="0.9" />
        </g>
      );
    default:
      return null;
  }
}

function BackHair({ style, hairUid }: { style: string; hairUid: string }) {
  const fill = `url(#hair-${hairUid})`;
  const s = { stroke: INK, strokeWidth: 1.3, strokeLinejoin: "round" as const };
  switch (style) {
    case "long":
      return (
        <path
          d="M48 80 Q44 50 100 38 Q156 50 152 80 L156 200 Q140 180 130 170 L130 110 Q100 100 70 110 L70 170 Q60 180 44 200 Z"
          fill={fill}
          {...s}
        />
      );
    case "ponytail":
      return (
        <g>
          <path d="M50 80 Q50 56 100 46 Q150 56 150 80 L150 110 Q140 100 100 100 Q60 100 50 110 Z" fill={fill} {...s} />
          <path d="M148 80 Q170 110 160 160 Q156 170 148 168 Q152 130 144 100 Z" fill={fill} {...s} />
        </g>
      );
    case "braids":
      return (
        <g>
          <path d="M50 80 Q50 50 100 40 Q150 50 150 80 L150 110 Q100 100 50 110 Z" fill={fill} {...s} />
          <path d="M58 110 L66 200 L74 200 L70 110 Z" fill={fill} {...s} />
          <path d="M126 110 L130 200 L138 200 L142 110 Z" fill={fill} {...s} />
        </g>
      );
    case "locs":
      return (
        <g>
          <path d="M48 80 Q48 50 100 38 Q152 50 152 80 L152 100 Q100 92 48 100 Z" fill={fill} {...s} />
          {[52, 64, 76, 88, 100, 112, 124, 136, 148].map((x, i) => (
            <rect key={i} x={x - 4} y="100" width="6" height={50 + (i % 3) * 18} rx="3" fill={fill} stroke={INK} strokeWidth="1" />
          ))}
        </g>
      );
    case "bob":
      return (
        <path
          d="M50 80 Q50 50 100 40 Q150 50 150 80 L150 140 Q140 150 130 148 L130 110 Q100 100 70 110 L70 148 Q60 150 50 140 Z"
          fill={fill}
          {...s}
        />
      );
    case "wavy":
      return (
        <path
          d="M50 84 Q50 52 100 42 Q150 52 150 84 L152 130 Q140 124 130 130 L130 110 Q100 100 70 110 L70 130 Q60 124 48 130 Z"
          fill={fill}
          {...s}
        />
      );
    case "curly":
      return (
        <g>
          <path d="M46 86 Q44 50 100 36 Q156 50 154 86 L154 120 Q100 110 46 120 Z" fill={fill} {...s} />
          {[[52, 122], [66, 130], [80, 122], [100, 132], [120, 122], [134, 130], [148, 122]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="9" fill={fill} stroke={INK} strokeWidth="1" />
          ))}
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx="100" cy="34" r="14" fill={fill} {...s} />
          <path d="M52 80 Q52 56 100 48 Q148 56 148 80 L148 100 Q100 94 52 100 Z" fill={fill} {...s} />
        </g>
      );
    case "afro":
      return (
        <g>
          <path
            d="M40 96 Q34 40 100 30 Q166 40 160 96 Q156 80 144 78 Q140 64 124 60 Q116 50 100 50 Q84 50 76 60 Q60 64 56 78 Q44 80 40 96 Z"
            fill={fill}
            {...s}
          />
        </g>
      );
    default:
      return null;
  }
}

function FrontHair({ style, hairUid }: { style: string; hairUid: string }) {
  const fill = `url(#hair-${hairUid})`;
  const s = { stroke: INK, strokeWidth: 1.3, strokeLinejoin: "round" as const };
  const hl = (d: string) => <path d={d} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.4" strokeLinecap="round" />;

  switch (style) {
    case "bald":
      return null;
    case "buzz":
      return (
        <g>
          <path d="M54 78 Q54 50 100 44 Q146 50 146 78 Q130 68 100 70 Q70 68 54 78 Z" fill={fill} {...s} opacity="0.85" />
        </g>
      );
    case "short":
      return (
        <g>
          <path d="M52 82 Q52 46 100 40 Q148 46 148 82 Q138 64 124 66 Q110 58 100 60 Q90 58 76 66 Q62 64 52 82 Z" fill={fill} {...s} />
          {hl("M70 60 Q90 50 110 54")}
        </g>
      );
    case "pixie":
      return (
        <g>
          <path d="M54 80 Q54 44 100 38 Q146 44 146 80 Q138 62 122 64 Q114 56 100 58 Q86 56 74 64 Q60 64 54 80 Z" fill={fill} {...s} />
          <path d="M124 64 Q138 80 142 96" fill="none" stroke={INK} strokeWidth="1.2" />
        </g>
      );
    case "slick":
      return (
        <g>
          <path d="M54 82 Q54 48 100 44 Q148 48 148 82 Q138 66 120 74 Q100 78 80 74 Q60 66 54 82 Z" fill={fill} {...s} />
          {hl("M62 70 Q100 56 138 70")}
        </g>
      );
    case "undercut":
      return (
        <g>
          <path d="M68 80 Q68 44 102 38 Q140 44 142 76 Q120 62 102 64 Q86 62 68 80 Z" fill={fill} {...s} />
          <path d="M54 82 Q54 70 68 80 L142 76 Q146 78 148 84 Q120 78 100 80 Q72 78 54 82 Z" fill={shade(fill.includes("url") ? "#000" : fill, -0.3)} opacity="0.25" />
        </g>
      );
    case "mohawk":
      return (
        <g>
          <path d="M88 60 Q90 18 100 14 Q110 18 112 60 L112 80 Q100 78 88 80 Z" fill={fill} {...s} />
          <path d="M54 84 Q54 76 76 78 L88 80 Q100 80 112 80 L124 78 Q146 76 146 84 Q120 80 100 82 Q80 80 54 84 Z" fill={fill} {...s} opacity="0.7" />
        </g>
      );
    case "wavy":
      return (
        <g>
          <path d="M50 84 Q50 44 100 38 Q150 44 150 84 Q142 70 128 72 Q120 60 100 62 Q80 60 72 72 Q58 70 50 84 Z" fill={fill} {...s} />
          {hl("M62 70 Q82 58 100 62 Q120 58 138 70")}
        </g>
      );
    case "curly":
      return (
        <g>
          <path d="M48 86 Q44 42 100 36 Q156 42 152 86 Q146 72 132 70 Q126 60 110 62 Q100 56 90 62 Q74 60 68 70 Q54 72 48 86 Z" fill={fill} {...s} />
          {[[64, 64], [82, 60], [100, 58], [118, 60], [136, 64]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill={fill} stroke={INK} strokeWidth="1" />
          ))}
        </g>
      );
    case "long":
      return (
        <g>
          <path d="M50 84 Q50 44 100 38 Q150 44 150 84 Q140 66 124 68 Q108 58 100 60 Q92 58 76 68 Q60 66 50 84 Z" fill={fill} {...s} />
          {hl("M62 70 Q100 54 138 70")}
        </g>
      );
    case "bob":
      return (
        <g>
          <path d="M50 86 Q50 46 100 40 Q150 46 150 86 Q142 70 126 72 Q108 60 100 62 Q92 60 74 72 Q58 70 50 86 Z" fill={fill} {...s} />
        </g>
      );
    case "bun":
      return (
        <g>
          <path d="M58 80 Q58 50 100 44 Q142 50 142 80 Q132 64 120 66 Q108 58 100 60 Q92 58 80 66 Q68 64 58 80 Z" fill={fill} {...s} />
        </g>
      );
    case "afro":
      return null; // back hair covers it
    case "braids":
    case "ponytail":
    case "locs":
      return (
        <g>
          <path d="M54 78 Q54 48 100 42 Q146 48 146 78 Q134 64 120 66 Q108 58 100 60 Q92 58 80 66 Q66 64 54 78 Z" fill={fill} {...s} />
        </g>
      );
    default:
      return null;
  }
}

function Glasses({ style }: { style: string }) {
  if (style === "none") return null;
  const s = { fill: "none", stroke: INK, strokeWidth: 1.8, strokeLinecap: "round" as const };
  if (style === "round" || style === "reading") {
    return (
      <g {...s}>
        <circle cx="80" cy="100" r="11" />
        <circle cx="120" cy="100" r="11" />
        <path d="M91 100 L109 100" />
        <path d="M69 100 L60 98" />
        <path d="M131 100 L140 98" />
      </g>
    );
  }
  if (style === "square") {
    return (
      <g {...s}>
        <rect x="68" y="92" width="22" height="16" rx="2" />
        <rect x="110" y="92" width="22" height="16" rx="2" />
        <path d="M90 100 L110 100" />
        <path d="M68 96 L60 94" />
        <path d="M132 96 L140 94" />
      </g>
    );
  }
  if (style === "aviator") {
    return (
      <g {...s}>
        <path d="M68 95 Q80 88 92 95 Q90 110 80 112 Q68 110 68 95 Z" />
        <path d="M108 95 Q120 88 132 95 Q132 110 120 112 Q110 110 108 95 Z" />
        <path d="M92 96 L108 96" />
      </g>
    );
  }
  if (style === "cat-eye") {
    return (
      <g {...s}>
        <path d="M66 96 Q70 88 90 92 Q94 102 88 106 Q72 110 66 96 Z" />
        <path d="M134 96 Q130 88 110 92 Q106 102 112 106 Q128 110 134 96 Z" />
        <path d="M90 98 L110 98" />
      </g>
    );
  }
  return null;
}

function Earrings({ style }: { style: string }) {
  if (style === "none") return null;
  if (style === "stud") {
    return (
      <g>
        <circle cx="54" cy="112" r="2" fill="#e8c84a" stroke={INK} strokeWidth="0.6" />
        <circle cx="146" cy="112" r="2" fill="#e8c84a" stroke={INK} strokeWidth="0.6" />
      </g>
    );
  }
  if (style === "hoop") {
    return (
      <g fill="none" stroke="#e8c84a" strokeWidth="1.5">
        <circle cx="54" cy="116" r="5" />
        <circle cx="146" cy="116" r="5" />
      </g>
    );
  }
  if (style === "drop") {
    return (
      <g>
        <circle cx="54" cy="112" r="1.8" fill="#e8c84a" />
        <ellipse cx="54" cy="120" rx="2" ry="4" fill="#e8c84a" stroke={INK} strokeWidth="0.5" />
        <circle cx="146" cy="112" r="1.8" fill="#e8c84a" />
        <ellipse cx="146" cy="120" rx="2" ry="4" fill="#e8c84a" stroke={INK} strokeWidth="0.5" />
      </g>
    );
  }
  return null;
}

function OutfitDetail({
  base, color, shadeColor, highlight, accent,
}: {
  base: string; color: string; shadeColor: string; highlight: string; accent?: string;
}) {
  const s = { stroke: INK, strokeWidth: 1.2, strokeLinejoin: "round" as const };
  switch (base) {
    case "turtleneck":
      return (
        <g>
          <path d="M80 168 Q100 156 120 168 L120 178 Q100 172 80 178 Z" fill={color} {...s} />
          <path d="M82 174 Q100 178 118 174" fill="none" stroke={shadeColor} strokeWidth="1" />
        </g>
      );
    case "oxford":
      return (
        <g>
          <path d="M84 170 L100 200 L116 170 Z" fill={highlight} {...s} />
          <line x1="100" y1="178" x2="100" y2="232" stroke={shadeColor} strokeWidth="1.2" />
          {[190, 205, 220].map((y) => (
            <circle key={y} cx="100" cy={y} r="1.2" fill={shadeColor} />
          ))}
        </g>
      );
    case "henley":
      return (
        <g>
          <path d="M92 168 L92 200 L108 200 L108 168 Z" fill={highlight} {...s} />
          {[178, 188, 198].map((y) => (
            <circle key={y} cx="100" cy={y} r="1.2" fill={shadeColor} />
          ))}
        </g>
      );
    case "tank":
      return (
        <g>
          <path d="M70 175 Q88 168 100 174 Q112 168 130 175" fill="none" stroke={shadeColor} strokeWidth="1.4" />
        </g>
      );
    case "knit":
      return (
        <g>
          <path d="M80 170 Q100 162 120 170 L120 178 Q100 174 80 178 Z" fill={shadeColor} {...s} opacity="0.7" />
          {[185, 200, 215, 230].map((y) => (
            <path key={y} d={`M${100 - 32} ${y} Q100 ${y - 4} ${100 + 32} ${y}`} fill="none" stroke={shadeColor} strokeWidth="0.8" opacity="0.6" />
          ))}
        </g>
      );
    case "hoodie":
      return (
        <g>
          <path d="M62 170 Q72 156 100 162 Q128 156 138 170 Q120 156 100 158 Q80 156 62 170 Z" fill={shadeColor} {...s} />
          <path d="M90 172 L90 220 L100 230 L110 220 L110 172 Z" fill={highlight} stroke={INK} strokeWidth="1" />
          <line x1="98" y1="180" x2="98" y2="220" stroke={shadeColor} strokeWidth="1" />
          <line x1="102" y1="180" x2="102" y2="220" stroke={shadeColor} strokeWidth="1" />
        </g>
      );
    case "denim-jacket":
      return (
        <g>
          <path d="M84 168 L100 200 L116 168" fill={highlight} {...s} />
          <line x1="100" y1="176" x2="100" y2="232" stroke={shadeColor} strokeWidth="1.4" />
          <path d="M70 200 L78 196 L80 220 L72 224 Z" fill={shadeColor} opacity="0.6" />
          <path d="M130 200 L122 196 L120 220 L128 224 Z" fill={shadeColor} opacity="0.6" />
        </g>
      );
    case "leather":
      return (
        <g>
          <path d="M82 168 L100 188 L82 200 L82 240 L70 240 L70 170 Z" fill={shadeColor} {...s} />
          <path d="M118 168 L100 188 L118 200 L118 240 L130 240 L130 170 Z" fill={shadeColor} {...s} />
          <line x1="100" y1="188" x2="100" y2="240" stroke={INK} strokeWidth="0.8" />
        </g>
      );
    case "blazer":
      return (
        <g>
          <path d="M80 170 L100 196 L120 170 L130 240 L70 240 Z" fill={shadeColor} {...s} opacity="0.85" />
          <path d="M88 240 L100 196 L112 240 Z" fill={accent ?? highlight} {...s} />
          <rect x="116" y="200" width="10" height="2" fill={highlight} opacity="0.4" />
        </g>
      );
    case "trench":
      return (
        <g>
          <path d="M78 168 L100 188 L122 168 L130 240 L70 240 Z" fill={highlight} {...s} />
          <line x1="100" y1="188" x2="100" y2="240" stroke={shadeColor} strokeWidth="1.2" />
          {[200, 215, 230].map((y) => (
            <circle key={y} cx="90" cy={y} r="1.3" fill={shadeColor} />
          ))}
          {[200, 215, 230].map((y) => (
            <circle key={y} cx="110" cy={y} r="1.3" fill={shadeColor} />
          ))}
        </g>
      );
    case "silk-blouse":
      return (
        <g>
          <path d="M84 168 Q92 178 100 180 Q108 178 116 168" fill={highlight} {...s} opacity="0.8" />
          <path d="M88 200 Q100 205 112 200" fill="none" stroke={shadeColor} strokeWidth="0.9" />
        </g>
      );
    case "tee":
    default:
      return (
        <g>
          <path d="M82 170 Q100 178 118 170" fill="none" stroke={shadeColor} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
  }
}

function Hat({ color, color2 }: { color: string; color2?: string }) {
  return (
    <g>
      <ellipse cx="100" cy="48" rx="60" ry="7" fill={color} stroke={INK} strokeWidth="1.4" />
      <path
        d="M62 48 Q62 18 100 14 Q138 18 138 48 Z"
        fill={color}
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {color2 && <rect x="62" y="42" width="76" height="6" fill={color2} stroke={INK} strokeWidth="0.8" />}
      <path d="M70 30 Q86 20 100 22" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.4" fill="none" />
    </g>
  );
}
