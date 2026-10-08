/* ================================================================
   1118 Game Engine — Input Manager
   Tracks which keys are currently held (no duplicates, no re-fire).
   ================================================================ */

const held = new Set<string>();
const justPressed = new Set<string>();

/** Attach listeners to the given element (usually the <canvas>). */
export function initInput(el: HTMLElement) {
  const down = (e: KeyboardEvent) => {
    const k = normalise(e.key);
    if (!held.has(k)) justPressed.add(k);
    held.add(k);
    // Prevent page scroll for arrow keys / space
    if (
      k === "ArrowUp" ||
      k === "ArrowDown" ||
      k === "ArrowLeft" ||
      k === "ArrowRight" ||
      k === " "
    ) {
      e.preventDefault();
    }
  };
  const up = (e: KeyboardEvent) => {
    held.delete(normalise(e.key));
  };
  const blur = () => {
    held.clear();
    justPressed.clear();
  };

  el.addEventListener("keydown", down);
  el.addEventListener("keyup", up);
  el.addEventListener("blur", blur);

  return () => {
    el.removeEventListener("keydown", down);
    el.removeEventListener("keyup", up);
    el.removeEventListener("blur", blur);
  };
}

/** Call once per frame AFTER processing input to clear justPressed. */
export function flushInput() {
  justPressed.clear();
}

/** Is the key currently held? */
export function isDown(key: string): boolean {
  return held.has(key);
}

/** Was the key pressed THIS frame (not held from previous)? */
export function isJustPressed(key: string): boolean {
  return justPressed.has(key);
}

/* Normalise WASD → Arrow equivalents so the rest of the engine
   only needs to check ArrowUp / ArrowDown / etc. */
function normalise(key: string): string {
  switch (key.toLowerCase()) {
    case "w":
      return "ArrowUp";
    case "s":
      return "ArrowDown";
    case "a":
      return "ArrowLeft";
    case "d":
      return "ArrowRight";
    default:
      return key;
  }
}