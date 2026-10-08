/* ================================================================
   1118 Game Engine — Fade Transition
   Manages a fade-to-black / fade-from-black overlay for room
   transitions.  Works as a simple state machine:
     idle → fading-out → black (done) → fading-in → clear (done)
   ================================================================ */

import { FADE_DURATION, VIEW_W, VIEW_H } from "./constants";

/* ── State ─────────────────────────────────────────────────────── */

export interface FadeState {
  /** 0 = fully transparent, 1 = fully black. */
  alpha: number;
  /** Whether the fade is currently animating. */
  active: boolean;
  /** Direction: 'out' = going to black, 'in' = coming from black. */
  direction: "out" | "in";
}

/* ── Constructors ──────────────────────────────────────────────── */

export function createFade(): FadeState {
  return { alpha: 0, active: false, direction: "out" };
}

export function startFadeOut(fade: FadeState): FadeState {
  return { alpha: 0, active: true, direction: "out" };
}

export function startFadeIn(fade: FadeState): FadeState {
  return { alpha: 1, active: true, direction: "in" };
}

/* ── Update ────────────────────────────────────────────────────── */

export function updateFade(fade: FadeState, dt: number): FadeState {
  if (!fade.active) return fade;

  const speed = 1 / FADE_DURATION; // alpha change per second
  let alpha = fade.alpha;

  if (fade.direction === "out") {
    alpha = Math.min(1, alpha + speed * dt);
    if (alpha >= 1) return { alpha: 1, active: false, direction: "out" };
  } else {
    alpha = Math.max(0, alpha - speed * dt);
    if (alpha <= 0) return { alpha: 0, active: false, direction: "in" };
  }

  return { ...fade, alpha };
}

/* ── Queries ───────────────────────────────────────────────────── */

/** True when the fade has finished its current animation. */
export function isFadeComplete(fade: FadeState): boolean {
  return !fade.active;
}

/* ── Render ────────────────────────────────────────────────────── */

/** Draw the black overlay at the current alpha. */
export function renderFade(ctx: CanvasRenderingContext2D, fade: FadeState) {
  if (fade.alpha <= 0) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${fade.alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}