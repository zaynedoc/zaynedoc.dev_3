import type { RoomDef, TileDef } from "../engine/types";

const COLS = 30;
const ROWS = 20;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],[372,-1,"none"],
  /* r1 */ [14,-1,"none"],[223,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[165,-1,"solid"],[164,-1,"solid"],[164,-1,"solid"],[222,-1,"solid"],[14,-1,"none"],
  /* r2 */ [345,-1,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[14,-1,"none"],
  /* r3 */ [345,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,-1,"none"],
  /* r4 */ [345,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,-1,"none"],
  /* r5 */ [14,-1,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[12,-1,"none"],[12,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[345,-1,"none"],
  /* r6 */ [14,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,-1,"none"],
  /* r7 */ [14,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[14,-1,"none"],
  /* r8 */ [14,-1,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[194,-1,"none"],
  /* r9 */ [14,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,378,"none",false,true],[12,379,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[345,-1,"none"],
  /* r10 */ [194,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[104,408,"door-interact"],[105,409,"door-interact"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[194,-1,"none"],
  /* r11 */ [194,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[194,-1,"none"],
  /* r12 */ [14,-1,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,-1,"none"],
  /* r13 */ [14,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,-1,"none"],
  /* r14 */ [14,-1,"none"],[137,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,9,"none",false,true],[13,10,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[106,-1,"solid"],[14,-1,"none"],
  /* r15 */ [14,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,39,"none",false,true],[12,40,"none",false,true],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[345,-1,"none"],
  /* r16 */ [345,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,69,"interactable"],[12,70,"interactable"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[14,-1,"none"],
  /* r17 */ [14,-1,"none"],[107,-1,"solid"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[13,-1,"none"],[13,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[12,-1,"none"],[136,-1,"solid"],[14,-1,"none"],
  /* r18 */ [14,-1,"none"],[193,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[135,-1,"solid"],[134,-1,"solid"],[134,-1,"solid"],[192,-1,"solid"],[14,-1,"none"],
  /* r19 */ [345,-1,"none"],[345,-1,"none"],[345,-1,"none"],[345,-1,"none"],[345,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[194,-1,"none"],[194,-1,"none"],[194,-1,"none"],[345,-1,"none"],[14,-1,"none"],[14,-1,"none"],[194,-1,"none"],[345,-1,"none"],[345,-1,"none"],[14,-1,"none"],[345,-1,"none"],[345,-1,"none"],[345,-1,"none"],[345,-1,"none"],[345,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],[14,-1,"none"],
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

const forest1: RoomDef = {
  id: "forest1",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: forest
  tilesetCols: 30,
  teleports: {
    "10,15": { roomId: "island1", spawnCol: 10, spawnRow: 10, spawnDir: "up" },
    "10,16": { roomId: "island1", spawnCol: 10, spawnRow: 10, spawnDir: "up" },
  },
  interactables: {
    "7,5": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "7,6": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "6,24": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "6,25": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "15,23": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "15,24": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "16,6": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "16,7": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "14,18": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "14,19": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "7,19": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "7,20": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "14,11": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "14,12": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "6,9": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
    "6,10": { id: "forest-tree1", type: "dialogue", lines: ["A large tree stands before you."] },
  },
  defaultSpawn: { col: 6, row: 8, dir: "down" },
  musicKey: "I_have_always_loved_you.mp3",
  animTiles: {
    "14": [14, 345, 194, 14],
    "194": [194, 14, 345, 194],
    "345": [345, 14, 345, 194],
  },
  animIntervalMs: 500,
};

export default forest1;
