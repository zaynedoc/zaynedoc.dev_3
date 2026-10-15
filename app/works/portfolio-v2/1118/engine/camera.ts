/* ================================================================
   1118 Game Engine — Camera
   Pixel-based scrolling with a deadzone "inner box."
   For rooms that fit within the viewport (≤40×30 tiles) the
   camera stays fixed at (0,0).
   Looping rooms bypass small-room centering and clamping
   so the world wraps seamlessly.
   ================================================================ */

import { TILE, VIEW_W, VIEW_H, CAM_DEADZONE } from "./constants";
import type { CameraState, RoomDef } from "./types";

/**
 * Create the initial camera state for a room, centred on a spawn point.
 */
export function initCamera(room: RoomDef, spawnCol: number, spawnRow: number): CameraState {
  const worldW = room.cols * TILE;
  const worldH = room.rows * TILE;

  // Centre on spawn
  const px = spawnCol * TILE + TILE / 2;
  const py = spawnRow * TILE + TILE / 2;

  return {
    x: room.loopX
      ? Math.floor(px - VIEW_W / 2)           // looping: free follow, no clamp
      : worldW <= VIEW_W
        ? -Math.floor((VIEW_W - worldW) / 2)  // small room: centre in viewport
        : clampCamX(px - VIEW_W / 2, worldW), // large room: clamp-scroll
    y: room.loopY
      ? Math.floor(py - VIEW_H / 2)
      : worldH <= VIEW_H
        ? -Math.floor((VIEW_H - worldH) / 2)
        : clampCamY(py - VIEW_H / 2, worldH),
  };
}

/**
 * Update camera to follow the player using a deadzone.
 * The deadzone is a rectangle centred in the viewport.
 * When the player moves outside it the camera scrolls
 * just enough to keep them on the edge.
 */
export function updateCamera(
  cam: CameraState,
  playerX: number,
  playerY: number,
  room: RoomDef
): CameraState {
  const worldW = room.cols * TILE;
  const worldH = room.rows * TILE;

  let newX = cam.x;
  let newY = cam.y;

  // ── X axis ─────────────────────────────────────────────────
  if (room.loopX) {
    // Looping: deadzone follow, no clamping
    const playerCentreX = playerX + TILE / 2;
    const screenX = playerCentreX - cam.x;
    const centreX = VIEW_W / 2;
    if (screenX < centreX - CAM_DEADZONE.halfW) {
      newX = playerCentreX - (centreX - CAM_DEADZONE.halfW);
    } else if (screenX > centreX + CAM_DEADZONE.halfW) {
      newX = playerCentreX - (centreX + CAM_DEADZONE.halfW);
    }
  } else if (worldW <= VIEW_W) {
    newX = -Math.floor((VIEW_W - worldW) / 2);
  } else {
    const playerCentreX = playerX + TILE / 2;
    const screenX = playerCentreX - cam.x;
    const centreX = VIEW_W / 2;
    if (screenX < centreX - CAM_DEADZONE.halfW) {
      newX = playerCentreX - (centreX - CAM_DEADZONE.halfW);
    } else if (screenX > centreX + CAM_DEADZONE.halfW) {
      newX = playerCentreX - (centreX + CAM_DEADZONE.halfW);
    }
    newX = clampCamX(newX, worldW);
  }

  // ── Y axis ─────────────────────────────────────────────────
  if (room.loopY) {
    const playerCentreY = playerY + TILE / 2;
    const screenY = playerCentreY - cam.y;
    const centreY = VIEW_H / 2;
    if (screenY < centreY - CAM_DEADZONE.halfH) {
      newY = playerCentreY - (centreY - CAM_DEADZONE.halfH);
    } else if (screenY > centreY + CAM_DEADZONE.halfH) {
      newY = playerCentreY - (centreY + CAM_DEADZONE.halfH);
    }
  } else if (worldH <= VIEW_H) {
    newY = -Math.floor((VIEW_H - worldH) / 2);
  } else {
    const playerCentreY = playerY + TILE / 2;
    const screenY = playerCentreY - cam.y;
    const centreY = VIEW_H / 2;
    if (screenY < centreY - CAM_DEADZONE.halfH) {
      newY = playerCentreY - (centreY - CAM_DEADZONE.halfH);
    } else if (screenY > centreY + CAM_DEADZONE.halfH) {
      newY = playerCentreY - (centreY + CAM_DEADZONE.halfH);
    }
    newY = clampCamY(newY, worldH);
  }

  // Always snap to whole pixels so tiles line up without gaps
  // and the player sprite doesn't jitter from sub-pixel rounding.
  return { x: Math.floor(newX), y: Math.floor(newY) };
}

/* ── helpers ─────────────────────────────────────────────────── */

function clampCamX(x: number, worldW: number): number {
  return Math.floor(Math.max(0, Math.min(x, worldW - VIEW_W)));
}

function clampCamY(y: number, worldH: number): number {
  return Math.floor(Math.max(0, Math.min(y, worldH - VIEW_H)));
}