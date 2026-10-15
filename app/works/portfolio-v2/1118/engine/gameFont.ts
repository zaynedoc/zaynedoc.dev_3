/* ================================================================
   1118 Game Engine — Custom Font Loader
   Drop your TrueType font at:  public/fonts/game.ttf
   The font is loaded once via the FontFace API and registered with
   the document, making it available to canvas ctx.font strings.
   Falls back gracefully to Consolas / monospace if not found.
   ================================================================ */

/** Internal font-family name used in ctx.font strings. */
export const GAME_FONT_FAMILY = "GamePixel";

/** Path served from /public. Rename your file or edit this path. */
const FONT_URL = "/fonts/game.ttf";

/** Set this size (px) to match your font's intended grid size.
 *  Common values: 8, 10, 16.  Pixel fonts look sharpest at integer
 *  multiples of their native size. */
export const GAME_FONT_SIZE = 11;

/* ── Internal state ─────────────────────────────────────────────── */

let loaded = false;
let loadPromise: Promise<void> | null = null;

/* ── Loader ─────────────────────────────────────────────────────── */

/**
 * Load and register the game font.
 * Safe to call multiple times — only loads once.
 * Call with `await` before the first frame so the font is ready.
 */
export async function loadGameFont(): Promise<void> {
  if (loaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const face = new FontFace(GAME_FONT_FAMILY, `url(${FONT_URL})`);
      await face.load();
      document.fonts.add(face);
      loaded = true;
    } catch {
      console.warn(
        `[1118] Game font not found at "${FONT_URL}" — falling back to monospace.`
      );
    }
  })();

  return loadPromise;
}

/* ── Helper ─────────────────────────────────────────────────────── */

/**
 * Returns a ctx.font string using the custom game font if loaded,
 * otherwise the system monospace stack.
 *
 * @param size  Font size in pixels (defaults to GAME_FONT_SIZE).
 */
export function gameFontString(size = GAME_FONT_SIZE): string {
  if (loaded) return `${size}px ${GAME_FONT_FAMILY}`;
  return `${size}px Consolas, Monaco, "Courier New", monospace`;
}
