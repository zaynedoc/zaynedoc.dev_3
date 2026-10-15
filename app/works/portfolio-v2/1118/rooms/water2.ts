import type { RoomDef, TileDef } from "../engine/types";

const COLS = 24;
const ROWS = 13;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[296,239,"none"],[296,239,"none"],[296,239,"none"],[296,239,"none"],[13,-1,"none"],[13,-1,"none"],
  /* r1 */ [43,-1,"none"],[43,-1,"none"],[43,-1,"none"],[43,327,"none"],[43,328,"none"],[43,-1,"none"],[43,-1,"none"],[43,-1,"none"],[43,-1,"none"],[43,327,"none"],[43,328,"none"],[43,327,"none"],[43,328,"none"],[43,-1,"none"],[43,-1,"none"],[43,-1,"none"],[43,-1,"none"],[43,-1,"none"],[296,269,"none"],[296,269,"none"],[296,269,"none"],[296,269,"none"],[43,-1,"none"],[43,-1,"none"],
  /* r2 */ [73,-1,"none"],[73,-1,"none"],[73,-1,"none"],[73,357,"none"],[73,358,"none"],[73,-1,"none"],[16,-1,"none"],[17,-1,"none"],[73,-1,"none"],[73,357,"none"],[73,358,"none"],[73,357,"none"],[73,358,"none"],[73,-1,"none"],[73,-1,"none"],[73,-1,"none"],[73,-1,"none"],[73,-1,"none"],[296,299,"none"],[296,329,"none"],[296,329,"none"],[296,299,"none"],[73,-1,"none"],[73,-1,"none"],
  /* r3 */ [103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[103,-1,"none"],[296,299,"none"],[296,359,"none"],[296,359,"none"],[296,299,"none"],[103,-1,"none"],[103,-1,"none"],
  /* r4 */ [133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,16,"none"],[133,17,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,16,"none"],[133,17,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[133,-1,"none"],[74,299,"none"],[-1,-1,"none"],[-1,-1,"none"],[74,299,"none"],[133,-1,"none"],[133,-1,"none"],
  /* r5 */ [163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[163,-1,"none"],[104,329,"none"],[-1,-1,"none"],[-1,-1,"none"],[104,329,"none"],[163,-1,"none"],[163,-1,"none"],
  /* r6 */ [193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"solid"],[193,-1,"none"],[193,208,"none"],[193,209,"none"],[193,-1,"none"],[193,208,"none"],[193,209,"none"],[193,177,"none"],[193,-1,"solid"],[193,-1,"solid"],[134,359,"solid"],[-1,-1,"door-auto"],[-1,-1,"door-auto"],[134,359,"solid"],[193,-1,"solid"],[193,-1,"solid"],
  /* r7 */ [14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[13,29,"solid"],[13,29,"none"],[13,29,"none"],[13,29,"none"],[13,29,"none"],[13,29,"none"],[13,29,"solid"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],
  /* r8 */ [15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],
  /* r9 */ [15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[122,87,"solid"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,-1,"none"],[122,89,"solid"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],
  /* r10 */ [15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[122,117,"solid"],[122,118,"solid"],[122,118,"solid"],[122,118,"solid"],[122,118,"solid"],[122,118,"solid"],[122,119,"solid"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],
  /* r11 */ [15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],
  /* r12 */ [15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],[15,-1,"none"],
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

const water2: RoomDef = {
  id: "water2",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: watermill
  tilesetCols: 30,
  teleports: {
    "6,19": { roomId: "water1", spawnCol: 36, spawnRow: 6, spawnDir: "down" },
    "6,20": { roomId: "water1", spawnCol: 36, spawnRow: 6, spawnDir: "down" },
  },
  interactables: {},
  defaultSpawn: { col: 4, row: 9, dir: "down" },
  musicKey: "underwaterloop.wav",
  animTiles: {
    "122": [122, 121, 120, 92, 91, 90, 62, 61, 60, 32, 31, 30, 2, 1, 0, 1, 2, 30, 31, 32, 60, 61, 62, 90, 91, 92, 120, 121, 122],
  },
  animIntervalMs: 500,
};

export default water2;
