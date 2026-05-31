import type { CosmeticItem } from "@/lib/cosmetics";

/**
 * Hand-tuned SVG glyphs for each cosmetic item. Each glyph takes the item's
 * primary color (and optional secondary color for trim) and renders a small
 * recognizable silhouette — a cap looks like a cap, a fedora like a fedora,
 * a pin like a pin, etc. Picked by item id so identical-slot items still
 * look distinct.
 */
export function CosmeticIcon({ item, size = 40 }: { item: CosmeticItem; size?: number }) {
  const c1 = item.color;
  const c2 = item.color2 ?? shade(item.color, -0.25);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <Glyph id={item.id} name={item.name} slot={item.slot} c1={c1} c2={c2} />
    </svg>
  );
}

function Glyph({
  id, name, slot, c1, c2,
}: { id: string; name: string; slot: string; c1: string; c2: string }) {
  // ── Hats ───────────────────────────────────────────────────────
  if (id === "l-mythic-cap") return <Diadem c1={c1} c2={c2} />;
  if (id === "l-rea-cap") return <Crown c1={c1} c2={c2} confetti />;
  if (id === "u-crown-laurel") return <LaurelCrown c1={c1} c2={c2} />;
  if (/diadem|crown/i.test(name)) return <Crown c1={c1} c2={c2} />;
  if (/beanie/i.test(name)) return <Beanie c1={c1} c2={c2} />;
  if (/fedora/i.test(name)) return <Fedora c1={c1} c2={c2} />;
  if (/visor/i.test(name)) return <Visor c1={c1} c2={c2} />;
  if (/headset/i.test(name)) return <Headset c1={c1} c2={c2} />;
  if (/hood|cowl/i.test(name)) return <Hood c1={c1} c2={c2} />;
  if (/crop/i.test(name) && slot === "hat") return <HairCrop c1={c1} c2={c2} />;
  if (/trucker/i.test(name)) return <TruckerCap c1={c1} c2={c2} />;
  if (slot === "hat") return <BaseballCap c1={c1} c2={c2} />;

  // ── Tops ───────────────────────────────────────────────────────
  if (id === "l-her-cap") return <Mantle c1={c1} c2={c2} />;
  if (id === "u-cape-onyx") return <Overcoat c1={c1} c2={c2} />;
  if (id === "l-mod-cap") return <AtelierCoat c1={c1} c2={c2} />;
  if (/cloak|cape|mantle/i.test(name)) return <Cape c1={c1} c2={c2} />;
  if (/hoodie/i.test(name)) return <Hoodie c1={c1} c2={c2} />;
  if (/trench|overcoat|chore coat|atelier|field jacket/i.test(name)) return <Trench c1={c1} c2={c2} />;
  if (/bomber/i.test(name)) return <Bomber c1={c1} c2={c2} />;
  if (/letterman/i.test(name)) return <Letterman c1={c1} c2={c2} />;
  if (/blazer|suit/i.test(name)) return <Blazer c1={c1} c2={c2} />;
  if (/lace|blouse/i.test(name)) return <Blouse c1={c1} c2={c2} />;
  if (/crewneck|crew/i.test(name)) return <Crewneck c1={c1} c2={c2} />;
  if (/tee|t-shirt/i.test(name)) return <Tee c1={c1} c2={c2} />;
  if (slot === "top") return <Tee c1={c1} c2={c2} />;

  // ── Accessories ────────────────────────────────────────────────
  if (/championship ring/i.test(name)) return <Ring c1={c1} c2={c2} />;
  if (/medal/i.test(name)) return <Medal c1={c1} c2={c2} />;
  if (/diamond drop/i.test(name)) return <DropEarring c1={c1} c2={c2} />;
  if (/tortoise frames/i.test(name)) return <Eyeglasses c1={c1} c2={c2} />;
  if (/compass/i.test(name)) return <CompassBrooch c1={c1} c2={c2} />;
  if (/laurel/i.test(name)) return <LaurelPin c1={c1} c2={c2} />;
  if (/quill/i.test(name)) return <QuillPin c1={c1} c2={c2} />;
  if (/phoenix/i.test(name)) return <PhoenixPin c1={c1} c2={c2} />;
  if (/dollar|bull-market/i.test(name)) return <DollarPin c1={c1} c2={c2} />;
  if (/emblem|power/i.test(name)) return <EmblemPin c1={c1} c2={c2} />;
  if (/sigil/i.test(name)) return <SigilPin c1={c1} c2={c2} />;
  if (/flame|ember/i.test(name)) return <FlamePin c1={c1} c2={c2} />;
  if (/bolt/i.test(name)) return <BoltPin c1={c1} c2={c2} />;
  if (/star/i.test(name)) return <StarPin c1={c1} c2={c2} />;
  if (slot === "accessory") return <StarPin c1={c1} c2={c2} />;

  // ── Frames ─────────────────────────────────────────────────────
  if (/aurora/i.test(name)) return <Frame c1={c1} c2={c2} aurora />;
  if (/marble/i.test(name)) return <Frame c1={c1} c2={c2} marble />;
  if (/halftone/i.test(name)) return <Frame c1={c1} c2={c2} halftone />;
  if (/spotlight/i.test(name)) return <Frame c1={c1} c2={c2} spotlight />;
  if (/bull frame/i.test(name)) return <Frame c1={c1} c2={c2} arrow />;
  if (/arcane/i.test(name)) return <Frame c1={c1} c2={c2} runes />;
  if (/stadium/i.test(name)) return <Frame c1={c1} c2={c2} stadium />;
  if (/clay/i.test(name)) return <Frame c1={c1} c2={c2} clay />;
  if (/neon/i.test(name)) return <Frame c1={c1} c2={c2} neon />;
  if (/gold/i.test(name)) return <Frame c1={c1} c2={c2} ornate />;
  return <Frame c1={c1} c2={c2} />;
}

