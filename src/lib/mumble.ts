// Classic-game "mumble voice" synth. Pure Web Audio — no network calls.
// Per-companion voice config is derived from persona archetype (by unlockLevel)
// and lightly tinted by theme. Use playMumble(companionId, text) to play, stop() to halt.

import { getCompanion, type ThemeId } from "./companions";

export type Waveform = "square" | "sawtooth" | "triangle" | "sine";

export type MumbleVoice = {
  waveform: Waveform;
  basePitchHz: number;
  pitchJitter: number; // ± semitones per blip
  filterHz: number;
  filterQ: number;
  blipMs: number;
  rateMs: number;
  vibrato?: { hz: number; cents: number };
  /** Subjective gain 0..1. */
  gain: number;
};

// ---- persona archetypes (Sage/Chill/Hype/Guardian/Trickster) ----
// We infer archetype from unlockLevel (every theme follows the same 1..5 order).

const SAGE: MumbleVoice =     { waveform: "triangle", basePitchHz: 180, pitchJitter: 1, filterHz: 1200, filterQ: 3, blipMs: 110, rateMs: 95, vibrato: { hz: 5, cents: 12 }, gain: 0.18 };
const CHILL: MumbleVoice =    { waveform: "sine",     basePitchHz: 160, pitchJitter: 1, filterHz: 900,  filterQ: 1.5, blipMs: 130, rateMs: 105, gain: 0.2 };
const HYPE: MumbleVoice =     { waveform: "square",   basePitchHz: 420, pitchJitter: 3, filterHz: 2400, filterQ: 4, blipMs: 60,  rateMs: 50, gain: 0.14 };
const GUARDIAN: MumbleVoice = { waveform: "triangle", basePitchHz: 240, pitchJitter: 1.5, filterHz: 1500, filterQ: 2, blipMs: 95, rateMs: 80, gain: 0.18 };
const TRICKSTER: MumbleVoice ={ waveform: "sawtooth", basePitchHz: 280, pitchJitter: 4, filterHz: 1800, filterQ: 6, blipMs: 80, rateMs: 65, gain: 0.14 };

const PERSONAS = [SAGE, CHILL, HYPE, GUARDIAN, TRICKSTER];

// ---- theme tints ----
// Multipliers/overrides applied on top of the base persona voice.

const THEME_TINT: Partial<Record<ThemeId, Partial<MumbleVoice>>> = {
  cyber:    { waveform: "square",   filterHz: 2800, filterQ: 8 },             // chiptune
  cottage:  { waveform: "sine",     filterHz: 700,  filterQ: 1 },              // warm flute
  broadway: { vibrato: { hz: 6, cents: 30 } },                                 // theatrical
  railways: { blipMs: 70, rateMs: 60 },                                        // chuffy double-tick feel
  anime:    { pitchJitter: 3 },
  cards:    { waveform: "triangle" },
  museum:   { filterHz: 800, filterQ: 1.5 },
  library:  { waveform: "sine", gain: 0.13 },                                  // hushed
  finance:  { waveform: "triangle", filterHz: 1100 },
  weather:  { vibrato: { hz: 4, cents: 18 } },
  // new themes
  heroes:   { waveform: "square", filterHz: 2200, filterQ: 5 },                // bright comic punch
  reality:  { vibrato: { hz: 7, cents: 25 }, filterHz: 2000 },                 // sparkly, telegenic
  modern:   { waveform: "sine", pitchJitter: 0.5, filterHz: 1000, gain: 0.14 }, // quiet, professional
};

export function voiceFor(companionId: string | null | undefined): MumbleVoice {
  const c = getCompanion(companionId);
  const idx = Math.min(Math.max(c.unlockLevel, 1), 5) - 1;
  const base = PERSONAS[idx];
  const tint = THEME_TINT[c.theme] ?? {};
  return { ...base, ...tint };
}

// ---- syllable approximation ----

const VOWELS = /[aeiouyAEIOUY]+/g;

function syllableCount(word: string): number {
  const trimmed = word.replace(/[^a-zA-Z]/g, "");
  if (!trimmed) return 0;
  const m = trimmed.match(VOWELS);
  return Math.max(1, m ? m.length : 1);
}

