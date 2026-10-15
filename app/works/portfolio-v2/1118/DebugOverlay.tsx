"use client";
/* eslint-disable react-hooks/refs -- preserved legacy canvas debug overlay */

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { TILE, VIEW_W, VIEW_H } from "./engine/constants";
import type { CameraState, RoomDef } from "./engine/types";

/* ================================================================
   DebugOverlay — Tile-coordinate grid + drag-select rectangle.
   Renders as an absolutely-positioned HTML layer ON TOP of the
   game canvas.  Toggle with the ` (backtick) key.
   ================================================================ */

interface Props {
  camRef: React.RefObject<CameraState | null>;
  roomRef: React.RefObject<RoomDef | null>;
  /** The game <canvas> — we refocus it on click so arrow keys keep working. */
  canvasEl?: HTMLCanvasElement | null;
}

interface Selection {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
}

export default function DebugOverlay({ camRef, roomRef, canvasEl }: Props) {
  const [visible, setVisible] = useState(false);
  const [sel, setSel] = useState<Selection | null>(null);
  const dragging = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ── Toggle with ` key ────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`") setVisible((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Early bail when component shouldn't exist ─────────────── */
  // (kept as a safety net; parent already gates rendering via DEV_MODE)

  /* ── Force re-render at ~15 fps so labels follow camera ──── */
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setTick((t) => t + 1), 66);
    return () => clearInterval(id);
  }, [visible]);

  /* ── Mouse → tile coordinate helper ────────────────────────── */
  const tileAt = useCallback(
    (e: ReactMouseEvent) => {
      const cam = camRef.current;
      if (!cam) return { col: 0, row: 0 };
      const rect = overlayRef.current?.getBoundingClientRect();
      if (!rect) return { col: 0, row: 0 };
      // getBoundingClientRect() returns the *scaled* size;
      // divide by the CSS scale so we get logical (unscaled) pixel coords.
      const scaleX = rect.width / VIEW_W;
      const scaleY = rect.height / VIEW_H;
      const mx = (e.clientX - rect.left) / scaleX;
      const my = (e.clientY - rect.top) / scaleY;
      return {
        col: Math.floor((mx + cam.x) / TILE),
        row: Math.floor((my + cam.y) / TILE),
      };
    },
    [camRef]
  );

  /* ── Drag handlers ─────────────────────────────────────────── */
  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (e.button !== 0) return; // left-click only
      // Refocus the canvas so arrow-key input keeps working
      canvasEl?.focus();
      const { col, row } = tileAt(e);
      dragging.current = true;
      setSel({ startCol: col, startRow: row, endCol: col, endRow: row });
    },
    [tileAt, canvasEl]
  );

  const onMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!dragging.current) return;
      const { col, row } = tileAt(e);
      setSel((prev) =>
        prev ? { ...prev, endCol: col, endRow: row } : null
      );
    },
    [tileAt]
  );

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (!visible) return null;

  const cam = camRef.current ?? { x: 0, y: 0 };
  const room = roomRef.current;
  const roomCols = room?.cols ?? 40;
  const roomRows = room?.rows ?? 30;

  /* Visible tile range */
  const firstCol = Math.floor(cam.x / TILE);
  const firstRow = Math.floor(cam.y / TILE);
  const lastCol = Math.min(roomCols - 1, Math.floor((cam.x + VIEW_W) / TILE));
  const lastRow = Math.min(roomRows - 1, Math.floor((cam.y + VIEW_H) / TILE));

  /* Sub-pixel offset for smooth scrolling labels */
  const offX = -(cam.x % TILE);
  const offY = -(cam.y % TILE);

  /* ── Selection rect in screen pixels ───────────────────────── */
  let selRect: { x: number; y: number; w: number; h: number } | null = null;
  let selLabel = "";
  if (sel) {
    const c1 = Math.min(sel.startCol, sel.endCol);
    const c2 = Math.max(sel.startCol, sel.endCol);
    const r1 = Math.min(sel.startRow, sel.endRow);
    const r2 = Math.max(sel.startRow, sel.endRow);
    selRect = {
      x: c1 * TILE - cam.x,
      y: r1 * TILE - cam.y,
      w: (c2 - c1 + 1) * TILE,
      h: (r2 - r1 + 1) * TILE,
    };
    if (c1 === c2 && r1 === r2) {
      selLabel = `c(${c1}), r(${r1})`;
    } else {
      const colPart = c1 === c2 ? `c(${c1})` : `c(${c1} - ${c2})`;
      const rowPart = r1 === r2 ? `r(${r1})` : `r(${r1} - ${r2})`;
      selLabel = `selected:\n${colPart}\n${rowPart}`;
    }
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: VIEW_W,
        height: VIEW_H,
        pointerEvents: "auto",
        cursor: "crosshair",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* ── Column labels (top) ──────────────────────────────── */}
      {Array.from({ length: lastCol - firstCol + 1 }, (_, i) => {
        const col = firstCol + i;
        return (
          <span
            key={`c${col}`}
            style={{
              position: "absolute",
              top: 0,
              left: offX + i * TILE,
              width: TILE,
              textAlign: "center",
              fontSize: 7,
              lineHeight: "10px",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "monospace",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {col}
          </span>
        );
      })}

      {/* ── Row labels (left) ────────────────────────────────── */}
      {Array.from({ length: lastRow - firstRow + 1 }, (_, i) => {
        const row = firstRow + i;
        return (
          <span
            key={`r${row}`}
            style={{
              position: "absolute",
              left: 1,
              top: offY + i * TILE + 3,
              fontSize: 7,
              lineHeight: "10px",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "monospace",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {row}
          </span>
        );
      })}

      {/* ── Grid lines ───────────────────────────────────────── */}
      <svg
        width={VIEW_W}
        height={VIEW_H}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {/* Vertical lines */}
        {Array.from({ length: lastCol - firstCol + 2 }, (_, i) => {
          const x = offX + i * TILE;
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={VIEW_H}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}
        {/* Horizontal lines */}
        {Array.from({ length: lastRow - firstRow + 2 }, (_, i) => {
          const y = offY + i * TILE;
          return (
            <line
              key={`h${i}`}
              x1={0}
              y1={y}
              x2={VIEW_W}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* ── Selection rectangle ──────────────────────────────── */}
      {selRect && (
        <>
          <div
            style={{
              position: "absolute",
              left: selRect.x,
              top: selRect.y,
              width: selRect.w,
              height: selRect.h,
              border: "2px solid red",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: selRect.x + selRect.w + 6,
              top: selRect.y,
              color: "red",
              fontSize: 13,
              fontFamily: "monospace",
              fontWeight: 700,
              lineHeight: "1.3",
              whiteSpace: "pre",
              pointerEvents: "none",
              userSelect: "none",
              textShadow: "0 0 4px rgba(0,0,0,0.9)",
            }}
          >
            {selLabel}
          </div>
        </>
      )}

      {/* ── Toggle hint ──────────────────────────────────────── */}
      <span
        style={{
          position: "absolute",
          bottom: 2,
          right: 6,
          fontSize: 9,
          color: "rgba(255,255,255,0.35)",
          fontFamily: "monospace",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        ` to toggle grid
      </span>
    </div>
  );
}