// ──────────────────────────────────────────────────────────────────
// Glyph primitives. Each is a 64x64 SVG fragment.
// ──────────────────────────────────────────────────────────────────

const stroke = "#0f172a";

function BaseballCap({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M10 38 Q32 16 54 38 L54 44 L10 44 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M6 44 Q32 50 58 44 L54 48 Q32 54 10 48 Z" fill={c2} stroke={stroke} strokeWidth="1.2" />
      <circle cx="32" cy="22" r="2" fill={c2} />
    </g>
  );
}

function TruckerCap({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M10 38 Q32 16 54 38 L54 44 L10 44 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M6 44 Q32 50 58 44 L54 48 Q32 54 10 48 Z" fill={c2} stroke={stroke} strokeWidth="1.2" />
      <line x1="22" y1="24" x2="22" y2="42" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
      <line x1="32" y1="20" x2="32" y2="42" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
      <line x1="42" y1="24" x2="42" y2="42" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
    </g>
  );
}

function Beanie({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M12 40 Q12 18 32 14 Q52 18 52 40 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <rect x="10" y="40" width="44" height="8" rx="2" fill={c2} stroke={stroke} strokeWidth="1.2" />
      <circle cx="32" cy="12" r="3" fill={c2} stroke={stroke} strokeWidth="1" />
      <line x1="20" y1="22" x2="20" y2="40" stroke={stroke} strokeWidth="0.5" opacity="0.4" />
      <line x1="32" y1="18" x2="32" y2="40" stroke={stroke} strokeWidth="0.5" opacity="0.4" />
      <line x1="44" y1="22" x2="44" y2="40" stroke={stroke} strokeWidth="0.5" opacity="0.4" />
    </g>
  );
}

