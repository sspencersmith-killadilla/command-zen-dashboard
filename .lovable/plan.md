## Goal

Replace the current stepper-only avatar builder with a visually striking, adult-appropriate builder: an editorial-quality illustrated portrait on the left, and a rich tabbed control panel on the right with swatches, thumbnails, and live preview on every change.

## What changes

### 1. Expand the cosmetic catalog (`src/lib/cosmetics.ts`)

Add new option arrays so users have meaningful choices, not 5 cartoon presets:

- `SKIN_TONES`: keep 6, retune to refined illustration palette
- `HAIR_STYLES`: add `pixie`, `bob`, `curly`, `braids`, `ponytail`, `undercut`, `slick`, `locs` (total ~14)
- `HAIR_COLORS`: add `platinum`, `chestnut`, `burgundy`, `ash`, `lavender` (total ~13)
- `EYE_STYLES`: add `almond`, `hooded`, `monolid`, `upturned`, `downturned` (total ~10)
- `EYE_COLORS`: NEW — brown, hazel, green, blue, grey, amber
- `BROW_STYLES`: add `arched`, `bold`, `feathered` (total ~7)
- `FACIAL_HAIR`: NEW slot — none, stubble, goatee, mustache, full-beard, soul-patch
- `MOUTH_STYLES`: add `slight-smile`, `pursed`, `serious` (total ~8)
- `LIP_COLORS`: NEW — natural, berry, red, mauve, gloss
- `FRECKLES`: NEW toggle — none, light, heavy
- `GLASSES`: NEW — none, round-metal, square-acetate, aviator, cat-eye, reading
- `EARRINGS`: NEW — none, stud, hoop, drop
- `OUTFIT_BASES`: expand to ~12 (turtleneck, oxford-shirt, leather-jacket, knit-sweater, denim-jacket, trench, silk-blouse, henley, tank, suit)
- `OUTFIT_COLORS`: NEW palette of 10 colors decoupled from style
- `BACKGROUNDS`: expand to ~12 (add studio-grey, gradient-peach, gradient-indigo, terrazzo, soft-blur, deep-emerald)

Update `AvatarParts` type, `DEFAULT_AVATAR`, and `STEPPER_OPTIONS` accordingly. Add a DB migration column-set or store new fields inside the existing JSON parts column (check `avatar.functions.ts` first; reuse JSON if available).

### 2. Rewrite `src/components/PlayerAvatar.tsx`

Keep the hand-drawn SVG approach but level it up to editorial portrait quality:

- Larger viewBox (200×240) for a true bust framing — head, neck, shoulders, upper torso
- Layered shading: base tone + mid-tone + highlight using soft `<filter>` blurs
- Proper hairline that respects forehead per style
- Separate sub-components for: `Background`, `Body`, `Outfit`, `Neck`, `Head`, `Ears`, `Freckles`, `Eyes` (sclera + iris colored + pupil + highlight + lash line), `Brows`, `Nose`, `Lips` (with color), `FacialHair`, `Hair` (front-layer + back-layer for long styles), `Glasses`, `Earrings`, `Hat`, `Accessory`, `Frame`
- All strokes use ink-brown `#1f1a17` at varying widths for hand-drawn feel
- Add subtle grain overlay via `<feTurbulence>` for paper texture
- Smooth crossfade animation on part changes (CSS transition on opacity layers)

### 3. Redesign `src/routes/_authenticated/avatar.tsx`

Replace the stepper rows with a real builder UI:

```text
+-------------------------------------------------+
| ← Dashboard            Avatar Studio   Locker→  |
+-------------------------------------------------+
|                  |                              |
|   [BIG LIVE      |  [Tabs: Face | Hair | Style |
|    PORTRAIT      |         Accessories | Scene]|
|    ~360px,       |                              |
|    centered      |  Active tab body:            |
|    on tinted     |   - Swatch grid (skin/hair/  |
|    surface]      |     eye/lip/outfit colors)   |
|                  |   - Thumbnail grid (hair     |
|   "Randomize"    |     styles, outfit shapes,   |
|   "Save"         |     glasses, hats)           |
|                  |   - Toggle chips (freckles,  |
|                  |     facial hair, earrings)   |
+-------------------------------------------------+
```

Tabs and their controls:
- **Face** — skin tone (color swatches), eye style (icon grid), eye color (swatches), brow style (icon grid), freckles (chips), nose (subtle, optional)
- **Hair** — hair style (thumbnail grid showing silhouette), hair color (swatches), facial hair (icon grid)
- **Style** — outfit base (thumbnail grid), outfit color (swatches), lip color (swatches)
- **Accessories** — glasses (icon grid), earrings (chips), equipped hat / pin / frame from locker
- **Scene** — background (large color/gradient swatches), body type (3 silhouettes)

Each control:
- Swatch = rounded square w/ color, ring on selection, hover scale
- Thumbnail = mini SVG render of just that part on a neutral head, ring on selection
- Live preview updates instantly via existing `updateParts` optimistic mutation
- "Randomize" button rolls all parts; "Reset" restores defaults

Visual treatment: dark editorial surface (`bg-card` with subtle gradient), serif display heading "Avatar Studio", generous spacing, Awwwards-grade restraint. No childish emojis.

### 4. Database

Inspect `src/lib/avatar.functions.ts` for current persistence shape. If parts are stored as discrete columns, add a migration adding columns: `eye_color`, `lip_color`, `facial_hair`, `freckles`, `glasses`, `earrings`, `outfit_color`. If stored as JSON, no migration needed.

### Technical notes

- Reuse `useAvatar()` hook unchanged — only the part keys grow
- Mini-thumbnail components render the same SVG primitives at small scale for the option grids (no extra assets)
- Keep `EquippedMap`-driven hat/top/accessory/frame layering on top of base parts
- Accessibility: each option button has `aria-label` and `aria-pressed`
- All colors via design tokens where possible; raw hex only in cosmetic data

### Out of scope

- New AI-generated portrait rendering (staying with SVG)
- Photo upload / camera capture
- Body / outfit beyond bust framing
- Animation beyond gentle bob already present
