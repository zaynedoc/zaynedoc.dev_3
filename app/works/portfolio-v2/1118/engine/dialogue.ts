/* ================================================================
   1118 Game Engine — Dialogue System
   Typewriter-style text box at the bottom of the viewport.
   ================================================================ */

import { VIEW_W, VIEW_H } from "./constants";
import { gameFontString, GAME_FONT_SIZE } from "./gameFont";

/* ── Configuration ─────────────────────────────────────────────── */

const BOX_MARGIN = 6;
const BOX_PADDING = 8;
const LINE_HEIGHT = GAME_FONT_SIZE + 4;   // scales with font size
const BOX_HEIGHT = BOX_PADDING * 2 + LINE_HEIGHT * 2 + 10;  // fits 2 wrapped lines
const CHAR_SPEED = 30; // characters per second
const ADVANCE_INDICATOR = "▼";

/* ── State ─────────────────────────────────────────────────────── */

export interface DialogueState {
  /** All lines of dialogue to display, one at a time. */
  lines: string[];
  /** Index of the line currently being shown. */
  currentLine: number;
  /** Number of characters visible in the current line (typewriter). */
  charIndex: number;
  /** Accumulator for the typewriter timer. */
  timer: number;
  /** True when the full line is displayed and waiting for input. */
  waitingForInput: boolean;
  /** True when the dialogue is finished (all lines shown + dismissed). */
  done: boolean;
}

/* ── Constructors ──────────────────────────────────────────────── */

export function createDialogue(lines: string[]): DialogueState {
  return {
    lines,
    currentLine: 0,
    charIndex: 0,
    timer: 0,
    waitingForInput: false,
    done: lines.length === 0,
  };
}

/* ── Advance (call when Space is pressed) ──────────────────────── */

/**
 * - If still typing → complete the line instantly.
 * - If waiting for input → advance to next line, or finish.
 */
export function advanceDialogue(d: DialogueState): DialogueState {
  if (d.done) return d;

  // Still typing → complete instantly
  if (!d.waitingForInput) {
    return {
      ...d,
      charIndex: d.lines[d.currentLine].length,
      waitingForInput: true,
    };
  }

  // Move to next line
  const nextLine = d.currentLine + 1;
  if (nextLine >= d.lines.length) {
    return { ...d, done: true };
  }

  return {
    ...d,
    currentLine: nextLine,
    charIndex: 0,
    timer: 0,
    waitingForInput: false,
  };
}

/* ── Update (call every frame) ─────────────────────────────────── */

export function updateDialogue(d: DialogueState, dt: number): DialogueState {
  if (d.done || d.waitingForInput) return d;

  const line = d.lines[d.currentLine];
  const newTimer = d.timer + dt;
  const newCharIndex = Math.min(line.length, Math.floor(newTimer * CHAR_SPEED));

  if (newCharIndex >= line.length) {
    return {
      ...d,
      charIndex: line.length,
      timer: newTimer,
      waitingForInput: true,
    };
  }

  return { ...d, charIndex: newCharIndex, timer: newTimer };
}

/* ── Render ────────────────────────────────────────────────────── */

export function renderDialogue(
  ctx: CanvasRenderingContext2D,
  d: DialogueState
) {
  if (d.done) return;

  const boxX = BOX_MARGIN;
  const boxY = VIEW_H - BOX_HEIGHT - BOX_MARGIN;
  const boxW = VIEW_W - BOX_MARGIN * 2;

  // ── Background ───────────────────────────────────────────────
  ctx.fillStyle = "rgba(10, 5, 20, 0.88)";
  ctx.fillRect(boxX, boxY, boxW, BOX_HEIGHT);

  // ── Border ───────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(160, 120, 200, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, BOX_HEIGHT - 1);

  // ── Text ─────────────────────────────────────────────────────
  ctx.fillStyle = "#e8e0f0";
  ctx.font = gameFontString(GAME_FONT_SIZE);
  ctx.imageSmoothingEnabled = false;
  ctx.textBaseline = "top";

  const visibleText = d.lines[d.currentLine].slice(0, d.charIndex);
  const maxWidth = boxW - BOX_PADDING * 2;
  const wrapped = wrapText(ctx, visibleText, maxWidth);

  for (let i = 0; i < wrapped.length; i++) {
    ctx.fillText(
      wrapped[i],
      Math.round(boxX + BOX_PADDING),
      Math.round(boxY + BOX_PADDING + i * LINE_HEIGHT)
    );
  }

  // ── Advance indicator (blinking ▼) ──────────────────────────
  if (d.waitingForInput) {
    const blink = Math.floor(Date.now() / 400) % 2 === 0;
    if (blink) {
      ctx.fillStyle = "rgba(160, 120, 200, 0.8)";
      ctx.fillText(
        ADVANCE_INDICATOR,
        boxX + boxW - BOX_PADDING - 8,
        boxY + BOX_HEIGHT - BOX_PADDING - LINE_HEIGHT
      );
    }
  }
}

/* ── Word-wrap helper ──────────────────────────────────────────── */

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0) lines.push("");
  return lines;
}
