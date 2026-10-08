/* ================================================================
   1118 Game Engine — Main Game Loop
   A React hook that drives the update/render cycle.
   Manages game modes: exploring, fade transitions, dialogue.
   ================================================================ */

import { useEffect, useRef, useState } from "react";
import { VIEW_W, VIEW_H, TILE } from "./constants";
import { initInput, flushInput, isJustPressed } from "./input";
import { loadSheet, sheetDimensions } from "./spritesheet";
import { initCamera, updateCamera } from "./camera";
import { renderTiles, renderOverlayTiles, renderBackground } from "./renderer";
import {
  initPlayer,
  updatePlayer,
  renderPlayer,
  DEFAULT_ANIM,
  buildAnimSet,
} from "./player";
import { getCollision, tileInFront, wrapCoord } from "./collision";
import { isDown } from "./input";
import {
  createFade,
  startFadeOut,
  startFadeIn,
  updateFade,
  isFadeComplete,
  renderFade,
} from "./fade";
import {
  createDialogue,
  advanceDialogue,
  updateDialogue,
  renderDialogue,
} from "./dialogue";
import { getRoom } from "../rooms/registry";
import { isEventTriggered, markEventTriggered, applyEventUnlock, isCutsceneTriggered, markCutsceneTriggered, cutsceneKey } from "./sessionState";
import {
  startWalkLoop,
  stopWalkLoop,
  playWallBump,
  playDoorSound,
  setMusic,
  registerProximitySound,
  updateProximitySounds,
  clearAllProximitySounds,
  toggleProximitySound,
  cleanupAudio,
} from "./audioEngine";
import {
  createCutscene,
  updateCutscene,
  isCutsceneDone,
  renderCutscene,
} from "./cutscene";
import { loadGameFont } from "./gameFont";
import type { CameraState, RoomDef, TeleportTarget } from "./types";
import type { HeroConfig } from "./player";
import type { FadeState } from "./fade";
import type { DialogueState } from "./dialogue";
import type { CutsceneState } from "./cutscene";

/* ── Game modes ────────────────────────────────────────────────── */

type GameMode = "explore" | "fade-out" | "fade-in" | "dialogue" | "cutscene";

/* ── Hook interface ────────────────────────────────────────────── */

interface UseGameLoopOpts {
  canvas: HTMLCanvasElement | null;
  /** Room to start in (must be in the registry). */
  initialRoomId: string;
  heroSheetSrc: string;
  heroConfig?: HeroConfig;
}

