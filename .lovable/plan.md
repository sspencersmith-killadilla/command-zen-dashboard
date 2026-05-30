# Themed Companion Expansion

Grow the companion roster from 5 → 30 by adding 25 new avatars, organized into **5 themes** users can browse. Each companion keeps the same data shape we already use (id, name, species, tagline, persona, sprite, glow), so no schema changes are needed beyond tagging each one with a `theme`.

## Themes (5 × 5 = 25 new companions)

Each theme gets 5 companions with distinct personalities mapped to the same five archetypes we already established (Wise mentor, Chill helper, Energetic motivator, Loyal protector, Trickster tough-love), so every user gets a full personality spectrum no matter which theme they pick.

1. **Mythic Chimera** (the current 5 — Barnaby, Bean, Roxie, Pip, Lafitte) — already built, becomes the default theme.
2. **Sports Legends** — anthropomorphic athlete chimeras (e.g. a tiger boxer, a falcon sprinter, a bear linebacker, a wolf goalie, a fox point-guard).
3. **Fantasy Anime** — stylized shōnen/shōjo chimera heroes (e.g. fox-spirit swordsman, dragon-kin mage, cat-girl archer, wolf knight, rabbit ninja).
4. **Cyber / Sci-Fi** — neon cyberpunk chimeras (e.g. raven hacker, lynx pilot, mantis medic, shark mercenary, owl AI-oracle).
5. **Cozy Cottagecore** — warm folk-art chimeras (e.g. hedgehog baker, deer herbalist, badger librarian, sparrow poet, hare gardener).

All 25 are realistically generatable at high quality with the existing image pipeline — same humanoid-chimera style direction, just retuned palette/wardrobe per theme. The current sprites become the Mythic theme so nothing is thrown away.

## UX changes

- **Settings → Companion picker**: add a theme selector (tabs or chips) above the avatar grid. Selecting a theme filters the grid to that theme's 5 companions. Currently-selected companion stays highlighted across themes.
- **Onboarding** (if companion selection is part of it): same theme-then-companion flow.
- No change to chat UI — the selected companion still drives header, persona, and prompt as today.

## Implementation outline

1. **Data** — extend `src/lib/companions.ts`:
   - Add `theme: ThemeId` to each companion.
   - Add a `THEMES` registry: `{ id, label, description, blurb }`.
   - Add 25 new companion entries (5 per new theme) with unique names, taglines, glow colors, and personas reusing the 5 archetype voices.
2. **Assets** — generate 25 new sprite PNGs into `src/assets/<id>-sprite.png`, matching the existing humanoid-chimera style, retuned per theme palette.
3. **Settings UI** — `src/routes/_authenticated/settings.tsx`: add theme tabs, filter the existing grid by active theme. No DB migration needed — `companion_id` already stores the chosen id.
4. **Back-compat** — existing users default to `barnaby` (Mythic), unchanged.
5. **Chat API** — `src/routes/api/chat.ts` already looks up persona by `companion_id`; no change.

## Technical notes

- No new DB columns. `companion_id` text is sufficient; theme is derived from the companions registry.
- Persona archetypes are reused verbatim across themes so voice quality stays consistent without writing 25 bespoke personas.
- Image generation happens once at build time and is committed as static assets — no runtime cost.

## Scope check

If 25 feels like a lot to generate in one pass, I'd recommend shipping in 2 batches: Mythic (already done) + Sports + Fantasy Anime first (10 new), then Cyber + Cottagecore (10 more). Say the word if you'd prefer the staged rollout; otherwise I'll do all 25 in one go.
