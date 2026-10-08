"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";
import s from "./game.module.css";
import { VIEW_W, VIEW_H } from "./engine/constants";
import { useGameLoop } from "./engine/useGameLoop";
import { setMasterVolume, getMasterVolume } from "./engine/audioEngine";
import ROOMS from "./rooms/registry";
import DebugOverlay from "./DebugOverlay";
import MapEditor from "./MapEditor";

/* ── Hero spritesheet ──────────────────────────────────────────── */
const heroSheetPath = "/1118-sprites/hero/hero.png";

/*
   1118 — Hidden RPG game page
   Accessed via: open ascii-art/hidden/1118.exe  (from the About terminal)
   Press \ to toggle the map editor.
*/

/** Automatically enabled in development, disabled in production.
 *  Guards the map-editor (\) and debug overlay (`) hotkeys. */
const DEV_MODE = process.env.NODE_ENV === "development";

export default function Game1118() {
  const router = useRouter();

  // Callback ref so we get a re-render when the canvas mounts
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvas(node);
  }, []);

  /* ── Idle-reveal controls hint (key-held aware) ─────────────── */
  const [showControls, setShowControls] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldKeys = useRef(new Set<string>());

  useEffect(() => {
    const startIdleTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (heldKeys.current.size === 0) setShowControls(true);
      }, 1000);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      heldKeys.current.add(e.key);
      setShowControls(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.key);
      if (heldKeys.current.size === 0) startIdleTimer();
    };

    const onBlur = () => {
      heldKeys.current.clear();
      startIdleTimer();
    };

    startIdleTimer();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
  /* ── Master volume ────────────────────────────────────────────── */
  const [volume, setVolume] = useState(() => getMasterVolume());

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMasterVolume(v);
  }, []);
  /* ── Editor toggle ─────────────────────────────────────────── */
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState("forest1");

  /* Only OPEN the editor from the game view.
     Closing is handled exclusively by MapEditor's onClose callback
     so the active room tab is passed back correctly. */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "\\" && DEV_MODE) {
        setEditorOpen(prev => {
          if (prev) return prev;      // already open → ignore (MapEditor handles close)
          if (roomRef.current) setActiveRoomId(roomRef.current.id);
          return true;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { loading, camRef, roomRef } = useGameLoop({
    canvas: editorOpen ? null : canvas,      // pause the game loop when editor is open
    initialRoomId: activeRoomId,
    heroSheetSrc: heroSheetPath,
  });

  /* ── Room name reveal (brief fade on room change) ──────────── */
  const [roomLabel, setRoomLabel] = useState("");
  const [roomLabelVisible, setRoomLabelVisible] = useState(false);
  const lastRoomId = useRef<string | null>(null);
  const roomFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const poll = setInterval(() => {
      const id = roomRef.current?.id ?? null;
      if (id && id !== lastRoomId.current) {
        lastRoomId.current = id;
        setRoomLabel(id);
        setRoomLabelVisible(true);
        if (roomFadeTimer.current) clearTimeout(roomFadeTimer.current);
        roomFadeTimer.current = setTimeout(() => setRoomLabelVisible(false), 3000);
      }
    }, 200);
    return () => {
      clearInterval(poll);
      if (roomFadeTimer.current) clearTimeout(roomFadeTimer.current);
    };
  }, [roomRef]);

  /* ── Editor view ───────────────────────────────────────────── */
  if (editorOpen) {
    return (
      <MapEditor
        registryRooms={ROOMS}
        currentRoomId={activeRoomId}
        onClose={(roomId) => {
          setActiveRoomId(roomId);
          setEditorOpen(false);
        }}
      />
    );
  }

  /* ── Game view ─────────────────────────────────────────────── */
  return (
    <main className={s.wrapper}>
      {/* ASCII back label above the screen */}
      <div className={s.backLabel} onClick={() => router.push(portfolioV2Path("/about"))}>
        &lt;-- Back to /about
      </div>

      {/* Master volume slider */}
      <div className={s.volumeControl}>
        <span className={s.volumeIcon}>{volume === 0 ? "♭" : "♫"}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className={s.volumeSlider}
          aria-label="Master volume"
        />
        <span className={s.volumeValue}>{Math.round(volume * 100)}%</span>
      </div>

      <div className={s.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={s.canvas}
          width={VIEW_W}
          height={VIEW_H}
          tabIndex={0}
        />
        {DEV_MODE && <DebugOverlay camRef={camRef} roomRef={roomRef} canvasEl={canvas} />}
      </div>

      {/* Room name — brief reveal on room change */}
      <div className={`${s.roomLabel} ${roomLabelVisible ? s.roomLabelVisible : ""}`}>
        {roomLabel}
      </div>

      {/* Controls hint — appears after 1s idle, hidden while keys are held */}
      <div className={`${s.controlsHint} ${showControls ? s.controlsVisible : ""}`}>
        Arrow keys — move &nbsp;·&nbsp; Space — interact
      </div>

      {loading && <div className={s.loading}>Loading 1118...</div>}
    </main>
  );
}