export function useGameLoop({
  canvas,
  initialRoomId,
  heroSheetSrc,
  heroConfig,
}: UseGameLoopOpts) {
  const [loading, setLoading] = useState(true);

  // Mutable refs exposed to the debug overlay
  const camRef = useRef<CameraState>({ x: 0, y: 0 });
  const roomRef = useRef<RoomDef | null>(null);

  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let rafId = 0;
    let cleanupInput: (() => void) | null = null;

    (async () => {
      ctx.imageSmoothingEnabled = false;

      // ── Load custom game font ────────────────────────────────
      await loadGameFont();

      // ── Resolve initial room ─────────────────────────────────
      const entry = getRoom(initialRoomId);
      if (!entry) {
        console.error(`[1118] Room "${initialRoomId}" not found in registry`);
        return;
      }

      // ── Load initial assets ──────────────────────────────────
      let heroSheet: HTMLImageElement;
      let tileset: HTMLImageElement;
      let bgImage: HTMLImageElement | null = null;

      try {
        [heroSheet, tileset, bgImage] = await Promise.all([
          loadSheet(heroSheetSrc),
          loadSheet(entry.tilesetSrc),
          (entry.backgroundSrc || entry.room.backgroundSrc)
            ? loadSheet(entry.backgroundSrc || entry.room.backgroundSrc!)
            : Promise.resolve(null),
        ]);
      } catch (err) {
        console.error("[1118] Failed to load assets:", err);
        return;
      }

      if (cancelled) return;

      // ── Mutable game state ───────────────────────────────────
      let currentRoom = entry.room;
      let currentTileset = tileset;
      let currentBg = bgImage;
      let sheetCols = sheetDimensions(currentTileset).cols;

      // Background scroll offset (cumulative for time-based modes)
      let bgScrollX = 0;
      let bgScrollY = 0;

      const spawn = currentRoom.defaultSpawn;
      let player = initPlayer(spawn.col, spawn.row, spawn.dir);
      let cam = initCamera(currentRoom, spawn.col, spawn.row);

      roomRef.current = currentRoom;
      camRef.current = cam;

      const anim = heroConfig ? buildAnimSet(heroConfig) : DEFAULT_ANIM;

      // ── Mode / transition state ──────────────────────────────
      let mode: GameMode = "explore";
      let fade: FadeState = createFade();
      let dialogue: DialogueState | null = null;
      let pendingTeleport: TeleportTarget | null = null;
      let pendingTileset: HTMLImageElement | null = null;
      let pendingBg: HTMLImageElement | null | undefined = undefined;
      let cutscene: CutsceneState | null = null;
      let pendingCutsceneKey: string | null = null; // roomId:row,col key for once-only tracking

      // Prevents re-triggering a door the moment we spawn on it
      let doorCooldown = false;
      let cooldownCol = -1;
      let cooldownRow = -1;

      // ── Tile animation timer ─────────────────────────────────
      let tileAnimTimer = 0;
      let tileAnimFrame = 0;

      // ── Input ────────────────────────────────────────────────
      cleanupInput = initInput(canvas);
      canvas.focus();
      setLoading(false);

      // ── Room audio setup helper ──────────────────────────────
      function setupRoomAudio(room: RoomDef) {
        // Background music
        setMusic(room.musicKey);

        // Proximity sounds from interactables
        clearAllProximitySounds();
        for (const [key, inter] of Object.entries(room.interactables)) {
          if (inter.proxSound) {
            const [rStr, cStr] = key.split(",");
            registerProximitySound(
              key,
              inter.proxSound,
              Number(cStr),
              Number(rStr),
              inter.proxSoundMode ?? "loop",
              inter.proxSoundVolume ?? 1,
              inter.proxSoundMaxDist ?? 8,
              inter.proxSoundInterval ?? 5,
            );
          }
        }
      }

      // Set up audio for the initial room
      setupRoomAudio(currentRoom);

      // ── Loop ─────────────────────────────────────────────────
      let lastTime = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // ━━━━━━━━━━━━━━━━━━━━ UPDATE ━━━━━━━━━━━━━━━━━━━━━━━━━

        switch (mode) {
          /* ──────────────── EXPLORE ──────────────────────────── */
          case "explore": {
            // Save old position for wall-bump detection
            const oldX = player.x;
            const oldY = player.y;

            // Player movement
            player = updatePlayer(player, dt, currentRoom, anim);
            cam = updateCamera(cam, player.x, player.y, currentRoom);

            // Walking / wall-bump audio
            // Check forward progress on each INTENDED axis.
            // • Fixes south/east: push-back moves position backward,
            //   but that's not forward progress → correctly detects bump.
            // • Fixes diagonal: at high refresh rates per-axis delta is
            //   tiny, but we only need > 0.01 in the intended direction.
            const intendX = (isDown("ArrowRight") ? 1 : 0) - (isDown("ArrowLeft") ? 1 : 0);
            const intendY = (isDown("ArrowDown")  ? 1 : 0) - (isDown("ArrowUp")   ? 1 : 0);
            const wantsToMove = intendX !== 0 || intendY !== 0;
            const progressX = intendX !== 0 && (player.x - oldX) * intendX > 0.01;
            const progressY = intendY !== 0 && (player.y - oldY) * intendY > 0.01;
            const madeProgress = progressX || progressY;
            if (wantsToMove && madeProgress) {
              startWalkLoop();
            } else {
              stopWalkLoop();
              if (wantsToMove && !madeProgress) {
                playWallBump();
              }
            }

            // Tile the player is standing on (wrapped for looping rooms)
            const rawCx = Math.floor((player.x + TILE / 2) / TILE);
            const rawCy = Math.floor((player.y + TILE / 2) / TILE);
            const cx = currentRoom.loopX ? wrapCoord(rawCx, currentRoom.cols) : rawCx;
            const cy = currentRoom.loopY ? wrapCoord(rawCy, currentRoom.rows) : rawCy;

            // ── Door cooldown (prevents instant re-trigger) ────
            if (doorCooldown) {
              if (cx !== cooldownCol || cy !== cooldownRow) {
                doorCooldown = false;
              }
            }

            // ── Auto-door check (facing + moving toward a door-auto tile) ──
            if (!doorCooldown) {
              const isMoving = isDown("ArrowUp") || isDown("ArrowDown") || isDown("ArrowLeft") || isDown("ArrowRight");
              if (isMoving) {
                const front = tileInFront(currentRoom, player.x, player.y, player.dir);
                if (front.collision === "door-auto") {
                  const key = `${front.row},${front.col}`;
                  const tp = currentRoom.teleports[key];
                  if (tp) {
                    beginTeleport(tp, key);
                  }
                }
              }
            }

            // ── Space interactions ─────────────────────────────
            if (isJustPressed(" ")) {
              const front = tileInFront(
                currentRoom,
                player.x,
                player.y,
                player.dir
              );

              if (front.collision === "door-interact") {
                const key = `${front.row},${front.col}`;
                const tp = currentRoom.teleports[key];
                if (tp) beginTeleport(tp, key);
              } else if (front.collision === "interactable") {
                const key = `${front.row},${front.col}`;
                const inter = currentRoom.interactables[key];
                if (inter?.type === "dialogue" && inter.lines) {
                  // Toggle proximity sound if this interactable has one
                  if (inter.proxSound) toggleProximitySound(key);
                  dialogue = createDialogue(inter.lines);
                  mode = "dialogue";
                } else if (inter?.type === "event" && inter.lines && !isEventTriggered(inter.id)) {
                  // Show event dialogue once, then apply the unlock
                  markEventTriggered(inter.id);
                  applyEventUnlock(inter);
                  dialogue = createDialogue(inter.lines);
                  mode = "dialogue";
                }
              }
            }

            // ── Update proximity sounds ────────────────────────
            updateProximitySounds(cx, cy, dt);

            break;
          }

          /* ──────────────── FADE OUT ────────────────────────── */
          case "fade-out": {
            stopWalkLoop();
            fade = updateFade(fade, dt);

            // When fully black AND the target tileset is loaded → switch
            if (
              isFadeComplete(fade) &&
              pendingTeleport &&
              pendingTileset &&
              pendingBg !== undefined
            ) {
              const targetEntry = getRoom(pendingTeleport.roomId);
              if (targetEntry) {
                currentRoom = targetEntry.room;
                currentTileset = pendingTileset;
                currentBg = pendingBg;
                sheetCols = sheetDimensions(currentTileset).cols;

                player = initPlayer(
                  pendingTeleport.spawnCol,
                  pendingTeleport.spawnRow,
                  pendingTeleport.spawnDir
                );
                cam = initCamera(
                  currentRoom,
                  pendingTeleport.spawnCol,
                  pendingTeleport.spawnRow
                );

                roomRef.current = currentRoom;

                // Reset tile animation on room change
                tileAnimTimer = 0;
                tileAnimFrame = 0;

                // Reset background scroll on room change
                bgScrollX = 0;
                bgScrollY = 0;

                // Arm door cooldown so we don't re-trigger on spawn tile
                doorCooldown = true;
                cooldownCol = pendingTeleport.spawnCol;
                cooldownRow = pendingTeleport.spawnRow;

                // Set up audio for the new room
                setupRoomAudio(currentRoom);
              }

              // Check if this teleport has a cutscene that hasn't been shown yet
              const tp = pendingTeleport;
              const hasCutscene = tp.cutscene &&
                tp.cutscene.images.length > 0 &&
                pendingCutsceneKey &&
                !isCutsceneTriggered(pendingCutsceneKey);

              pendingTeleport = null;
              pendingTileset = null;
              pendingBg = undefined;

              if (hasCutscene && tp.cutscene) {
                // Mark as triggered so it only plays once
                markCutsceneTriggered(pendingCutsceneKey!);
                pendingCutsceneKey = null;
                cutscene = createCutscene(tp.cutscene);
                mode = "cutscene";
              } else {
                pendingCutsceneKey = null;
                fade = startFadeIn(fade);
                mode = "fade-in";
              }
            }
            break;
          }

          /* ──────────────── FADE IN ─────────────────────────── */
          case "fade-in": {
            fade = updateFade(fade, dt);
            if (isFadeComplete(fade)) {
              mode = "explore";
            }
            break;
          }

          /* ──────────────── CUTSCENE ───────────────────────────── */
          case "cutscene": {
            stopWalkLoop();
            if (cutscene && !isCutsceneDone(cutscene)) {
              const result = updateCutscene(cutscene, dt);
              cutscene = result.state;
              if (result.playReveal && cutscene.def.revealSound) {
                // Play the reveal SFX via a one-shot
                const a = new Audio(`/sounds/${cutscene.def.revealSound}`);
                a.volume = 1;
                a.play().catch(() => {});
              }
              if (isCutsceneDone(cutscene)) {
                cutscene = null;
                fade = startFadeIn(fade);
                mode = "fade-in";
              }
            } else {
              cutscene = null;
              fade = startFadeIn(fade);
              mode = "fade-in";
            }
            break;
          }

          /* ──────────────── DIALOGUE ────────────────────────── */
          case "dialogue": {
            stopWalkLoop();
            if (dialogue && !dialogue.done) {
              dialogue = updateDialogue(dialogue, dt);
              if (isJustPressed(" ")) {
                dialogue = advanceDialogue(dialogue);
              }
              if (dialogue.done) {
                dialogue = null;
                mode = "explore";
              }
            } else {
              dialogue = null;
              mode = "explore";
            }
            break;
          }
        }

        // Sync refs for debug overlay
        camRef.current = cam;

        // ── Advance tile animation timer ───────────────────────
        const animInterval = (currentRoom.animIntervalMs ?? 500) / 1000; // seconds
        tileAnimTimer += dt;
        if (animInterval > 0 && tileAnimTimer >= animInterval) {
          tileAnimFrame++;
          tileAnimTimer -= animInterval;
        }

        // ── Advance background scroll ─────────────────────────
        if (currentBg && currentRoom.bgScrollMode) {
          const spd = currentRoom.bgSpeed ?? 20;
          switch (currentRoom.bgScrollMode) {
            case "diagonal-ne": bgScrollX -= spd * dt; bgScrollY += spd * dt; break;
            case "diagonal-nw": bgScrollX += spd * dt; bgScrollY += spd * dt; break;
            case "diagonal-sw": bgScrollX += spd * dt; bgScrollY -= spd * dt; break;
            case "diagonal-se": bgScrollX -= spd * dt; bgScrollY -= spd * dt; break;
            case "player-move": bgScrollX = cam.x * 0.3; bgScrollY = cam.y * 0.3; break;
            case "left-to-right": bgScrollX -= spd * dt; break;
          }
        }

        // ━━━━━━━━━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━━━━━━━━━━━━━━

        ctx.clearRect(0, 0, VIEW_W, VIEW_H);

        // Repeating background image
        if (currentBg) {
          renderBackground(ctx, currentBg, bgScrollX, bgScrollY, currentRoom, cam);
        }

        // Tile map (BG + non-overlay FG)
        renderTiles(ctx, currentRoom, currentTileset, cam, sheetCols, tileAnimFrame);

        // Player
        renderPlayer(ctx, player, heroSheet, cam, anim);

        // Overlay FG tiles (above the player)
        renderOverlayTiles(ctx, currentRoom, currentTileset, cam, sheetCols, tileAnimFrame);

        // Dialogue box (underneath the fade overlay)
        if (dialogue && !dialogue.done) {
          renderDialogue(ctx, dialogue);
        }

        // Fade overlay (always on top)
        renderFade(ctx, fade);

        // Cutscene overlay (over the fade-to-black, full screen)
        if (cutscene && mode === "cutscene") {
          renderCutscene(ctx, cutscene);
        }

        flushInput();
        rafId = requestAnimationFrame(tick);
      };

      /* ── Helper: start a door/teleport transition ────────── */
      function beginTeleport(tp: TeleportTarget, sourceTileKey?: string) {
        pendingTeleport = tp;
        mode = "fade-out";
        fade = startFadeOut(fade);
        playDoorSound(tp.doorSound);

        // Store cutscene key for once-only tracking
        pendingCutsceneKey = sourceTileKey
          ? cutsceneKey(currentRoom.id, sourceTileKey)
          : null;

        // Pre-load target room assets during fade
        const targetEntry = getRoom(tp.roomId);
        if (targetEntry) {
          loadSheet(targetEntry.tilesetSrc).then((img) => {
            if (!cancelled) pendingTileset = img;
          });
          const targetBgSrc = targetEntry.backgroundSrc || targetEntry.room.backgroundSrc;
          if (targetBgSrc) {
            loadSheet(targetBgSrc).then((img) => {
              if (!cancelled) pendingBg = img;
            });
          } else {
            pendingBg = null;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    })();

    // Cleanup
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cleanupInput?.();
      cleanupAudio();
      setLoading(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, initialRoomId, heroSheetSrc, heroConfig]);

  return { loading, camRef, roomRef };
}