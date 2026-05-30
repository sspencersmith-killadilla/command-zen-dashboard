import {
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_BASES,
  BACKGROUNDS,
  getCosmetic,
  type AvatarParts,
  type EquippedMap,
} from "@/lib/cosmetics";

type Size = "sm" | "md" | "lg" | "xl";
const PX: Record<Size, number> = { sm: 40, md: 56, lg: 96, xl: 160 };

function look<T extends { id: string; color: string }>(arr: readonly T[], id: string, fb: string) {
  return arr.find((x) => x.id === id)?.color ?? fb;
}

/**
 * Pure-SVG player avatar. 64×64 viewBox, pixel-aligned shapes, layered
 * back→front: background → frame → body → outfit → top cosmetic → mouth
 * → eyes/brows → hair → hat → accessory. No external sprite assets.
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
  const skin = look(SKIN_TONES, parts.skin_tone, "#c98a5e");
  const hair = look(HAIR_COLORS, parts.hair_color, "#4a2c14");
  const outfit = look(OUTFIT_BASES, parts.outfit_base, "#1f3a6e");
  const bg = look(BACKGROUNDS, parts.background, "#a8c6e8");

  const hatItem = getCosmetic(equipped.hat);
  const topItem = getCosmetic(equipped.top);
  const accItem = getCosmetic(equipped.accessory);
  const frmItem = getCosmetic(equipped.frame);

  const bodyWidth = parts.body_type === "broad" ? 36 : parts.body_type === "slim" ? 26 : 30;
  const bodyX = (64 - bodyWidth) / 2;

  return (
    <div
      className={`relative inline-block ${animate ? "companion-frame" : ""} ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <div className={animate ? "absolute inset-0 companion-bob" : "absolute inset-0"}>
        <div className={animate ? "absolute inset-0 companion-sway" : "absolute inset-0"}>
          <svg
            viewBox="0 0 64 64"
            width={px}
            height={px}
            shapeRendering="crispEdges"
            style={{ imageRendering: "pixelated", display: "block" }}
          >
            {/* Background */}
            <rect x="0" y="0" width="64" height="64" fill={bg} rx="6" />

            {/* Frame cosmetic */}
            {frmItem && (
              <rect
                x="1"
                y="1"
                width="62"
                height="62"
                rx="6"
                fill="none"
                stroke={frmItem.color}
                strokeWidth="3"
              />
            )}

            {/* Neck + torso */}
            <rect x="28" y="36" width="8" height="6" fill={skin} />
            <rect x={bodyX} y="42" width={bodyWidth} height="22" fill={outfit} />

            {/* Top cosmetic (overlays outfit chest) */}
            {topItem && (
              <>
                <rect x={bodyX} y="42" width={bodyWidth} height="22" fill={topItem.color} />
                {topItem.color2 && (
                  <rect x="30" y="42" width="4" height="22" fill={topItem.color2} />
                )}
              </>
            )}

            {/* Head */}
            <rect x="20" y="14" width="24" height="24" fill={skin} rx="2" />
            {/* Ears */}
            <rect x="18" y="22" width="2" height="6" fill={skin} />
            <rect x="44" y="22" width="2" height="6" fill={skin} />

            {/* Mouth */}
            <Mouth style={parts.mouth_style} />

            {/* Brows */}
            <Brows style={parts.brow_style} />

            {/* Eyes */}
            <Eyes style={parts.eye_style} />

            {/* Hair */}
            <Hair style={parts.hair_style} color={hair} />

            {/* Hat cosmetic */}
            {hatItem && <Hat color={hatItem.color} color2={hatItem.color2} />}

            {/* Accessory cosmetic (small pin on chest) */}
            {accItem && (
              <>
                <rect x="38" y="46" width="3" height="3" fill={accItem.color} />
                <rect x="37" y="47" width="5" height="1" fill={accItem.color} />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

function Eyes({ style }: { style: string }) {
  switch (style) {
    case "narrow":
      return (<>
        <rect x="25" y="26" width="3" height="1" fill="#161616" />
        <rect x="36" y="26" width="3" height="1" fill="#161616" />
      </>);
    case "wide":
      return (<>
        <rect x="25" y="25" width="3" height="3" fill="#fff" />
        <rect x="26" y="26" width="1" height="1" fill="#161616" />
        <rect x="36" y="25" width="3" height="3" fill="#fff" />
        <rect x="37" y="26" width="1" height="1" fill="#161616" />
      </>);
    case "sleepy":
      return (<>
        <rect x="25" y="27" width="3" height="1" fill="#161616" />
        <rect x="36" y="27" width="3" height="1" fill="#161616" />
      </>);
    case "sharp":
      return (<>
        <rect x="25" y="26" width="3" height="1" fill="#161616" />
        <rect x="24" y="27" width="1" height="1" fill="#161616" />
        <rect x="36" y="26" width="3" height="1" fill="#161616" />
        <rect x="39" y="27" width="1" height="1" fill="#161616" />
      </>);
    case "round":
    default:
      return (<>
        <rect x="25" y="26" width="2" height="2" fill="#161616" />
        <rect x="37" y="26" width="2" height="2" fill="#161616" />
      </>);
  }
}

function Brows({ style }: { style: string }) {
  switch (style) {
    case "raised":
      return (<>
        <rect x="25" y="23" width="3" height="1" fill="#161616" />
        <rect x="36" y="23" width="3" height="1" fill="#161616" />
      </>);
    case "furrowed":
      return (<>
        <rect x="25" y="24" width="3" height="1" fill="#161616" />
        <rect x="36" y="24" width="3" height="1" fill="#161616" />
        <rect x="27" y="25" width="1" height="1" fill="#161616" />
        <rect x="36" y="25" width="1" height="1" fill="#161616" />
      </>);
    case "thin":
      return (<>
        <rect x="26" y="24" width="2" height="1" fill="#161616" />
        <rect x="36" y="24" width="2" height="1" fill="#161616" />
      </>);
    case "neutral":
    default:
      return (<>
        <rect x="25" y="24" width="3" height="1" fill="#161616" />
        <rect x="36" y="24" width="3" height="1" fill="#161616" />
      </>);
  }
}

function Mouth({ style }: { style: string }) {
  switch (style) {
    case "smirk":
      return (<>
        <rect x="30" y="32" width="4" height="1" fill="#161616" />
        <rect x="34" y="31" width="1" height="1" fill="#161616" />
      </>);
    case "neutral":
      return <rect x="29" y="32" width="6" height="1" fill="#161616" />;
    case "open":
      return <rect x="30" y="32" width="4" height="2" fill="#161616" />;
    case "grin":
      return (<>
        <rect x="29" y="32" width="6" height="1" fill="#161616" />
        <rect x="30" y="33" width="4" height="1" fill="#fff" />
      </>);
    case "smile":
    default:
      return (<>
        <rect x="30" y="32" width="4" height="1" fill="#161616" />
        <rect x="29" y="31" width="1" height="1" fill="#161616" />
        <rect x="34" y="31" width="1" height="1" fill="#161616" />
      </>);
  }
}

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "bald":
      return null;
    case "buzz":
      return <rect x="20" y="14" width="24" height="3" fill={color} />;
    case "wavy":
      return (<>
        <rect x="20" y="13" width="24" height="5" fill={color} />
        <rect x="19" y="14" width="2" height="6" fill={color} />
        <rect x="43" y="14" width="2" height="6" fill={color} />
      </>);
    case "long":
      return (<>
        <rect x="20" y="13" width="24" height="6" fill={color} />
        <rect x="18" y="14" width="2" height="20" fill={color} />
        <rect x="44" y="14" width="2" height="20" fill={color} />
      </>);
    case "bun":
      return (<>
        <rect x="20" y="14" width="24" height="4" fill={color} />
        <rect x="28" y="10" width="8" height="5" fill={color} rx="1" />
      </>);
    case "afro":
      return (<>
        <rect x="17" y="11" width="30" height="9" fill={color} rx="3" />
      </>);
    case "mohawk":
      return (<>
        <rect x="20" y="14" width="24" height="2" fill={color} />
        <rect x="30" y="8" width="4" height="8" fill={color} />
      </>);
    case "short":
    default:
      return (<>
        <rect x="20" y="13" width="24" height="4" fill={color} />
        <rect x="20" y="14" width="3" height="4" fill={color} />
      </>);
  }
}

function Hat({ color, color2 }: { color: string; color2?: string }) {
  return (
    <>
      <rect x="18" y="10" width="28" height="3" fill={color} />
      <rect x="22" y="6" width="20" height="5" fill={color} rx="1" />
      {color2 && <rect x="18" y="12" width="28" height="1" fill={color2} />}
    </>
  );
}
