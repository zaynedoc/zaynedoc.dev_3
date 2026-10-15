/* ================================================================
   1118 Game Engine — Constants
   ================================================================ */

/** Pixel size of one tile in the spritesheet AND on the canvas. */
export const TILE = 16;

/** Viewport width in pixels (hardcoded canvas size). */
export const VIEW_W = 384; // 24 tiles

/** Viewport height in pixels. */
export const VIEW_H = 288; // 18 tiles

/** Viewport width in tiles. */
export const VIEW_COLS = VIEW_W / TILE; // 24

/** Viewport height in tiles. */
export const VIEW_ROWS = VIEW_H / TILE; // 18

/** Player walk speed in pixels per second. */
export const PLAYER_SPEED = 80;

/** Animation: frames per walk-cycle step. */
export const ANIM_FRAME_DURATION = 0.15; // seconds

/**
 * Camera deadzone — the "inner box" in pixels.
 * When the player passes outside this box (relative to the viewport centre),
 * the camera scrolls to keep them inside.
 * Kept tight (~10% of viewport) so the camera stays close to the player.
 */
export const CAM_DEADZONE = {
  halfW: Math.floor(VIEW_W * 0.1), // ~64 px each side of centre
  halfH: Math.floor(VIEW_H * 0.1), // ~48 px each side of centre
};

/** Duration of the fade-to-black room transition (seconds). */
export const FADE_DURATION = 0.4;