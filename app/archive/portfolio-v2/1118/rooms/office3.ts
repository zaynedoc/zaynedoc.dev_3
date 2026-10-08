import type { RoomDef, TileDef } from "../engine/types";

const COLS = 24;
const ROWS = 12;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],[105,-1,"none"],
  /* r1 */ [135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],[135,-1,"none"],
  /* r2 */ [165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],[165,-1,"none"],
  /* r3 */ [329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,27,"none"],[329,28,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,27,"none"],[329,28,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,27,"none"],[329,28,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],
  /* r4 */ [329,-1,"none"],[329,84,"none"],[329,85,"none"],[329,-1,"none"],[329,192,"none"],[329,193,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,192,"none"],[329,193,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,-1,"none"],[329,192,"none"],[329,193,"none"],[329,-1,"none"],[329,84,"none"],[329,85,"none"],[329,-1,"none"],
  /* r5 */ [329,-1,"none"],[103,114,"none"],[103,115,"none"],[42,-1,"none"],[42,222,"none"],[42,223,"none"],[42,-1,"none"],[42,-1,"none"],[42,-1,"none"],[42,-1,"none"],[42,-1,"none"],[42,222,"none"],[42,223,"none"],[42,-1,"none"],[329,-1,"none"],[42,-1,"none"],[42,-1,"none"],[42,-1,"none"],[42,222,"none"],[42,223,"none"],[329,-1,"none"],[103,114,"none"],[103,115,"none"],[329,-1,"none"],
  /* r6 */ [359,-1,"none"],[133,-1,"none"],[133,-1,"none"],[72,-1,"none"],[72,252,"none"],[72,253,"none"],[72,-1,"none"],[72,-1,"none"],[72,-1,"none"],[72,-1,"none"],[72,-1,"none"],[72,252,"none"],[72,253,"none"],[72,-1,"none"],[359,-1,"none"],[72,-1,"none"],[72,-1,"none"],[72,-1,"none"],[72,252,"none"],[72,253,"none"],[359,-1,"none"],[133,-1,"none"],[133,-1,"none"],[359,-1,"none"],
  /* r7 */ [389,-1,"none"],[134,24,"none"],[134,25,"none"],[102,-1,"none"],[102,282,"none"],[102,283,"none"],[102,-1,"none"],[102,-1,"none"],[102,-1,"none"],[102,-1,"none"],[102,-1,"none"],[102,282,"none"],[102,283,"none"],[102,-1,"none"],[389,-1,"none"],[102,-1,"none"],[102,-1,"none"],[102,-1,"none"],[102,282,"none"],[102,283,"none"],[389,-1,"none"],[134,24,"none"],[134,25,"none"],[389,-1,"none"],
  /* r8 */ [419,-1,"none"],[44,-1,"none"],[45,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,179,"none",false,true],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[419,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[132,-1,"none"],[419,-1,"none"],[44,-1,"none"],[45,-1,"none"],[419,-1,"none"],
  /* r9 */ [449,-1,"solid"],[74,-1,"door-interact"],[75,-1,"door-interact"],[162,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[162,209,"solid",false,true],[162,-1,"solid"],[162,117,"solid"],[162,118,"solid"],[162,119,"solid"],[162,-1,"solid"],[449,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[162,-1,"solid"],[449,-1,"solid"],[74,-1,"door-interact"],[75,-1,"door-interact"],[449,-1,"solid"],
  /* r10 */ [279,-1,"none"],[280,-1,"none"],[281,-1,"none"],[279,-1,"none"],[280,-1,"none"],[281,-1,"none"],[279,-1,"none"],[280,-1,"none"],[281,239,"solid"],[279,-1,"none"],[280,147,"solid"],[281,148,"solid"],[279,149,"solid"],[280,-1,"none"],[281,-1,"none"],[279,116,"interactable"],[280,-1,"none"],[281,-1,"none"],[279,-1,"none"],[280,-1,"none"],[281,-1,"none"],[279,-1,"none"],[280,-1,"none"],[281,-1,"none"],
  /* r11 */ [339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],[339,-1,"none"],[340,-1,"none"],[341,-1,"none"],
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

const office3: RoomDef = {
  id: "office3",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: cathedral
  teleports: {
    "9,1": { roomId: "office2", spawnCol: 48, spawnRow: 10, spawnDir: "down" },
    "9,2": { roomId: "office2", spawnCol: 48, spawnRow: 10, spawnDir: "down" },
    "9,21": { roomId: "crystal1", spawnCol: 28, spawnRow: 26, spawnDir: "down" },
    "9,22": { roomId: "crystal1", spawnCol: 28, spawnRow: 26, spawnDir: "down" },
  },
  interactables: {
    "10,15": { id: "note1", type: "dialogue", lines: ["It's the same paper from before,", "but the letters are swapped in an unfamiliar order."] },
  },
  defaultSpawn: { col: 1, row: 10, dir: "down" },
};

export default office3;
