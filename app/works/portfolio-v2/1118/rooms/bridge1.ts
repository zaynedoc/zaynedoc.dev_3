import type { RoomDef, TileDef } from "../engine/types";

const COLS = 40;
const ROWS = 4;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[223,-1,"solid"],
  /* r1 */ [317,-1,"door-auto"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[194,468,"none"],[194,468,"none"],[194,468,"none"],[194,468,"none"],[194,468,"none"],[194,468,"none"],[194,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[14,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,468,"none"],[345,252,"door-auto"],
  /* r2 */ [347,-1,"door-auto"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[347,-1,"none"],[282,-1,"door-auto"],
  /* r3 */ [345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[194,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[14,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[345,-1,"solid"],[193,-1,"solid"],
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

const bridge1: RoomDef = {
  id: "bridge1",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: forest
  tilesetCols: 30,
  teleports: {
    "1,0": { roomId: "island1", spawnCol: 21, spawnRow: 7, spawnDir: "left" },
    "2,0": { roomId: "island1", spawnCol: 21, spawnRow: 7, spawnDir: "left" },
    "1,39": { roomId: "downtown1", spawnCol: 1, spawnRow: 15, spawnDir: "right" },
    "2,39": { roomId: "downtown1", spawnCol: 1, spawnRow: 15, spawnDir: "right" },
  },
  interactables: {},
  defaultSpawn: { col: 1, row: 2, dir: "right" },
  animTiles: {
    "14": [14, 345, 194],
    "194": [194, 345, 345, 14],
    "345": [345, 14, 194, 194],
  },
  animIntervalMs: 500,
};

export default bridge1;
