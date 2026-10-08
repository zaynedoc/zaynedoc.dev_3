import type { RoomDef, TileDef } from "../engine/types";

const COLS = 24;
const ROWS = 18;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r1 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r2 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r3 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r4 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r5 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"solid"],[122,57,"solid"],[122,58,"solid"],[122,58,"solid"],[122,58,"solid"],[122,58,"solid"],[122,58,"solid"],[122,58,"solid"],[122,59,"solid"],[122,-1,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r6 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r7 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,146,"interactable"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r8 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r9 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r10 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r11 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,15,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r12 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"solid"],[122,29,"solid"],[122,27,"solid"],[122,29,"solid"],[122,29,"solid"],[122,29,"solid"],[122,29,"solid"],[122,28,"none"],[122,29,"solid"],[122,-1,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r13 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"door-auto"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r14 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r15 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r16 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
  /* r17 */ [122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],
];

function buildTiles(): TileDef[] {
  return DATA.map(([bgTile, fgTile, collision, flipX, overlay]) => ({
    bgTile,
    fgTile,
    collision: collision as TileDef["collision"],
    flipX: flipX ?? false,
    overlay: overlay ?? false,
  }));
}

const water3: RoomDef = {
  id: "water3",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: watermill
  tilesetCols: 30,
  teleports: {
    "13,14": { roomId: "downtown4", spawnCol: 47, spawnRow: 14, spawnDir: "down" },
  },
  interactables: {
    "7,12": { id: "paperWater", type: "event", lines: ["The grass withers away."], lockId: "grassLiminal", changeType: "none", changeSpriteCol: 20, changeSpriteRow: 13 },
  },
  defaultSpawn: { col: 11, row: 9, dir: "down" },
  musicKey: "Edge-of-Ocean.wav",
  animTiles: {
    "122": [122, 121, 120, 92, 91, 90, 62, 61, 60, 32, 31, 30, 2, 1, 0, 1, 2, 30, 31, 32, 60, 61, 62, 90, 91, 92, 120, 121],
  },
  animIntervalMs: 500,
};

export default water3;
