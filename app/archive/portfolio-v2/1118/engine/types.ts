/* ================================================================
   1118 Game Engine — Core Types
   ================================================================ */

/** Cardinal direction the player (or a sprite) is facing. */
export type Direction = "up" | "down" | "left" | "right";

/* ── Tile collision ────────────────────────────────────────────── */

/**
 * How a tile interacts with the player's hitbox.
 *
 *  - `none`        — fully passable (floor, decoration)
 *  - `solid`       — impassable wall
 *  - `slope-left`  — 45° slope rising to the LEFT  (walking right pushes you up)
 *  - `slope-right` — 45° slope rising to the RIGHT (walking left pushes you up)
 *  - `slope-left-n`  — north-facing 45° ceiling slope, open on the LEFT
 *  - `slope-right-n` — north-facing 45° ceiling slope, open on the RIGHT
 *  - `door-auto`   — auto-trigger teleport on collision
 *  - `door-interact` — teleport on Space press
 *  - `interactable` — triggers dialogue / event on Space press
 */
export type CollisionType =
  | "none"
  | "solid"
  | "slope-left"
  | "slope-right"
  | "slope-left-n"
  | "slope-right-n"
  | "door-auto"
  | "door-interact"
  | "interactable";

/* ── Tile definition ───────────────────────────────────────────── */

/**
 * One logical tile on the map.
 * A single tile can have up to 3 visual layers
 * (background / main / foreground) so we can overlay
 * objects on terrain without extra arrays.
 */
export interface TileDef {
  /** Spritesheet-row index for the BASE layer (terrain). -1 = transparent. */
  bgTile: number;
  /** Spritesheet-row index for the MAIN layer (walls, objects). -1 = skip. */
  fgTile: number;
  /** Collision behaviour for this cell. */
  collision: CollisionType;
  /** If true, the tile graphic is flipped horizontally.
   *  For slopes this also mirrors the slope direction visually,
   *  but the *collision* direction is determined by `collision`. */
  flipX?: boolean;
  /** If true, the FG sprite renders ABOVE the player (e.g. house roofs).
   *  When false/undefined the FG sprite renders below the player. */
  overlay?: boolean;
}

/* ── Cutscene definition ───────────────────────────────────────── */

/**
 * Configures a cutscene that plays during a door transition.
 * Images are shown in sequence on a black screen, then fade back to black
 * before the destination room fades in.
 */
export interface CutsceneDef {
  /** Ordered image paths (relative to public/, e.g. "/images/cutscene1.png"). 640×480 recommended. */
  images: string[];
  /** Milliseconds to wait (on black) before the first image appears. Default 400. */
  waitTime: number;
  /** Milliseconds each image is shown (except the last). Default 1500. */
  interval: number;
  /** Milliseconds for the last image to fade to black. Default 600. */
  fadeTime: number;
  /** Optional SFX filename (from /sounds/) played when the first image is revealed. */
  revealSound?: string;
}

/* ── Teleport destination ──────────────────────────────────────── */

export interface TeleportTarget {
  /** Room id to load. */
  roomId: string;
  /** Spawn column (tile coords). */
  spawnCol: number;
  /** Spawn row (tile coords). */
  spawnRow: number;
  /** Direction the player should face after teleporting. */
  spawnDir: Direction;
  /** Optional SFX filename (from /sounds/) to play on door transition. */
  doorSound?: string;
  /** Optional cutscene played once during this door transition. */
  cutscene?: CutsceneDef;
}

/* ── Interactable definition ───────────────────────────────────── */

export interface InteractableDef {
  /** Unique id for scripting / flags. */
  id: string;
  /** What happens on interaction: dialogue, event callback, etc. (Phase 2) */
  type: "dialogue" | "event";
  /** Dialogue lines (if type=dialogue). */
  lines?: string[];
  /** Event key (if type=event). */
  eventKey?: string;

  /* ── Event-only fields (type === "event") ─────────────────── */

  /**
   * The interactable ID to unlock / mutate when this event fires.
   * Looked up across ALL rooms in the registry.
   */
  lockId?: string;
  /**
   * The collision type the target tile should become.
   * e.g. "door-interact", "door-auto", "interactable", "none".
   */
  changeType?: CollisionType;
  /**
   * If changeType is a door type, teleport data for the unlocked door.
   */
  changeTeleport?: TeleportTarget;
  /**
   * If changeType is "interactable", replacement dialogue lines.
   */
  changeLines?: string[];

  /* ── Proximity sound fields ──────────────────────────────── */