function Fedora({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M16 36 Q32 18 48 36 L46 38 Q32 30 18 38 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <ellipse cx="32" cy="40" rx="26" ry="5" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M16 40 Q32 44 48 40" fill="none" stroke={c2} strokeWidth="2" />
      <path d="M28 22 L32 18 L36 22" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
    </g>
  );
}

function Visor({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M6 36 Q32 26 58 36 L54 42 Q32 36 10 42 Z" fill={c2} stroke={stroke} strokeWidth="1.2" />
      <path d="M14 36 Q32 28 50 36 L50 32 Q32 26 14 32 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
    </g>
  );
}

function Hood({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M14 46 Q14 14 32 12 Q50 14 50 46 Q40 38 32 38 Q24 38 14 46 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M22 40 Q32 34 42 40 L42 50 Q32 46 22 50 Z" fill={c2} stroke={stroke} strokeWidth="1" opacity="0.7" />
    </g>
  );
}

function HairCrop({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ellipse cx="32" cy="36" rx="22" ry="20" fill={c2} stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <path d="M10 38 Q14 16 32 14 Q50 16 54 38 Q48 22 32 22 Q16 22 10 38 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
    </g>
  );
}

function Headset({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M14 38 Q14 14 32 14 Q50 14 50 38" fill="none" stroke={c1} strokeWidth="3" />
      <rect x="8" y="34" width="10" height="14" rx="2" fill={c1} stroke={stroke} strokeWidth="1" />
      <rect x="46" y="34" width="10" height="14" rx="2" fill={c1} stroke={stroke} strokeWidth="1" />
      <path d="M18 44 Q22 50 28 50" fill="none" stroke={c2} strokeWidth="1.5" />
      <circle cx="30" cy="50" r="2" fill={c2} stroke={stroke} strokeWidth="0.6" />
    </g>
  );
}

function Crown({ c1, c2, confetti }: { c1: string; c2: string; confetti?: boolean }) {
  return (
    <g>
      <path d="M8 44 L14 22 L22 36 L32 18 L42 36 L50 22 L56 44 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <rect x="8" y="44" width="48" height="6" fill={c2} stroke={stroke} strokeWidth="1.2" />
      <circle cx="14" cy="22" r="2.5" fill={c2} stroke={stroke} strokeWidth="0.8" />
      <circle cx="32" cy="18" r="3" fill={c2} stroke={stroke} strokeWidth="0.8" />
      <circle cx="50" cy="22" r="2.5" fill={c2} stroke={stroke} strokeWidth="0.8" />
      {confetti && (
        <>
          <circle cx="12" cy="10" r="1.5" fill={c1} />
          <circle cx="20" cy="6" r="1.5" fill={c2} />
          <circle cx="44" cy="6" r="1.5" fill={c1} />
          <circle cx="54" cy="10" r="1.5" fill={c2} />
        </>
      )}
    </g>
  );
}

function Diadem({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M10 44 Q32 24 54 44 L52 50 Q32 38 12 50 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <circle cx="32" cy="32" r="4" fill={c2} stroke={stroke} strokeWidth="1" />
      <circle cx="20" cy="42" r="2" fill={c2} />
      <circle cx="44" cy="42" r="2" fill={c2} />
    </g>
  );
}

