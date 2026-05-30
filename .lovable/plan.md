## 1. Classic-game "mumble voice" per companion (Animalese-style)

Each companion gets a distinct synthesized blip-voice — the Animal Crossing / Banjo-Kazooie effect where text scrolls and characters blurt one short blip per syllable. No external API, no secret, no per-play cost. Pure Web Audio API in the browser.

**How it works.** A small `MumbleSynth` (in `src/lib/mumble.ts`) generates a short tone burst per "syllable" of text. Each burst is an oscillator (square / triangle / sawtooth / sine) feeding a band-pass filter + a tiny amplitude envelope (attack 5ms, decay 60–120ms). Tokenizing text into syllables: split on whitespace, then approximate syllables by counting vowel clusters (good enough for English; cheap and offline). Punctuation inserts a short pause; ALL-CAPS or `!` raises pitch a step.

**Per-companion voice config.** Add `voice: MumbleVoice` to the `Companion` type. Fields:
- `waveform`: `square | sawtooth | triangle | sine`
- `basePitchHz`: ~120–600
- `pitchJitter`: random ± semitones per blip (0–4)
- `filterHz`: band-pass center (300–4000)
- `filterQ`: resonance (0.5–12)
- `blipMs`: 50–160
- `rateMs`: gap between blips (40–110)
- `vibrato`: optional `{ hz, cents }`
- `bitcrush`: optional `{ bits }` for chiptune grit

Voices are derived from the 5 persona archetypes and then tinted by theme. Examples:
- *Sage* (Barnaby, Maestro Vance) — low triangle, slow rate, mild vibrato, narrow filter → measured, wise.
- *Chill* (Bean, Halcyon) — soft sine, lower pitch, low filter Q, slow rate → mellow.
- *Hype* (Roxie, Blitz) — bright square, high pitch + jitter, fast rate → frantic.
- *Guardian* (Pip, Stationmaster Bell) — warm triangle, medium pitch, steady rate → solid.
- *Trickster* (Lafitte, Glitch) — sawtooth with bitcrush, big pitch jitter, weirder filter → mischievous.
- Theme tints layered on top: **cyber** companions get bitcrush + higher filter (chiptune); **cottage** get sine + low filter (warm wood-flute); **broadway** get vibrato; **railway** get a quick "chuff" double-blip; **heroes** comic theme gets bright square + reverb-ish slap.

**Client API.**
- `src/lib/mumble.ts` — pure module. Exports `playMumble(companionId, text, opts?)`, `stop()`, `pause()`. One shared `AudioContext`. Auto-stops prior playback when a new one starts.
- `src/lib/use-mumble.ts` — React hook wrapping it with `{ isSpeaking, play, stop }` state.

**UI integration.**
- Small speaker button next to every assistant message in `ChatPanel.tsx` — tap to mumble the message.
- "Auto-mumble" toggle in chat header; when on, new assistant messages mumble as they stream, synced to the typewriter reveal (1 blip per word/syllable as it appears, just like a JRPG).
- Subtle pulsing ring on the companion sprite in the dashboard header while `isSpeaking` is true (reuse the `speaking` prop on `CompanionAvatar.tsx`).
- A "Try voice" play button on the companion picker so users can preview a voice before equipping.

**Out of scope for v1:** real TTS, foreign-language syllable rules, downloadable audio.

## 2. Ethnic diversity for human companions

The 15 human-flavored themes have 5 companions each = 75 human sprites. I will:
1. Audit the existing 75 sprites by visual inspection in a scratch script and flag any roster that reads as ethnically homogeneous.
2. Regenerate flagged sprites with explicit, varied ethnicity prompts (rotating across Black, East Asian, South Asian, Latino, Middle Eastern, Indigenous, White, mixed-heritage) so every 5-character roster covers a meaningful spread. Names, roles, palettes, and 16-bit pixel-art style stay the same — only the depicted person changes.
3. Codify a "diversity rule" comment at the top of the `ENTRIES` array so future companions follow it.

## 3. Three new themes

Add to `src/lib/companions.ts` (THEMES + 5 ENTRIES each), `src/lib/gamification-themes.ts` (ThemePack: arc title, 5 daily-quest labels, 8-rank ladder, achievements, icon, palette), and `src/lib/cosmetics.ts` (4-item themed mastery set each). Each theme gets 5 new sprites.

**Heroes — Comic-book superhero universe.** Palette: ink black + four-color halftone red/yellow/blue.
- Sage *Sentinel Prime* (veteran founding hero) · Chill *Drift* (bored speedster) · Hype *Vox* (sonic-blast rookie) · Guardian *Aegis* (shield-bearer) · Trickster *Quip* (wisecracking anti-hero).
- Daily quests: Patrol the city · Brief HQ · Train in the danger room · Suit up · Save someone.
- Ranks: Cadet → Rookie → Solo → Hero → Avenger → Captain → Icon → Legend.

**Reality TV — Confessionals, alliances, eliminations.** Palette: hot pink + champagne + spotlight white.
- Sage *Host Sterling* · Chill *Producer Mae* · Hype *Brielle* (main-character contestant) · Guardian *Cam-Op Reggie* · Trickster *Villain Edit Vance*.
- Daily quests: Read the brief · Pre-show interview · Strategy session · Confessional · Tribal council.
- Ranks: Pre-show → Cast → Episode 1 → Jury → Final Three → Finale → Champion → All-Stars.

**Modern Professional — calm adult productivity, no franchise / fantasy / mascot energy.** Palette: warm graphite + clay + sage.
- Sage *Dr. Ana Reyes* (executive coach) · Chill *Sam Tran* (ops lead) · Hype *Jules Okafor* (startup founder) · Guardian *Mira Park* (therapist-trained coach) · Trickster *Theo Locke* (strategy consultant).
- Daily quests: Plan the day · Clear the inbox · Do the deep-work block · Take the actual break · Close the loop.
- Ranks: Apprentice → Associate → Manager → Lead → Director → VP → Partner → Principal.
- Copy is grown-up — no XP-as-magic / no quest-mythology vibe. Mumble voices for this theme lean sine/triangle, low jitter — quiet, professional.

## Technical Details

**Files touched (build mode):**
- `src/lib/mumble.ts` *(new)* — Web Audio synth + `playMumble` / `stop`.
- `src/lib/use-mumble.ts` *(new)* — React hook with `{ isSpeaking, play, stop }`.
- `src/lib/companions.ts` — add `voice: MumbleVoice` to type + every entry; add 3 themes + 15 companions; refresh diverse human sprite imports; add diversity rule comment.
- `src/lib/gamification-themes.ts` — 3 new ThemePacks.
- `src/lib/cosmetics.ts` — 3 new mastery sets.
- `src/components/ChatPanel.tsx` — per-message speaker button, auto-mumble toggle, typewriter sync.
- `src/components/CompanionAvatar.tsx` — `speaking?: boolean` for a subtle pulse ring.
- `src/components/Dashboard.tsx` — wire `isSpeaking` to header chip.
- `src/components/CompanionPicker.tsx` (or equivalent) — preview play button.
- `src/assets/` — regenerated diverse human sprites + 15 new theme sprites.

**No secrets, no server route, no extra cost.** All audio is generated locally in the browser.

## Confirm before I build

1. **Mumble scope** — speaker button on chat messages only, or also on the assignment hero card + daily-quest labels?
2. **Diversity audit** — regenerate any sprite the audit flags automatically, or do you want to approve each replacement before it ships?
3. **Modern Professional sprite style** — keep 16-bit pixel-art for consistency with every other theme (recommended), or render this one in a more photoreal pixel style to underline the "adult" tone?