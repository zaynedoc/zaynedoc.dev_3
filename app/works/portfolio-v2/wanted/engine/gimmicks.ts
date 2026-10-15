/* ── Gimmick (special) round definitions ───────────────────────── */

export type GimmickType =
  | "bigTarget"
  | "corner"
  | "rabbit"
  | "outOfBounds"
  | "waitForIt";

export interface GimmickDef {
  type: GimmickType;
  /** Friendly label shown in debug overlay */
  label: string;
  /** Whether decoy sprites should be spawned */
  hasDecoys: boolean;
  /** Whether the target sprite is placed immediately on play start */
  targetVisibleAtStart: boolean;
}

export const GIMMICKS: GimmickDef[] = [
  {
    type: "bigTarget",
    label: "Big Target",
    hasDecoys: true,
    targetVisibleAtStart: false,   // appears at 15s remaining
  },
  {
    type: "corner",
    label: "Corner",
    hasDecoys: true,
    targetVisibleAtStart: true,    // sitting in a corner from the start
  },
  {
    type: "rabbit",
    label: "Rabbit",
    hasDecoys: true,
    targetVisibleAtStart: true,    // bouncing near bottom
  },
  {
    type: "outOfBounds",
    label: "Out of Bounds",
    hasDecoys: true,
    targetVisibleAtStart: true,    // rolls around edges
  },
  {
    type: "waitForIt",
    label: "Wait for it...",
    hasDecoys: false,              // empty field, just text
    targetVisibleAtStart: false,   // appears at 3s remaining
  },
];

/** Chance (0–1) that any given round (after round 1) is a gimmick */
export const GIMMICK_CHANCE = 0.4;

/** Pick a random gimmick, or null for a normal round.
 *  `usedTypes` prevents the same gimmick from appearing twice. */
export function rollGimmick(round: number, usedTypes: Set<GimmickType> = new Set()): GimmickDef | null {
  if (round <= 1) return null; // round 1 is always normal
  if (Math.random() > GIMMICK_CHANCE) return null;
  const pool = GIMMICKS.filter((g) => !usedTypes.has(g.type));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