function LaurelCrown({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M14 44 Q14 22 32 18 Q50 22 50 44" fill="none" stroke={c1} strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = -Math.PI + (Math.PI / 5) * (i + 0.5);
        const cx = 32 + Math.cos(a) * 18;
        const cy = 30 + Math.sin(a) * 14;
        return (
          <ellipse
            key={`L${i}`}
            cx={cx} cy={cy} rx="5" ry="2.4"
            fill={c1} stroke={stroke} strokeWidth="0.6"
            transform={`rotate(${(a * 180) / Math.PI + 90} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx="32" cy="20" r="3" fill={c2} stroke={stroke} strokeWidth="0.8" />
    </g>
  );
}

// ── Tops ─────────────────────────────────────────────────────────

function ShirtBase({ c1, neckCutout }: { c1: string; neckCutout: string }) {
  return (
    <path
      d={`M10 26 L22 18 ${neckCutout} L42 18 L54 26 L48 32 L42 28 L42 54 L22 54 L22 28 L16 32 Z`}
      fill={c1}
      stroke={stroke}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  );
}

function Tee({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 22 32 24 Q36 22 40 18" />
      <path d="M28 18 Q32 22 36 18" fill="none" stroke={c2} strokeWidth="1" opacity="0.7" />
    </g>
  );
}

function Crewneck({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 24 32 26 Q36 24 40 18" />
      <path d="M26 19 Q32 26 38 19" fill="none" stroke={c2} strokeWidth="1.5" />
    </g>
  );
}

function Hoodie({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 24 32 26 Q36 24 40 18" />
      <path d="M22 18 Q32 8 42 18 Q36 22 32 22 Q28 22 22 18 Z" fill={c2} stroke={stroke} strokeWidth="1" />
      <line x1="29" y1="28" x2="29" y2="50" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
      <line x1="35" y1="28" x2="35" y2="50" stroke={stroke} strokeWidth="0.6" opacity="0.5" />
    </g>
  );
}

function Bomber({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 22 32 24 Q36 22 40 18" />
      <rect x="22" y="48" width="20" height="6" fill={c2} stroke={stroke} strokeWidth="0.8" />
      <rect x="10" y="30" width="6" height="4" fill={c2} />
      <rect x="48" y="30" width="6" height="4" fill={c2} />
      <line x1="32" y1="26" x2="32" y2="48" stroke={c2} strokeWidth="1" />
    </g>
  );
}

function Trench({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 22 32 26 Q36 22 40 18" />
      <line x1="32" y1="26" x2="32" y2="54" stroke={c2} strokeWidth="1.4" />
      <rect x="24" y="38" width="16" height="3" fill={c2} stroke={stroke} strokeWidth="0.6" />
      <circle cx="29" cy="34" r="0.8" fill={c2} />
      <circle cx="35" cy="34" r="0.8" fill={c2} />
      <circle cx="29" cy="44" r="0.8" fill={c2} />
      <circle cx="35" cy="44" r="0.8" fill={c2} />
    </g>
  );
}

function Letterman({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 22 32 24 Q36 22 40 18" />
      <path d="M10 26 L16 32 L22 28 L22 50 Q16 50 14 46 Z" fill={c2} stroke={stroke} strokeWidth="1" />
      <path d="M54 26 L48 32 L42 28 L42 50 Q48 50 50 46 Z" fill={c2} stroke={stroke} strokeWidth="1" />
      <text x="32" y="42" fontSize="9" fontWeight="800" textAnchor="middle" fill={c2}>L</text>
    </g>
  );
}

function Blazer({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q26 30 32 36 Q38 30 40 18" />
      <path d="M22 18 L30 36 L22 38 Z" fill={shade(c1, -0.18)} stroke={stroke} strokeWidth="0.8" />
      <path d="M42 18 L34 36 L42 38 Z" fill={shade(c1, -0.18)} stroke={stroke} strokeWidth="0.8" />
      <circle cx="30" cy="42" r="1.2" fill={c2} stroke={stroke} strokeWidth="0.5" />
      <circle cx="30" cy="48" r="1.2" fill={c2} stroke={stroke} strokeWidth="0.5" />
    </g>
  );
}

function Blouse({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ShirtBase c1={c1} neckCutout="Q28 24 32 28 Q36 24 40 18" />
      <path d="M26 28 Q32 34 38 28" fill="none" stroke={c2} strokeWidth="1" opacity="0.8" />
      <path d="M28 32 Q32 36 36 32" fill="none" stroke={c2} strokeWidth="0.8" opacity="0.6" />
      <path d="M30 36 Q32 38 34 36" fill="none" stroke={c2} strokeWidth="0.8" opacity="0.5" />
    </g>
  );
}

function Cape({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M14 14 Q32 22 50 14 L56 54 L8 54 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M22 18 L32 14 L42 18 L42 24 L22 24 Z" fill={c2} stroke={stroke} strokeWidth="1" />
      <circle cx="28" cy="20" r="1" fill={c1} />
      <circle cx="36" cy="20" r="1" fill={c1} />
    </g>
  );
}

function Mantle({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M12 16 Q32 28 52 16 L56 54 L8 54 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M20 16 L32 24 L44 16 L40 28 L24 28 Z" fill={c2} stroke={stroke} strokeWidth="1" />
      <path d="M32 24 L32 50" stroke={c2} strokeWidth="1" opacity="0.7" />
    </g>
  );
}

function Overcoat({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M14 18 L24 14 L32 22 L40 14 L50 18 L52 54 L12 54 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M24 14 L30 36 L24 38 Z" fill={c2} stroke={stroke} strokeWidth="0.8" />
      <path d="M40 14 L34 36 L40 38 Z" fill={c2} stroke={stroke} strokeWidth="0.8" />
      <line x1="32" y1="22" x2="32" y2="54" stroke={c2} strokeWidth="1" />
    </g>
  );
}

function AtelierCoat({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M14 18 L24 14 L32 24 L40 14 L50 18 L52 54 L12 54 Z" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <path d="M24 14 L32 24 L24 36 Z" fill={shade(c1, -0.18)} stroke={stroke} strokeWidth="0.6" />
      <path d="M40 14 L32 24 L40 36 Z" fill={shade(c1, -0.18)} stroke={stroke} strokeWidth="0.6" />
      <rect x="22" y="44" width="20" height="3" fill={c2} />
      <circle cx="32" cy="46" r="1.2" fill={c1} stroke={stroke} strokeWidth="0.4" />
    </g>
  );
}

// ── Accessories (pins, jewelry) ──────────────────────────────────

function PinBase({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <circle cx="32" cy="32" r="22" fill="#fafafa" stroke={stroke} strokeWidth="1" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#000" strokeWidth="0.4" opacity="0.15" />
      {children}
    </g>
  );
}

function StarPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <polygon
        points="32,16 36,28 49,28 38,36 42,49 32,41 22,49 26,36 15,28 28,28"
        fill={c1}
        stroke={c2}
        strokeWidth="1"
      />
    </PinBase>
  );
}

function FlamePin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <path
        d="M32 14 Q42 24 40 36 Q40 46 32 50 Q24 46 24 36 Q26 30 28 32 Q26 22 32 14 Z"
        fill={c1}
        stroke={c2}
        strokeWidth="1"
      />
    </PinBase>
  );
}

function BoltPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <polygon
        points="36,14 22,34 30,34 26,50 42,28 34,28 38,14"
        fill={c1}
        stroke={c2}
        strokeWidth="1"
      />
    </PinBase>
  );
}

function LaurelPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <path d="M20 44 Q22 22 32 18 Q42 22 44 44" fill="none" stroke={c1} strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <ellipse cx={22 + i * 1.6} cy={42 - i * 5} rx="4" ry="1.8" fill={c1} transform={`rotate(${-50 + i * 8} ${22 + i * 1.6} ${42 - i * 5})`} />
          <ellipse cx={42 - i * 1.6} cy={42 - i * 5} rx="4" ry="1.8" fill={c1} transform={`rotate(${50 - i * 8} ${42 - i * 1.6} ${42 - i * 5})`} />
        </g>
      ))}
      <circle cx="32" cy="18" r="2" fill={c2} />
    </PinBase>
  );
}

function QuillPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <path
        d="M44 16 Q22 28 18 48 L24 46 Q30 32 46 22 Z"
        fill={c1}
        stroke={c2}
        strokeWidth="1"
      />
      <line x1="22" y1="42" x2="32" y2="32" stroke={c2} strokeWidth="0.8" />
    </PinBase>
  );
}

function CompassBrooch({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <circle cx="32" cy="32" r="14" fill={c1} stroke={c2} strokeWidth="1.2" />
      <polygon points="32,20 35,32 32,44 29,32" fill={c2} />
      <polygon points="20,32 32,29 44,32 32,35" fill={c2} opacity="0.6" />
      <circle cx="32" cy="32" r="2" fill={c2} />
    </PinBase>
  );
}

function PhoenixPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <path
        d="M32 16 Q22 22 18 32 Q26 28 32 30 Q38 28 46 32 Q42 22 32 16 Z"
        fill={c1} stroke={c2} strokeWidth="0.8"
      />
      <path
        d="M22 36 Q26 44 32 48 Q38 44 42 36 Q36 40 32 40 Q28 40 22 36 Z"
        fill={c2} stroke={c1} strokeWidth="0.6"
      />
      <circle cx="32" cy="32" r="2" fill={c2} />
    </PinBase>
  );
}

function DollarPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <circle cx="32" cy="32" r="14" fill={c1} stroke={c2} strokeWidth="1.2" />
      <text x="32" y="38" fontSize="16" fontWeight="800" textAnchor="middle" fill={c2}>$</text>
    </PinBase>
  );
}

function EmblemPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <path d="M32 16 L46 22 L46 38 L32 50 L18 38 L18 22 Z" fill={c1} stroke={c2} strokeWidth="1.2" />
      <polygon points="32,22 36,32 32,42 28,32" fill={c2} />
    </PinBase>
  );
}

function SigilPin({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <PinBase>
      <circle cx="32" cy="32" r="12" fill="none" stroke={c1} strokeWidth="1.5" />
      <path d="M32 22 L36 32 L32 42 L28 32 Z" fill={c1} />
      <path d="M22 32 L32 28 L42 32 L32 36 Z" fill={c1} opacity="0.6" />
    </PinBase>
  );
}

function Medal({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <path d="M22 10 L26 26 L32 30 L38 26 L42 10" fill="none" stroke={c2} strokeWidth="2" />
      <circle cx="32" cy="40" r="14" fill={c1} stroke={stroke} strokeWidth="1.2" />
      <circle cx="32" cy="40" r="9" fill="none" stroke={c2} strokeWidth="1" />
      <text x="32" y="44" fontSize="9" fontWeight="800" textAnchor="middle" fill={c2}>1</text>
    </g>
  );
}

function Ring({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <ellipse cx="32" cy="40" rx="14" ry="10" fill="none" stroke={c1} strokeWidth="3" />
      <path d="M22 28 L32 14 L42 28 Z" fill={c1} stroke={stroke} strokeWidth="1" />
      <polygon points="32,16 36,22 32,28 28,22" fill={c2} stroke={stroke} strokeWidth="0.6" />
    </g>
  );
}

function DropEarring({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <circle cx="32" cy="14" r="3" fill={c2} stroke={stroke} strokeWidth="0.8" />
      <line x1="32" y1="17" x2="32" y2="26" stroke={c2} strokeWidth="1" />
      <polygon points="32,26 42,40 32,54 22,40" fill={c1} stroke={stroke} strokeWidth="1" />
      <polygon points="32,30 38,40 32,50 26,40" fill="none" stroke="#fff" strokeWidth="0.6" opacity="0.7" />
    </g>
  );
}

function Eyeglasses({ c1, c2 }: { c1: string; c2: string }) {
  return (
    <g>
      <circle cx="20" cy="34" r="10" fill="none" stroke={c1} strokeWidth="2.5" />
      <circle cx="44" cy="34" r="10" fill="none" stroke={c1} strokeWidth="2.5" />
      <line x1="30" y1="34" x2="34" y2="34" stroke={c1} strokeWidth="2" />
      <circle cx="20" cy="34" r="7" fill={c2} opacity="0.25" />
      <circle cx="44" cy="34" r="7" fill={c2} opacity="0.25" />
    </g>
  );
}

// ── Frames ───────────────────────────────────────────────────────

function Frame({
  c1, c2,
  aurora, marble, halftone, spotlight, arrow, runes, stadium, clay, neon, ornate,
}: {
  c1: string; c2: string;
  aurora?: boolean; marble?: boolean; halftone?: boolean; spotlight?: boolean;
  arrow?: boolean; runes?: boolean; stadium?: boolean; clay?: boolean; neon?: boolean; ornate?: boolean;
}) {
  return (
    <g>
      {/* picture frame outer */}
      <rect x="8" y="10" width="48" height="44" rx="3" fill={c1} stroke={stroke} strokeWidth="1.2" />
      {aurora && (
        <rect x="8" y="10" width="48" height="44" rx="3" fill="url(#auroraGrad)" opacity="0.9" />
      )}
      <defs>
        <linearGradient id="auroraGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>

      {/* inner photo well */}
      <rect x="14" y="16" width="36" height="32" rx="2" fill="#f7f5ef" stroke={stroke} strokeWidth="0.8" />

      {marble && (
        <>
          <path d="M14 22 Q22 18 30 24 T50 22" stroke={c2} strokeWidth="0.8" fill="none" opacity="0.6" />
          <path d="M14 32 Q24 28 34 34 T50 32" stroke={c2} strokeWidth="0.8" fill="none" opacity="0.5" />
        </>
      )}
      {halftone && (
        <>
          {[18, 24, 30, 36, 42, 48].map((x, i) => (
            <g key={x}>
              {[20, 26, 32, 38, 44].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={1 + ((i + y) % 2) * 0.4} fill={c2} opacity="0.55" />
              ))}
            </g>
          ))}
        </>
      )}
      {spotlight && (
        <>
          <circle cx="22" cy="20" r="2" fill={c2} />
          <path d="M22 22 L18 48 L26 48 Z" fill={c2} opacity="0.45" />
        </>
      )}
      {arrow && (
        <polyline points="16,42 24,32 30,38 38,24 46,18" fill="none" stroke={c2} strokeWidth="2" />
      )}
      {runes && (
        <>
          <text x="32" y="34" fontSize="10" textAnchor="middle" fill={c2} fontFamily="serif">⟁ ✦ ⟁</text>
        </>
      )}
      {stadium && (
        <>
          <ellipse cx="32" cy="40" rx="14" ry="3" fill={c2} opacity="0.5" />
          <line x1="20" y1="18" x2="20" y2="48" stroke={c2} strokeWidth="0.8" />
          <line x1="44" y1="18" x2="44" y2="48" stroke={c2} strokeWidth="0.8" />
        </>
      )}
      {clay && (
        <path d="M14 16 Q16 14 18 16 Q20 18 22 16 Q24 14 26 16" stroke={c2} strokeWidth="0.6" fill="none" opacity="0.6" />
      )}
      {neon && (
        <rect x="14" y="16" width="36" height="32" rx="2" fill="none" stroke={c2} strokeWidth="1.5" opacity="0.9" />
      )}
      {ornate && (
        <>
          <circle cx="14" cy="16" r="2" fill={c2} />
          <circle cx="50" cy="16" r="2" fill={c2} />
          <circle cx="14" cy="48" r="2" fill={c2} />
          <circle cx="50" cy="48" r="2" fill={c2} />
        </>
      )}

      {/* hanging cord */}
      <path d="M22 10 L32 4 L42 10" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.6" />
    </g>
  );
}

// ── Color helpers ────────────────────────────────────────────────

function shade(hex: string, amount: number): string {
  // amount: positive lightens, negative darkens. Returns a hex color.
  const c = hex.replace("#", "");
  const n = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + Math.round(255 * amount)));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
