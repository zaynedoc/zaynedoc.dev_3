/* ── Sprite metadata for Wanted! ────────────────────────────────── */

export interface SpriteInfo {
  /** Unique id (matches filename without extension) */
  id: string;
  /** Display name shown to the player */
  name: string;
  /** Path relative to /public */
  src: string;
}

/**
 * All available sprites loaded from /public/wanted-sprites/.
 * Add entries here when new sprites are dropped into that folder.
 */
export const SPRITES: SpriteInfo[] = [
  { id: "chel",     name: "Chel",     src: "/wanted-sprites/chel.png" },
  { id: "drako",    name: "Drako",    src: "/wanted-sprites/drako.png" },
  { id: "drool",    name: "Drool",    src: "/wanted-sprites/drool.png" },
  { id: "genesis",  name: "2014 Hyundai Genesis Coupe",  src: "/wanted-sprites/genesis.png" },
  { id: "kendrick", name: "Kendrick", src: "/wanted-sprites/kendrick.png" },
  { id: "matcha",   name: "Matcha Amongus",   src: "/wanted-sprites/matcha.png" },
  { id: "me",       name: "Zayne",       src: "/wanted-sprites/me.png" },
  { id: "nerd",     name: "Nerd Hamster",     src: "/wanted-sprites/nerd.png" },
  { id: "normal",   name: "Normal Face",   src: "/wanted-sprites/normal.png" },
  { id: "toji",     name: "Toji",     src: "/wanted-sprites/toji.png" },
  { id: "ts",       name: "JavaScript but better",       src: "/wanted-sprites/ts.png" },
  { id: "vs",       name: "Visual Studio Code",       src: "/wanted-sprites/vs.png" },
  { id: "teto",     name: "Teto",     src: "/wanted-sprites/teto.png" },
];
