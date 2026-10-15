/* ================================================================
   1118 Game Engine — Cutscene System
   Manages image-sequence cutscenes during door transitions.
   
   Lifecycle:
     wait → reveal (per image) → fade-out (last image) → done
   
   The cutscene renders on a fully black screen (after the door
   fade-out is complete and the room has switched).
   ================================================================ */

import { VIEW_W, VIEW_H } from "./constants";
import type { CutsceneDef } from "./types";

/* ── State ─────────────────────────────────────────────────────── */

type CutscenePhase =
  | "wait"       // black screen, waiting before first image
  | "showing"    // displaying current image
  | "fade-out"   // fading the last image to black
  | "done";      // cutscene finished

export interface CutsceneState {
  def: CutsceneDef;
  phase: CutscenePhase;
  /** Loaded Image elements (parallel to def.images). */
  images: (HTMLImageElement | null)[];
  /** Index of the currently visible image. */
  imageIdx: number;
  /** Timer accumulator (seconds). */
  timer: number;
  /** Opacity of the current image (0–1). */
  imageAlpha: number;
  /** Whether the reveal sound has been played. */
  revealPlayed: boolean;
}

/* ── Constructor ───────────────────────────────────────────────── */

/**
 * Create a new cutscene state and begin pre-loading all images.
 * Call this when the door fade-out completes and the room has switched.
 */
export function createCutscene(def: CutsceneDef): CutsceneState {
  const images: (HTMLImageElement | null)[] = def.images.map(() => null);

  // Pre-load all images
  def.images.forEach((src, i) => {
    const img = new Image();
    img.src = src;
    img.onload = () => { images[i] = img; };
  });

  return {
    def,
    phase: "wait",
    images,
    imageIdx: 0,
    timer: 0,
    imageAlpha: 0,
    revealPlayed: false,
  };
}

/* ── Update ────────────────────────────────────────────────────── */

/**
 * Advance the cutscene by `dt` seconds.
 * Returns the (possibly updated) state and a flag for whether
 * the reveal sound should play this frame.
 */
export function updateCutscene(
  cs: CutsceneState,
  dt: number,
): { state: CutsceneState; playReveal: boolean } {
  let playReveal = false;
  const waitTime = (cs.def.waitTime ?? 400) / 1000;
  const interval = (cs.def.interval ?? 1500) / 1000;
  const fadeTime = (cs.def.fadeTime ?? 600) / 1000;
  const totalImages = cs.def.images.length;

  let { phase, imageIdx, timer, imageAlpha, revealPlayed } = cs;
  timer += dt;

  switch (phase) {
    case "wait":
      if (timer >= waitTime) {
        phase = "showing";
        timer = 0;
        imageAlpha = 1;
        if (!revealPlayed && cs.def.revealSound) {
          playReveal = true;
          revealPlayed = true;
        }
      }
      break;

    case "showing":
      imageAlpha = 1;
      if (timer >= interval) {
        // Move to next image or start fading the last one
        if (imageIdx < totalImages - 1) {
          imageIdx++;
          timer = 0;
        } else {
          // Last image → start fade-out
          phase = "fade-out";
          timer = 0;
        }
      }
      break;

    case "fade-out":
      imageAlpha = Math.max(0, 1 - timer / fadeTime);
      if (timer >= fadeTime) {
        phase = "done";
        imageAlpha = 0;
      }
      break;

    case "done":
      break;
  }

  return {
    state: { ...cs, phase, imageIdx, timer, imageAlpha, revealPlayed },
    playReveal,
  };
}

/* ── Queries ───────────────────────────────────────────────────── */

export function isCutsceneDone(cs: CutsceneState): boolean {
  return cs.phase === "done";
}

/* ── Render ────────────────────────────────────────────────────── */

/**
 * Draw the cutscene overlay onto the game canvas.
 * Should be called AFTER the normal render (over a black screen).
 */
export function renderCutscene(
  ctx: CanvasRenderingContext2D,
  cs: CutsceneState,
): void {
  // Always fill black first (cutscene plays on a black screen)
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (cs.phase === "wait" || cs.phase === "done") return;

  const img = cs.images[cs.imageIdx];
  if (!img) return; // image not loaded yet — stay on black

  ctx.globalAlpha = cs.imageAlpha;

  // Scale the image to fill the viewport while maintaining aspect ratio (cover)
  const imgAspect = img.width / img.height;
  const viewAspect = VIEW_W / VIEW_H;
  let drawW: number, drawH: number, drawX: number, drawY: number;

  if (imgAspect > viewAspect) {
    // Image is wider — fit height, crop sides
    drawH = VIEW_H;
    drawW = VIEW_H * imgAspect;
    drawX = (VIEW_W - drawW) / 2;
    drawY = 0;
  } else {
    // Image is taller — fit width, crop top/bottom
    drawW = VIEW_W;
    drawH = VIEW_W / imgAspect;
    drawX = 0;
    drawY = (VIEW_H - drawH) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.globalAlpha = 1;
}
