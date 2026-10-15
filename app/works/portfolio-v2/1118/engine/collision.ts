/* ================================================================
   1118 Game Engine — Collision
   Handles solid walls + 45° slopes.
   ================================================================ */

import { TILE } from "./constants";
import type { CollisionType, RoomDef } from "./types";

/* ── Coordinate wrapping helper ─────────────────────────────── */

/**
 * Positive-modulo wrap.  Returns a value in [0, size).
 * Used for looping room axes so coordinates wrap seamlessly.
 */
export function wrapCoord(val: number, size: number): number {
  return ((val % size) + size) % size;
}

/**
 * Get the collision type for a tile coordinate.
 * For looping axes the coordinate wraps via modulo.
 * Non-looping out-of-bounds = solid (player can't leave the map).
 */
export function getCollision(room: RoomDef, col: number, row: number): CollisionType {
  let c = col;
  let r = row;

  if (room.loopX) {
    c = wrapCoord(c, room.cols);
  } else if (c < 0 || c >= room.cols) {
    return "solid";
  }

  if (room.loopY) {
    r = wrapCoord(r, room.rows);
  } else if (r < 0 || r >= room.rows) {
    return "solid";
  }

  return room.tiles[r * room.cols + c].collision;
}

/**
 * Is the collision type a walkable surface?
 * Slopes are walkable (they adjust Y).
 * Doors and interactables block movement (they are solid barriers
 * that trigger their effects via facing + input, not by stepping on them).
 */
export function isPassable(ct: CollisionType): boolean {
  return ct === "none" || ct === "slope-left" || ct === "slope-right"
    || ct === "slope-left-n" || ct === "slope-right-n";
}

/* ── Axis-separated collision resolver ────────────────────────── */

/**
 * Attempt to move the player from (px,py) by (dx,dy) pixels.
 * Returns the final (px, py) after resolving collisions.
 *
 * The player hitbox is a TILE×TILE square sitting at (px, py).
 * Movement is resolved per-axis (X first, then Y) so the player
 * slides along walls naturally.
 */
export function moveAndCollide(
  room: RoomDef,
  px: number,
  py: number,
  dx: number,
  dy: number
): { x: number; y: number } {
  // ── Resolve X axis ──────────────────────────────────────────
  let nx = px + dx;
  if (dx !== 0) {
    // Leading edge columns
    const edgeX = dx > 0 ? nx + TILE - 1 : nx;
    const col = Math.floor(edgeX / TILE);
    const topRow = Math.floor(py / TILE);
    const botRow = Math.floor((py + TILE - 1) / TILE);

    for (let r = topRow; r <= botRow; r++) {
      const ct = getCollision(room, col, r);
      if (!isPassable(ct)) {
        // Push back to tile boundary
        if (dx > 0) {
          nx = col * TILE - TILE; // right edge of previous tile
        } else {
          nx = (col + 1) * TILE; // left edge of next tile
        }
        break;
      }
    }
  }

  // ── Resolve Y axis ──────────────────────────────────────────
  let ny = py + dy;
  if (dy !== 0) {
    const edgeY = dy > 0 ? ny + TILE - 1 : ny;
    const row = Math.floor(edgeY / TILE);
    const leftCol = Math.floor(nx / TILE);
    const rightCol = Math.floor((nx + TILE - 1) / TILE);

    for (let c = leftCol; c <= rightCol; c++) {
      const ct = getCollision(room, c, row);
      if (!isPassable(ct)) {
        if (dy > 0) {
          ny = row * TILE - TILE;
        } else {
          ny = (row + 1) * TILE;
        }
        break;
      }
    }
  }

  // ── Slope adjustment (south-facing floor slopes) ─────────────
  // Check every slope tile the player's hitbox overlaps.
  // Use the player edge most likely to penetrate each slope
  // direction — this gives physically correct, smooth constraints
  // without gaps at tile boundaries or snapping at vertices.
  {
    const pTopRow   = Math.floor(ny / TILE);
    const pBotRow   = Math.floor((ny + TILE - 1) / TILE);
    const pLeftCol  = Math.floor(nx / TILE);
    const pRightCol = Math.floor((nx + TILE - 1) / TILE);

    for (let r = pTopRow; r <= pBotRow; r++) {
      for (let c = pLeftCol; c <= pRightCol; c++) {
        const ct = getCollision(room, c, r);
        if (ct !== "slope-left" && ct !== "slope-right") continue;

        // slope-right rises to the right → the rightmost overlap pixel
        //   is the most restrictive (deepest penetration into the wall).
        // slope-left  rises to the left  → the leftmost overlap pixel
        //   is the most restrictive.
        const tileLeft  = c * TILE;
        const tileRight = tileLeft + TILE - 1;
        const checkX = ct === "slope-right"
          ? Math.min(nx + TILE - 1, tileRight)
          : Math.max(nx, tileLeft);
        const localX = checkX - tileLeft;

        const slopeHeight = ct === "slope-right" ? localX : TILE - 1 - localX;
        const floorY = r * TILE - slopeHeight;

        if (ny > floorY) ny = floorY;
      }
    }
  }

  // ── North-facing ceiling slopes ─────────────────────────────
  // Same principle: use the player edge that penetrates deepest.
  {
    const pTopRow   = Math.floor(ny / TILE);
    const pBotRow   = Math.floor((ny + TILE - 1) / TILE);
    const pLeftCol  = Math.floor(nx / TILE);
    const pRightCol = Math.floor((nx + TILE - 1) / TILE);

    for (let r = pTopRow; r <= pBotRow; r++) {
      for (let c = pLeftCol; c <= pRightCol; c++) {
        const ctH = getCollision(room, c, r);
        if (ctH !== "slope-left-n" && ctH !== "slope-right-n") continue;

        // slope-left-n ceiling highest at right → check right edge
        // slope-right-n ceiling highest at left → check left edge
        const tileLeft  = c * TILE;
        const tileRight = tileLeft + TILE - 1;
        const checkX = ctH === "slope-left-n"
          ? Math.min(nx + TILE - 1, tileRight)
          : Math.max(nx, tileLeft);
        const localX = checkX - tileLeft;

        const tileTop = r * TILE;
        const ceilingY = ctH === "slope-left-n"
          ? tileTop + localX
          : tileTop + (TILE - 1 - localX);

        if (ny < ceilingY) ny = ceilingY;
      }
    }
  }

  // ── Clamp to world bounds (skip looped axes) ───────────────
  const worldW = room.cols * TILE;
  const worldH = room.rows * TILE;
  if (!room.loopX) nx = Math.max(0, Math.min(nx, worldW - TILE));
  if (!room.loopY) ny = Math.max(0, Math.min(ny, worldH - TILE));

  return { x: nx, y: ny };
}

/**
 * Return the collision type of the tile directly in front of the
 * player (useful for interaction checks).
 */
export function tileInFront(
  room: RoomDef,
  px: number,
  py: number,
  dir: "up" | "down" | "left" | "right"
): { col: number; row: number; collision: CollisionType } {
  const centreX = px + TILE / 2;
  const centreY = py + TILE / 2;
  let col = Math.floor(centreX / TILE);
  let row = Math.floor(centreY / TILE);

  switch (dir) {
    case "up":
      row -= 1;
      break;
    case "down":
      row += 1;
      break;
    case "left":
      col -= 1;
      break;
    case "right":
      col += 1;
      break;
  }

  // Wrap for looping rooms so callers get valid tile coords for key lookups
  if (room.loopX) col = wrapCoord(col, room.cols);
  if (room.loopY) row = wrapCoord(row, room.rows);

  return { col, row, collision: getCollision(room, col, row) };
}