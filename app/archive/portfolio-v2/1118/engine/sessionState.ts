/* ================================================================
   1118 Game Engine — Session State
   In-memory state that persists for the current browser session.
   Resets on page refresh / close (no localStorage).
   ================================================================ */

import type { CollisionType, InteractableDef, TeleportTarget } from "./types";
import ROOMS from "../rooms/registry";

/* ── Triggered events ──────────────────────────────────────────── */

/**
 * Set of interactable IDs whose "event" has already fired.
 * Prevents event dialogue from showing again on re-interact.
 */
const triggeredEvents = new Set<string>();

export function isEventTriggered(interactableId: string): boolean {
  return triggeredEvents.has(interactableId);
}

export function markEventTriggered(interactableId: string): void {
  triggeredEvents.add(interactableId);
}

/* ── Triggered cutscenes ───────────────────────────────────────── */

/**
 * Set of door keys (roomId:row,col) whose cutscene has already played.
 * Ensures each cutscene only fires once per session.
 */
const triggeredCutscenes = new Set<string>();

/** Build a unique key for a door cutscene. */
export function cutsceneKey(roomId: string, tileKey: string): string {
  return `${roomId}:${tileKey}`;
}

export function isCutsceneTriggered(key: string): boolean {
  return triggeredCutscenes.has(key);
}

export function markCutsceneTriggered(key: string): void {
  triggeredCutscenes.add(key);
}

/* ── Apply an event unlock ────────────────────────────────────── */

/**
 * When an "event" interactable fires, this function finds the
 * target interactable by `lockId` across ALL rooms in the registry
 * and mutates its collision type + data in-place.
 *
 * @param eventDef  The event interactable that was just triggered.
 */
export function applyEventUnlock(eventDef: InteractableDef): void {
  const { lockId, changeType, changeTeleport, changeLines,
          changeDoorSound, changeMusic, changeProxSound,
          changeSpriteCol, changeSpriteRow, changeCutscene } = eventDef;
  if (!lockId || !changeType) return;

  // Search every room for the target interactable
  for (const entry of Object.values(ROOMS)) {
    const room = entry.room;

    // Snapshot entries so we can safely delete during iteration
    const entries = Object.entries(room.interactables);

    // Find ALL tile keys whose interactable matches the lockId
    for (const [key, inter] of entries) {
      if (inter.id !== lockId) continue;

      // Parse the tile coordinate
      const [rowStr, colStr] = key.split(",");
      const row = Number(rowStr);
      const col = Number(colStr);
      const idx = row * room.cols + col;
      if (idx < 0 || idx >= room.tiles.length) continue;

      // ── Mutate the tile's collision ─────────────────────────
      room.tiles[idx].collision = changeType;

      // ── Change the tile's sprite if specified ─────────────────
      if (changeSpriteCol != null && changeSpriteRow != null) {
        const sheetCols = room.tilesetCols ?? 30;
        const newTileId = changeSpriteRow * sheetCols + changeSpriteCol;
        room.tiles[idx].fgTile = newTileId;
      }

      // ── If it becomes a door, register the teleport ─────────
      if (
        (changeType === "door-auto" || changeType === "door-interact") &&
        changeTeleport
      ) {
        const tp = { ...changeTeleport };
        if (changeDoorSound) tp.doorSound = changeDoorSound;
        if (changeCutscene) tp.cutscene = { ...changeCutscene };
        room.teleports[key] = tp;
        // Remove the interactable entry (it's now a door)
        delete room.interactables[key];
      }

      // ── If it becomes an interactable, update dialogue ──────
      if (changeType === "interactable" && changeLines) {
        const newInter: InteractableDef = {
          id: inter.id,
          type: "dialogue",
          lines: [...changeLines],
        };
        // Apply proximity sound change if specified
        if (changeProxSound !== undefined) {
          if (changeProxSound) {
            newInter.proxSound = changeProxSound;
            newInter.proxSoundMode = inter.proxSoundMode ?? "loop";
            newInter.proxSoundVolume = inter.proxSoundVolume ?? 1;
            newInter.proxSoundMaxDist = inter.proxSoundMaxDist ?? 8;
          }
          // changeProxSound === "" means disable
        }
        room.interactables[key] = newInter;
      }

      // ── If it stays interactable-typed but we're toggling proximity ──
      if (changeType === "interactable" && !changeLines && changeProxSound !== undefined) {
        if (changeProxSound) {
          inter.proxSound = changeProxSound;
        } else {
          delete inter.proxSound;
        }
      }

      // ── If it becomes none/solid, remove the interactable ───
      if (changeType === "none" || changeType === "solid") {
        delete room.interactables[key];
      }

      // ── Apply room-level music change ───────────────────────
      if (changeMusic !== undefined) {
        room.musicKey = changeMusic || undefined;
      }
    }
  }
}

/** Reset all session state (called if you want a full restart). */
export function resetSessionState(): void {
  triggeredEvents.clear();
  triggeredCutscenes.clear();
}
