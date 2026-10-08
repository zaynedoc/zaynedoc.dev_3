import type { RoomDef, TileDef } from "../engine/types";

const COLS = 6;
const ROWS = 30;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[407,-1,"door-auto"],
  /* r1 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[437,-1,"door-auto"],
  /* r2 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[465,-1,"none"],[466,-1,"none"],[467,-1,"door-auto"],
  /* r3 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r4 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r5 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r6 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r7 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r8 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r9 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r10 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r11 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r12 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r13 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r14 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r15 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r16 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r17 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r18 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r19 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r20 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r21 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r22 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r23 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r24 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r25 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r26 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r27 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r28 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
  /* r29 */ [301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"none"],[301,-1,"solid"],[301,-1,"solid"],
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

const crystal2: RoomDef = {
  id: "crystal2",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: paradigm
  tilesetCols: 30,
  teleports: {
    "0,5": { roomId: "downtown4", spawnCol: 24, spawnRow: 14, spawnDir: "down" },
    "1,5": { roomId: "downtown4", spawnCol: 24, spawnRow: 14, spawnDir: "down" },
    "2,5": { roomId: "downtown4", spawnCol: 24, spawnRow: 14, spawnDir: "down" },
  },
  interactables: {},
  defaultSpawn: { col: 2, row: 27, dir: "down" },
  musicKey: "hazydarkness.wav",
};

export default crystal2;
