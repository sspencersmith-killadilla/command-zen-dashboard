## Goal

When the helper companion sends a new message or its voice is playing, briefly show a large floating close-up of its face that bobs and jaw-bounces, then smoothly zooms back out.

## What changes

### 1. New component: `src/components/CompanionCloseup.tsx`

A presentational overlay that renders the companion sprite zoomed in on the face.

- Props: `companionId`, `open` (boolean), `intensity` ("idle" | "speaking"), `onClose?`.
- Layout:
  - `fixed` positioned, centered top-right of the chat panel area (bottom-right on desktop, with safe-area padding). Uses a portal-less fixed div with `z-50`.
  - Circular masked frame ~180px, soft glow ring (reuses `companion.glow`), subtle drop shadow.
  - Inner `<img>` of the sprite scaled ~2.4× and translated up so the face fills the circle (sprites are top-aligned faces — confirmed in `CompanionAvatar.tsx`).
- Animation layers (CSS keyframes added to `src/styles.css`):
  - `closeup-enter`: scale 0.6 → 1, opacity 0 → 1, 240ms ease-out.
  - `closeup-exit`: reverse, 200ms ease-in.
  - `closeup-bob`: vertical translate ±2px, 1.6s infinite — always on.
  - `closeup-jaw`: when `intensity="speaking"`, the inner image gets a fast `scaleY(1 → 1.04 → 0.98 → 1)` cycle on its lower half via `transform-origin: 50% 30%` plus a tiny `translateY` jitter every ~140ms to imply a moving jaw without a real mouth layer.
  - Idle mode (auto-closeup on new message but no voice playing): bob only, no jaw bounce.
- Respects `prefers-reduced-motion`: disables jaw bounce and bob, keeps fade only.

### 2. Wire into `src/components/ChatPanel.tsx`

The chat panel already knows:
- which companion is active (`companion`)
- which message is currently being voiced (`speakingId` from `useMumble`)
- the message list

Add local state + effects:

- `const [closeup, setCloseup] = useState<{ open: boolean; speaking: boolean }>({ open: false, speaking: false })`.
- **Trigger A — new helper message**: track the last seen assistant message id with a ref. When a new assistant message appears (id changes, role is assistant), open the closeup in idle mode and auto-close after 1800ms via a timeout. Skip on the very first mount so it doesn't fire for history.
- **Trigger B — voice playing**: watch `speakingId`. When it transitions from null → some id, open the closeup with `speaking: true` and cancel any pending auto-close. When it transitions back to null, fade out after a short 250ms tail.
- Both triggers: if voice starts during an idle closeup, upgrade to speaking and clear the auto-close timer. The closeup stays open until voice ends.
- Render `<CompanionCloseup companionId={companion.id} open={closeup.open} intensity={closeup.speaking ? "speaking" : "idle"} />` at the root of the panel.

### 3. CSS keyframes

Append to `src/styles.css`:

```css
@keyframes closeup-enter { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
@keyframes closeup-exit  { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.85); } }
@keyframes closeup-bob   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes closeup-jaw   { 0%,100% { transform: scaleY(1) translateY(0); } 40% { transform: scaleY(1.04) translateY(1px); } 70% { transform: scaleY(0.98) translateY(0); } }
```

Plus `prefers-reduced-motion` overrides that zero out bob/jaw.

## Out of scope

- No new sprite art or per-companion mouth assets.
- No audio waveform analysis — jaw bounce is a fixed cadence while `speakingId` is set.
- No changes to the Dashboard sidebar avatar; only the chat experience gets the closeup.
- No global "agent is speaking" indicator outside the chat panel.

## Technical notes

- Uses existing `companions.ts` `sprite` + `glow` fields, no new data.
- Pure presentational + state; no DB or server changes.
- Cleanup: clear any pending timeouts on unmount and when `companion.id` changes (switching companions closes the closeup immediately).
