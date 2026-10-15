/* ================================================================
   1118 Game Engine — Spritesheet Loader
   Loads PNG atlases and provides drawFrame() to blit a single
   TILE×TILE cell onto a canvas context.
   ================================================================ */

import { TILE } from "./constants";

/** Cache so we never load the same image twice. */
const cache = new Map<string, HTMLImageElement>();

/**
 * Load (or return cached) HTMLImageElement for a spritesheet path.
 * `src` can be:
 *   - an imported StaticImageData `.src`  (e.g. from next/image import)
 *   - a public-folder path like "/images/game/forest.png"
 */
export function loadSheet(src: string): Promise<HTMLImageElement> {
  const existing = cache.get(src);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw a single tile frame from a spritesheet onto a canvas.
 *
 * @param ctx    - Canvas 2D context
 * @param sheet  - Already-loaded HTMLImageElement
 * @param col    - Column in the sheet (0-based)
 * @param row    - Row in the sheet (0-based)
 * @param dx     - Destination X on canvas
 * @param dy     - Destination Y on canvas
 * @param flipX  - If true, draw the tile mirrored horizontally
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  col: number,
  row: number,
  dx: number,
  dy: number,
  flipX = false
) {
  const sx = col * TILE;
  const sy = row * TILE;

  if (flipX) {
    ctx.save();
    // Translate so the tile's centre mirrors correctly
    ctx.translate(dx + TILE, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(sheet, sx, sy, TILE, TILE, 0, 0, TILE, TILE);
    ctx.restore();
  } else {
    ctx.drawImage(sheet, sx, sy, TILE, TILE, dx, dy, TILE, TILE);
  }
}

/**
 * Info helper — returns how many columns/rows a loaded sheet has.
 */
export function sheetDimensions(sheet: HTMLImageElement) {
  return {
    cols: Math.floor(sheet.width / TILE),
    rows: Math.floor(sheet.height / TILE),
  };
}