  /** SFX filename (from /sounds/) for proximity audio. */
  proxSound?: string;
  /** Playback mode: "loop" (continuous), "once" (on enter range), "interval" (repeat). */
  proxSoundMode?: "loop" | "once" | "interval";
  /** Interval in seconds (only for mode "interval"). Default 5. */
  proxSoundInterval?: number;
  /** Max volume (0–1). Default 1. */
  proxSoundVolume?: number;
  /** Max audible tile distance. Default 8. */
  proxSoundMaxDist?: number;

  /* ── Event-lock sound fields ────────────────────────────── */

  /** Door sound to set on the target when changeType is a door. */
  changeDoorSound?: string;
  /** Music to set on the target room when event fires. */
  changeMusic?: string;
  /** Proximity sound to assign to the target interactable. "" to disable. */
  changeProxSound?: string;

  /* ── Event-lock sprite change ────────────────────────────── */

  /** Tileset column of the new sprite for target tiles. undefined = no change. */
  changeSpriteCol?: number;
  /** Tileset row of the new sprite for target tiles. undefined = no change. */
  changeSpriteRow?: number;

  /* ── Event-lock cutscene change ─────────────────────────── */

  /** Cutscene to assign to the target door when event fires. undefined = no change. */
  changeCutscene?: CutsceneDef;
}

/* ── Background scroll mode ────────────────────────────────────── */

export type BgScrollMode =
  | "diagonal-ne"
  | "diagonal-nw"
  | "diagonal-sw"
  | "diagonal-se"
  | "player-move"
  | "left-to-right";

/* ── Room / Map definition ─────────────────────────────────────── */

export interface RoomDef {
  id: string;
  /** Width in tiles. */
  cols: number;
  /** Height in tiles. */
  rows: number;
  /** Columns in the tileset spritesheet (used by event-unlock sprite changes). */
  tilesetCols?: number;
  /**
   * Flat array of TileDef, length = cols * rows.
   * Index = row * cols + col.
   */
  tiles: TileDef[];
  /** Tileset image path (imported StaticImageData .src or public path). */
  tilesetSrc: string;
  /** Optional background image that fills behind the tile layer. */
  backgroundSrc?: string;
  /** How the repeating background scrolls. Only relevant when backgroundSrc is set. */
  bgScrollMode?: BgScrollMode;
  /** Background scroll speed in px/s (default 20). */
  bgSpeed?: number;
  /** Teleport lookup: key = `${row},${col}` for every door tile. */
  teleports: Record<string, TeleportTarget>;
  /** Interactable lookup: key = `${row},${col}`. */
  interactables: Record<string, InteractableDef>;
  /**
   * When true, the room wraps horizontally: tiles, collision, and
   * interactables repeat using modulo, the camera is never clamped,
   * and the player walks seamlessly across the boundary.
   * (Yume Nikki-style looping.)
   */
  loopX?: boolean;
  /**
   * Same as loopX but for the vertical axis.
   */
  loopY?: boolean;

  /** Player spawn when entering this room for the first time. */
  defaultSpawn: { col: number; row: number; dir: Direction };
  /** Music filename (from /music/) to play while in this room. */
  musicKey?: string;

  /**
   * Animated tile definitions.
   * Key = tile index (string) in the spritesheet.
   * Value = ordered array of tile indices that form the animation loop.
   * The first entry is typically the base tile itself.
   * Every occurrence of that tile in bg/fg layers will animate.
   */
  animTiles?: Record<string, number[]>;
  /**
   * Milliseconds per animation frame for all animated tiles in this room.
   * Default: 500.
   */
  animIntervalMs?: number;
}

/* ── Spritesheet frame reference ───────────────────────────────── */

/**
 * Points to a specific 16×16 frame inside a spritesheet PNG.
 * The sheet is treated as a uniform grid of TILE_SIZE cells.
 */
export interface SpriteFrame {
  /** Column index in the sheet (0-based, left-to-right). */
  col: number;
  /** Row index in the sheet (0-based, top-to-bottom). */
  row: number;
}

/* ── Player animation set ──────────────────────────────────────── */

/**
 * Maps each direction to an array of SpriteFrames
 * that form a walk cycle.  Index 0 = idle frame.
 */
export type AnimationSet = Record<Direction, SpriteFrame[]>;

/* ── Camera ────────────────────────────────────────────────────── */

export interface CameraState {
  /** Top-left pixel offset of the viewport into the world. */
  x: number;
  y: number;
}

/* ── Player runtime state ──────────────────────────────────────── */

export interface PlayerState {
  /** World-pixel X (top-left of the 16×16 sprite). */
  x: number;
  /** World-pixel Y. */
  y: number;
  /** Current facing direction. */
  dir: Direction;
  /** Whether the player is actively moving this frame. */
  moving: boolean;
  /** Current animation frame index. */
  animFrame: number;
  /** Accumulator for animation timing. */
  animTimer: number;
}