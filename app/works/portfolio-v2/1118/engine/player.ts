/* ================================================================
   1118 Game Engine — Player
   Movement, animation, and rendering for the player character.
   ================================================================
   Hero sprites use RPG Maker 2003 character format:
     - Each frame is HERO_FW × HERO_FH pixels (default 24×32)
     - 3 columns per character, 4 rows (down, left, right, up)
     - Multiple characters packed across the sheet
   The collision hitbox is still TILE×TILE (16×16) centred
   at the bottom of the sprite.
   ================================================================ */

import { TILE, PLAYER_SPEED, ANIM_FRAME_DURATION } from "./constants";
import { isDown } from "./input";
import { moveAndCollide } from "./collision";
import type { AnimationSet, CameraState, Direction, PlayerState, RoomDef, SpriteFrame } from "./types";

/* ── Hero sprite dimensions ─────────────────────────────────── */

/** Width of one hero frame in pixels. */
export const HERO_FW = 24;
/** Height of one hero frame in pixels. */
export const HERO_FH = 32;

/**
 * Configuration for which character on the sheet to use.
 * charCol / charRow identify the character block
 * (each block = 3 frames wide × 4 directions tall).
 */
export interface HeroConfig {
  /** Character block column (0-based). Default 0 = first character. */
  charCol: number;
  /** Character block row (0-based). Default 0 = top row of characters. */
  charRow: number;
}

export const DEFAULT_HERO_CONFIG: HeroConfig = { charCol: 0, charRow: 0 };

/* ── Animation frames (relative to the character block) ──────── */

/**
 * Build an AnimationSet for a given character block.
 * RPG Maker 2003 order: row 0=down, 1=left, 2=right, 3=up
 * Columns: 0=walk-A, 1=neutral, 2=walk-B
 * Walk cycle: walkA → neutral → walkB → neutral (ping-pong)
 */
export function buildAnimSet(cfg: HeroConfig = DEFAULT_HERO_CONFIG): AnimationSet {
  const ox = cfg.charCol * 3; // column offset in frames
  const oy = cfg.charRow * 4; // row offset in frames

  const cycle = (row: number): SpriteFrame[] => [
    { col: ox + 0, row: oy + row },   // walk-A  (arms swung one way)
    { col: ox + 1, row: oy + row },   // neutral (arms at rest)
    { col: ox + 2, row: oy + row },   // walk-B  (arms swung other way)
    { col: ox + 1, row: oy + row },   // neutral (arms at rest)
  ];

  /* Yume Nikki / RPG Maker 2003 row order: Up, Right, Down, Left */
  return {
    up:    cycle(0),
    right: cycle(1),
    down:  cycle(2),
    left:  cycle(3),
  };
}

export const DEFAULT_ANIM: AnimationSet = buildAnimSet();

/* ── Init ────────────────────────────────────────────────────── */

export function initPlayer(spawnCol: number, spawnRow: number, dir: Direction = "down"): PlayerState {
  return {
    x: spawnCol * TILE,
    y: spawnRow * TILE,
    dir,
    moving: false,
    animFrame: 1,   // start on neutral frame (col 1)
    animTimer: 0,
  };
}

/* ── Update ──────────────────────────────────────────────────── */

export function updatePlayer(
  p: PlayerState,
  dt: number,
  room: RoomDef,
  anim: AnimationSet = DEFAULT_ANIM
): PlayerState {
  // Read directional input
  let dx = 0;
  let dy = 0;

  if (isDown("ArrowUp"))    dy -= 1;
  if (isDown("ArrowDown"))  dy += 1;
  if (isDown("ArrowLeft"))  dx -= 1;
  if (isDown("ArrowRight")) dx += 1;

  // Normalise diagonal so total speed stays constant
  const moving = dx !== 0 || dy !== 0;
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.SQRT2;
    dx *= inv;
    dy *= inv;
  }

  const speed = PLAYER_SPEED * dt;
  const { x: nx, y: ny } = moveAndCollide(room, p.x, p.y, dx * speed, dy * speed);

  // Determine facing direction (prioritise last non-diagonal press)
  let dir = p.dir;
  if (moving) {
    if (dy < 0)      dir = "up";
    else if (dy > 0) dir = "down";
    if (dx < 0)      dir = "left";
    else if (dx > 0) dir = "right";
  }

  // Animation
  let animFrame = p.animFrame;
  let animTimer = p.animTimer;

  if (moving) {
    animTimer += dt;
    if (animTimer >= ANIM_FRAME_DURATION) {
      animTimer -= ANIM_FRAME_DURATION;
      animFrame = (animFrame + 1) % anim[dir].length;
    }
  } else {
    animFrame = 1;   // neutral/idle is frame index 1 (col 1)
    animTimer = 0;
  }

  return {
    x: nx,
    y: ny,
    dir,
    moving,
    animFrame,
    animTimer,
  };
}

/* ── Render ──────────────────────────────────────────────────── */

/**
 * Draw the hero sprite on the canvas.
 * The 24×32 sprite is drawn so that its bottom-centre aligns
 * with the centre-bottom of the 16×16 collision tile.
 */
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  heroSheet: HTMLImageElement,
  cam: CameraState,
  anim: AnimationSet = DEFAULT_ANIM
) {
  const frame = anim[p.dir][p.animFrame];

  // Source rect in the hero sheet
  const sx = frame.col * HERO_FW;
  const sy = frame.row * HERO_FH;

  // Destination: centre the wider sprite on the 16px tile,
  // and align bottom of sprite with bottom of tile.
  // Floor both player and camera to the same pixel grid to prevent
  // 1px jitter when the camera scrolls.
  const px = Math.floor(p.x);
  const py = Math.floor(p.y);
  const dx = px - cam.x - (HERO_FW - TILE) / 2;
  const dy = py - cam.y - (HERO_FH - TILE);

  ctx.drawImage(heroSheet, sx, sy, HERO_FW, HERO_FH, dx, dy, HERO_FW, HERO_FH);
}