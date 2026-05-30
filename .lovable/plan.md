# Player avatar + earnable cosmetics — v1 plan

## What ships
1. **Avatar builder** (8+ slots): body type, skin tone, hair style, hair color, eye style, brow style, mouth style, base outfit, background.
2. **Layered pixel renderer** (`PlayerAvatar`) that composes base parts + equipped cosmetics on the fly.
3. **Locker page** (`/locker`): grid of owned cosmetics, equip/unequip per slot, lock chips for unearned items.
4. **Earning rules**: on-time assignment drops + theme-mastery sets.
5. **Header integration**: your avatar appears next to the companion across the dashboard, with an "Edit avatar" button.
6. **Seed catalog**: 10 universal items + 1 small themed set for 3 themes (Finance, Sports, Mythic). More added later on request.

## Data model
**`user_avatar`** — one row per user (RLS, scoped to `auth.uid()`)
- `body_type`, `skin_tone`, `hair_style`, `hair_color`, `eye_style`, `brow_style`, `mouth_style`, `outfit_base`, `background` (text)
- `equipped jsonb` — `{ hat: "...", top: "...", accessory: "...", frame: "..." }`
- `on_time_count int` — drives every-Nth drops
- `mastery_progress jsonb` — `{ themeId: completedArcsCount }`

**`user_inventory`** — earned items
- `user_id`, `item_id`, `source` ('on_time' | 'mastery' | 'seed'), `earned_at`

**Cosmetic catalog** stays as a **static TS file** (`src/lib/cosmetics.ts`) — no DB table. Easier to iterate, no migrations to add new items.

## Earning logic (server-side, in `createServerFn`)
- **On-time completion**: when `clear-assignment` quest completes AND assignment due-date is today or later → `on_time_count++`. Every **3rd** on-time completion → random universal-pool drop.
- **Theme mastery**: when a user completes the full 5-quest arc for the current theme for the **5th** day → unlock that theme's set (4 items: hat, top, accessory, frame).
- All drops surface as a **toast + locker badge** ("New item earned").

## UI shape
```text
/locker
┌──────────────────────────────────────────────┐
│  [Live PlayerAvatar preview]   Edit avatar →│
├──────────────────────────────────────────────┤
│  HAT      TOP     ACCESSORY    FRAME         │
│ [grid of owned items per slot, locked = ░]   │
└──────────────────────────────────────────────┘

/avatar-builder (modal-style page)
8 stepper rows (Body / Skin / Hair style / Hair color /
Eyes / Brows / Mouth / Outfit / Background)
with ← → arrows and a live preview.
```

## Rendering approach (no AI sprite gen needed for v1)
Each base part = a small flat-color SVG/CSS layer; the renderer stacks them inside a fixed 64×64 viewport with `image-rendering: pixelated`. Cosmetics are also CSS/SVG shapes (hat = trapezoid, frame = border, accessory = pin). This keeps the seed lean per the "tiny seed + add later" choice — real PNG sprites can drop in later by swapping the layer source from SVG to `img`.

## Files touched
**New**
- `src/lib/cosmetics.ts` (catalog + slot defs + earning helpers)
- `src/lib/avatar.functions.ts` (`getMyAvatar`, `updateAvatar`, `equipItem`, `unequipItem`)
- `src/lib/avatar.server.ts` (drop-roll + mastery helpers)
- `src/components/PlayerAvatar.tsx` (layered renderer)
- `src/components/AvatarBuilder.tsx` (8-slot stepper UI)
- `src/routes/_authenticated/locker.tsx`
- `src/routes/_authenticated/avatar.tsx`

**Edited**
- `src/components/Dashboard.tsx` (header: PlayerAvatar + Locker link)
- `src/lib/gamification.ts` (hook into quest completion to trigger drops)
- New migration: `user_avatar`, `user_inventory` tables + GRANTs + RLS

## What's NOT in v1
- AI-generated PNG cosmetic sprites (deferred — system is sprite-ready)
- Soft-punishments (separate request)
- Trading / gifting between users
- Cosmetic rarity tiers beyond `common/themed`

## Out-of-the-box behavior
- New users: prompted to "Create your avatar" on first locker visit; gets 3 seed items automatically.
- Existing users: avatar row auto-created with defaults on first request.

After plan approval I'll run the migration, then ship all files in one batch.