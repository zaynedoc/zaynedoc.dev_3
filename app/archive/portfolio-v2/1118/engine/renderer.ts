/* ================================================================
   1118 Game Engine — Tile Map Renderer
   Draws visible tiles from the room using the camera offset.
   ================================================================ */

import { TILE, VIEW_W, VIEW_H } from "./constants";
import { wrapCoord } from "./collision";
import { drawFrame } from "./spritesheet";
import type { CameraState, RoomDef } from "./types";

/**
 * Render the tile map layers for the current viewport.
 * Draws only the tiles that overlap the camera rect (+ 1 tile margin).
 *
 * @param ctx       Canvas 2D context
 * @param room      Current room definition
 * @param tileset   Already-loaded tileset HTMLImageElement
 * @param cam       Current camera offset
 * @param sheetCols Number of columns in the tileset sheet
 *                  (used to convert flat tile-index → col,row)
 * @param animFrame Current animation frame counter (0-based).
 *                  Used to pick the active frame from room.animTiles.
 */
/**
 * Render the tile map layers for the current viewport.
 * Draws BG tiles and non-overlay FG tiles only.
 * Overlay FG tiles (tile.overlay === true) are skipped here
 * and drawn later by renderOverlayTiles() so they appear above the player.
 */
export function renderTiles(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  tileset: HTMLImageElement,
  cam: CameraState,
  sheetCols: number,
  animFrame = 0
) {
  const anim = room.animTiles;

  // Determine the visible tile range.
  // For looping axes the range is NOT clamped to [0, cols/rows-1]
  // because the player (and camera) can be at any coordinate;
  // we wrap per-tile below.
  const rawStartCol = Math.floor(cam.x / TILE);
  const rawStartRow = Math.floor(cam.y / TILE);
  const rawEndCol   = Math.floor((cam.x + VIEW_W) / TILE);
  const rawEndRow   = Math.floor((cam.y + VIEW_H) / TILE);

  const startCol = room.loopX ? rawStartCol : Math.max(0, rawStartCol);
  const startRow = room.loopY ? rawStartRow : Math.max(0, rawStartRow);
  const endCol   = room.loopX ? rawEndCol   : Math.min(room.cols - 1, rawEndCol);
  const endRow   = room.loopY ? rawEndRow   : Math.min(room.rows - 1, rawEndRow);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      // Wrap to room dimensions for looping axes
      const wc = room.loopX ? wrapCoord(c, room.cols) : c;
      const wr = room.loopY ? wrapCoord(r, room.rows) : r;
      const tile = room.tiles[wr * room.cols + wc];
      if (!tile) continue;

      const dx = c * TILE - cam.x;
      const dy = r * TILE - cam.y;

      // Background layer
      if (tile.bgTile >= 0) {
        let tileId = tile.bgTile;
        if (anim) {
          const frames = anim[String(tileId)];
          if (frames && frames.length > 1) tileId = frames[animFrame % frames.length];
        }
        const sc = tileId % sheetCols;
        const sr = Math.floor(tileId / sheetCols);
        drawFrame(ctx, tileset, sc, sr, dx, dy, tile.flipX);
      }

      // Foreground layer (non-overlay only — overlay tiles drawn after the player)
      if (tile.fgTile >= 0 && !tile.overlay) {
        let tileId = tile.fgTile;
        if (anim) {
          const frames = anim[String(tileId)];
          if (frames && frames.length > 1) tileId = frames[animFrame % frames.length];
        }
        const sc = tileId % sheetCols;
        const sr = Math.floor(tileId / sheetCols);
        drawFrame(ctx, tileset, sc, sr, dx, dy, tile.flipX);
      }
    }
  }
}

/**
 * Render FG tiles marked as overlay (tile.overlay === true).
 * Call this AFTER renderPlayer() so these tiles appear on top of the player.
 */
export function renderOverlayTiles(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  tileset: HTMLImageElement,
  cam: CameraState,
  sheetCols: number,
  animFrame = 0
) {
  const anim = room.animTiles;

  const rawStartCol = Math.floor(cam.x / TILE);
  const rawStartRow = Math.floor(cam.y / TILE);
  const rawEndCol   = Math.floor((cam.x + VIEW_W) / TILE);
  const rawEndRow   = Math.floor((cam.y + VIEW_H) / TILE);

  const startCol = room.loopX ? rawStartCol : Math.max(0, rawStartCol);
  const startRow = room.loopY ? rawStartRow : Math.max(0, rawStartRow);
  const endCol   = room.loopX ? rawEndCol   : Math.min(room.cols - 1, rawEndCol);
  const endRow   = room.loopY ? rawEndRow   : Math.min(room.rows - 1, rawEndRow);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const wc = room.loopX ? wrapCoord(c, room.cols) : c;
      const wr = room.loopY ? wrapCoord(r, room.rows) : r;
      const tile = room.tiles[wr * room.cols + wc];
      if (!tile || tile.fgTile < 0 || !tile.overlay) continue;

      const dx = c * TILE - cam.x;
      const dy = r * TILE - cam.y;

      let tileId = tile.fgTile;
      if (anim) {
        const frames = anim[String(tileId)];
        if (frames && frames.length > 1) tileId = frames[animFrame % frames.length];
      }
      const sc = tileId % sheetCols;
      const sr = Math.floor(tileId / sheetCols);
      drawFrame(ctx, tileset, sc, sr, dx, dy, tile.flipX);
    }
  }
}

/**
 * Draw a repeating (tiled) background image scrolled to the given offset.
 * The image is drawn at its native resolution and tiled across the viewport.
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  bgImage: HTMLImageElement,
  scrollX: number,
  scrollY: number,
  room: RoomDef,
  cam: CameraState,
) {
  const w = bgImage.width;
  const h = bgImage.height;
  if (w === 0 || h === 0) return;

  // Clip to the map's visible area so the background doesn't
  // bleed into the empty margins of small rooms.
  // For looping axes the world is conceptually infinite, so
  // we use the full viewport extent on those axes.
  const worldW = room.cols * TILE;
  const worldH = room.rows * TILE;
  const mapLeft   = room.loopX ? 0 : Math.max(0, -cam.x);
  const mapTop    = room.loopY ? 0 : Math.max(0, -cam.y);
  const mapRight  = room.loopX ? VIEW_W : Math.min(VIEW_W, worldW - cam.x);
  const mapBottom = room.loopY ? VIEW_H : Math.min(VIEW_H, worldH - cam.y);

  ctx.save();
  ctx.beginPath();
  ctx.rect(mapLeft, mapTop, mapRight - mapLeft, mapBottom - mapTop);
  ctx.clip();

  // Positive modulo so the offset stays in [0, dimension)
  const ox = ((scrollX % w) + w) % w;
  const oy = ((scrollY % h) + h) % h;

  for (let y = -oy; y < VIEW_H; y += h) {
    for (let x = -ox; x < VIEW_W; x += w) {
      ctx.drawImage(bgImage, Math.round(x), Math.round(y));
    }
  }

  ctx.restore();
}
