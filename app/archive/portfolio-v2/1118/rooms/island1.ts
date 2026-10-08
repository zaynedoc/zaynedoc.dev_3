import type { RoomDef, TileDef } from "../engine/types";

const COLS = 23;
const ROWS = 16;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [372,322,"none"],[372,262,"none"],[372,262,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,261,"none"],[372,262,"none"],[372,262,"none"],[372,323,"none"],
  /* r1 */ [14,348,"none"],[223,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[222,-1,"solid"],[14,349,"none"],
  /* r2 */ [345,348,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,349,"none"],
  /* r3 */ [345,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,6,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,319,"none"],
  /* r4 */ [345,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,36,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,6,"none",false,true],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,319,"none"],
  /* r5 */ [14,318,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,6,"none",false,true],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,36,"solid"],[13,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,319,"none"],
  /* r6 */ [14,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,36,"solid"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,321,"solid"],
  /* r7 */ [14,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[402,-1,"none"],[194,468,"door-auto"],
  /* r8 */ [14,318,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,378,"none",false,true],[12,379,"none",false,true],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[432,-1,"none"],[347,-1,"door-auto"],
  /* r9 */ [14,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[104,408,"door-interact"],[105,409,"door-interact"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,351,"solid"],
  /* r10 */ [194,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,6,"none",false,true],[12,-1,"none"],[106,-1,"solid"],[194,319,"none"],
  /* r11 */ [194,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,6,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,36,"solid"],[12,-1,"none"],[106,-1,"solid"],[194,319,"none"],
  /* r12 */ [345,318,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,36,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,319,"none"],
  /* r13 */ [14,348,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[14,349,"none"],
  /* r14 */ [14,348,"none"],[193,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[192,-1,"solid"],[14,349,"none"],
  /* r15 */ [345,352,"none"],[345,292,"none"],[345,292,"none"],[345,291,"none"],[345,291,"none"],[14,291,"none"],[14,291,"none"],[14,291,"none"],[14,291,"none"],[14,291,"none"],[194,291,"none"],[194,291,"none"],[194,291,"none"],[345,291,"none"],[14,291,"none"],[14,291,"none"],[194,291,"none"],[345,291,"none"],[345,291,"none"],[345,291,"none"],[14,292,"none"],[14,292,"none"],[345,353,"none"],
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

const island1: RoomDef = {
  id: "island1",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: forest
  tilesetCols: 30,
  teleports: {
    "9,10": { roomId: "forest1", spawnCol: 15, spawnRow: 15, spawnDir: "up" },
    "9,11": { roomId: "forest1", spawnCol: 15, spawnRow: 15, spawnDir: "up" },
    "7,22": { roomId: "bridge1", spawnCol: 2, spawnRow: 1, spawnDir: "right" },
    "8,22": { roomId: "bridge1", spawnCol: 2, spawnRow: 1, spawnDir: "right" },
  },
  interactables: {
    "13,23": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
  },
  defaultSpawn: { col: 10, row: 10, dir: "up" },
  musicKey: "I_have_always_loved_you.mp3",
  animTiles: {
    "14": [14, 345, 194, 14],
    "194": [194, 14, 345, 194],
    "345": [345, 14, 345, 194],
  },
  animIntervalMs: 500,
};

export default island1;