type Beat = { kind: "blip" | "pause"; ms?: number; pitchShift?: number };

function textToBeats(text: string): Beat[] {
  const beats: Beat[] = [];
  // Tokenize into words and punctuation runs.
  const tokens = text.match(/[A-Za-z']+|[.!?,;:—–-]+|\s+/g) ?? [];
  for (const tok of tokens) {
    if (/^\s+$/.test(tok)) continue;
    if (/^[.!?]+$/.test(tok)) { beats.push({ kind: "pause", ms: 220 }); continue; }
    if (/^[,;:—–-]+$/.test(tok)) { beats.push({ kind: "pause", ms: 110 }); continue; }
    const syls = syllableCount(tok);
    const allCaps = tok === tok.toUpperCase() && tok.length > 1;
    const pitchShift = allCaps ? 2 : 0;
    for (let i = 0; i < syls; i++) {
      beats.push({ kind: "blip", pitchShift });
    }
    beats.push({ kind: "pause", ms: 50 }); // brief inter-word gap
  }
  return beats;
}

// ---- audio context (lazy, shared) ----

let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx) {
    const AC: typeof AudioContext = (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _ctx = new AC();
  }
  if (_ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

// Track active playback so a new play stops the previous.
let activeTimer: ReturnType<typeof setTimeout> | null = null;
let activeNodes: AudioNode[] = [];
let activeStopAt = 0;

export function stop() {
  if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
  for (const n of activeNodes) { try { (n as OscillatorNode).stop?.(); } catch { /* noop */ } try { n.disconnect(); } catch { /* noop */ } }
  activeNodes = [];
}

function semitones(base: number, st: number): number {
  return base * Math.pow(2, st / 12);
}

function scheduleBlip(ctx: AudioContext, voice: MumbleVoice, startAt: number, durSec: number, extraPitchShift: number) {
  const osc = ctx.createOscillator();
  const filt = ctx.createBiquadFilter();
  const env = ctx.createGain();

  filt.type = "bandpass";
  filt.frequency.value = voice.filterHz;
  filt.Q.value = voice.filterQ;

  osc.type = voice.waveform;
  const jitter = (Math.random() * 2 - 1) * voice.pitchJitter + extraPitchShift;
  osc.frequency.value = semitones(voice.basePitchHz, jitter);

  // Tiny vibrato — slight LFO on detune
  if (voice.vibrato) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = voice.vibrato.hz;
    lfoGain.gain.value = voice.vibrato.cents; // detune is in cents
    lfo.connect(lfoGain).connect(osc.detune);
    lfo.start(startAt);
    lfo.stop(startAt + durSec);
    activeNodes.push(lfo, lfoGain);
  }

  // Envelope: 5ms attack, exponential decay
  env.gain.value = 0;
  env.gain.setValueAtTime(0, startAt);
  env.gain.linearRampToValueAtTime(voice.gain, startAt + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, startAt + durSec);

  osc.connect(filt).connect(env).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + durSec + 0.02);
  activeNodes.push(osc, filt, env);
}

export function playMumble(
  companionId: string | null | undefined,
  text: string,
  opts: { onEnd?: () => void } = {},
): { stop: () => void; durationMs: number } {
  stop(); // cancel any previous playback
  const voice = voiceFor(companionId);
  const beats = textToBeats(text || "");
  const ctx = getCtx();
  const t0 = ctx.currentTime + 0.02;
  let cursor = t0;
  for (const b of beats) {
    if (b.kind === "blip") {
      const durSec = voice.blipMs / 1000;
      scheduleBlip(ctx, voice, cursor, durSec, b.pitchShift ?? 0);
      cursor += (voice.blipMs + voice.rateMs) / 1000;
    } else {
      cursor += (b.ms ?? 80) / 1000;
    }
  }
  const totalMs = Math.max(0, (cursor - t0) * 1000);
  activeStopAt = Date.now() + totalMs;
  activeTimer = setTimeout(() => {
    activeTimer = null;
    activeNodes = [];
    opts.onEnd?.();
  }, totalMs + 50);
  return { stop, durationMs: totalMs };
}

export function isMumbling(): boolean {
  return activeTimer !== null && Date.now() < activeStopAt;
}
