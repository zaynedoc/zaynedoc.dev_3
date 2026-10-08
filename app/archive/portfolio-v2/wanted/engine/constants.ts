/* ── Wanted! game constants ─────────────────────────────────────── */

/** Playfield dimensions (pixels) — 2× the original DS-style window */
export const FIELD_W = 960;
export const FIELD_H = 720;

/** Title bar height */
export const TITLE_BAR_H = 40;

/** Sprite display size (pixels) */
export const SPRITE_W = 64;
export const SPRITE_H = 64;

/** Timer settings */
export const ROUND_TIME_S = 20;
export const PENALTY_S = 1;

/** Intro reveal duration (ms) */
export const REVEAL_MS = 2000;

/**
 * Decoy system — 3 decoy sprite types per round,
 * each repeated a random number of times within this range.
 */
export const DECOY_TYPES = 3;
export const DECOY_REPEAT_MIN = 45;
export const DECOY_REPEAT_MAX = 65;

/** Number of copies of the target sprite in the field */
export const TARGET_COUNT = 1;

/** Max rounds before "win" */
export const MAX_ROUNDS = 10;

/** Speed range (pixels per second) */
export const MIN_SPEED = 30;
export const MAX_SPEED = 120;

/** Delay after won/lost before transitioning (ms) */
export const RESULT_DELAY_MS = 1500;

/** Big-target gimmick scroll speed (px/s) — increase for faster scroll-in */
export const BIG_TARGET_SPEED = 80;

/* ── Difficulty scaling ────────────────────────────────────────── *
 * Each value is [round1, round10]. Linearly interpolated.         */
export const SCALE = {
  /** Multiplier on DECOY_REPEAT range (more sprites per type) */
  decoyMultiplier: [0.6, 1.0] as [number, number],
  /** Multiplier on speed range (faster movement) */
  speedMultiplier: [0.7, 1.0] as [number, number],
  /** Timer seconds (more time early, less late) */
  timerSeconds:    [25, 16] as [number, number],
} as const;

/** Linearly interpolate a [round1, round10] pair for a given round */
export function lerpScale(pair: readonly [number, number], round: number): number {
  const t = Math.min((round - 1) / (MAX_ROUNDS - 1), 1);
  return pair[0] + (pair[1] - pair[0]) * t;
}
