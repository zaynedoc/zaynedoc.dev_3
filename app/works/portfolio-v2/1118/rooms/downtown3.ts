import type { RoomDef, TileDef } from "../engine/types";
const bgMallRooftopSrc = "/1118-sprites/backgrounds/mall-rooftop.png";

const COLS = 30;
const ROWS = 20;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [781,-1,"none"],[782,-1,"none"],[783,-1,"none"],[784,-1,"none"],[785,-1,"none"],[786,-1,"none"],[787,-1,"none"],[788,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,636,"none"],[1040,-1,"none"],[1041,-1,"none"],[1042,-1,"none"],[1043,-1,"none"],[1044,-1,"none"],[1045,-1,"none"],[1046,-1,"none"],[1047,635,"none"],[1048,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1535,-1,"none"],[1536,-1,"none"],[1537,-1,"none"],[1538,-1,"none"],[1539,-1,"none"],
  /* r1 */ [880,-1,"none"],[881,-1,"none"],[882,-1,"none"],[883,-1,"none"],[884,-1,"none"],[885,636,"none"],[886,-1,"none"],[887,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,735,"none"],[1139,-1,"none"],[1140,-1,"none"],[1141,-1,"none"],[1142,-1,"none"],[1143,-1,"none"],[1144,-1,"none"],[1145,-1,"none"],[1146,734,"none"],[1147,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1634,-1,"none"],[1635,635,"none"],[1636,-1,"none"],[1637,-1,"none"],[1638,-1,"none"],
  /* r2 */ [979,-1,"none"],[980,-1,"none"],[981,-1,"none"],[982,-1,"none"],[983,-1,"none"],[984,735,"none"],[985,-1,"none"],[986,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,828,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,827,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1733,-1,"none"],[1734,734,"none"],[1735,-1,"none"],[1736,-1,"none"],[1737,-1,"none"],
  /* r3 */ [1078,-1,"none"],[1079,-1,"none"],[1080,-1,"none"],[1081,-1,"none"],[1082,-1,"none"],[1083,828,"none"],[1084,-1,"none"],[1085,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1127,927,"interactable"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1127,926,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1832,-1,"none"],[1833,827,"none"],[1834,-1,"none"],[1835,-1,"none"],[1836,-1,"none"],
  /* r4 */ [1177,-1,"none"],[1178,-1,"none"],[1179,-1,"none"],[1180,-1,"none"],[1181,-1,"none"],[1127,927,"none"],[1183,-1,"none"],[1184,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1127,926,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r5 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r6 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r7 */ [-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],
  /* r8 */ [2597,-1,"door-auto"],[2598,-1,"none"],[2599,-1,"none"],[2600,-1,"none"],[2597,-1,"none"],[2598,325,"none",false,true],[2599,325,"none",false,true],[2600,-1,"none"],[2597,-1,"none"],[2597,-1,"none"],[2598,-1,"none"],[2599,-1,"none"],[2600,-1,"none"],[2597,-1,"none"],[2598,-1,"none"],[2597,-1,"none"],[2597,-1,"none"],[2592,-1,"none"],[2593,-1,"none"],[2594,-1,"none"],[2595,-1,"none"],[2598,-1,"none"],[2599,325,"none",false,true],[2600,-1,"none"],[2600,-1,"none"],[2597,-1,"none"],[2598,-1,"none"],[2597,-1,"none"],[2598,-1,"none"],[2599,-1,"door-auto"],
  /* r9 */ [2696,-1,"door-auto"],[2697,-1,"none"],[2698,-1,"none"],[2699,-1,"none"],[2696,-1,"none"],[2697,424,"solid"],[2698,424,"solid"],[2699,-1,"none"],[2696,-1,"none"],[2696,-1,"none"],[2697,-1,"none"],[2698,325,"none",false,true],[2699,-1,"none",false,true],[2696,-1,"none",false,true],[2697,325,"none",false,true],[2696,-1,"none"],[2696,-1,"none"],[2697,-1,"none"],[2698,-1,"none"],[2699,-1,"none"],[2697,-1,"none"],[2697,-1,"none"],[2698,424,"solid"],[2699,-1,"none"],[2699,-1,"none"],[2696,-1,"none"],[2697,-1,"none"],[2696,-1,"none"],[2697,-1,"none"],[2698,-1,"door-auto"],
  /* r10 */ [2795,-1,"door-auto"],[2796,-1,"none"],[2797,-1,"none"],[2798,-1,"none"],[2795,-1,"none"],[2796,-1,"none"],[2797,-1,"none"],[2798,-1,"none"],[2795,-1,"none"],[2795,-1,"none"],[2796,-1,"none"],[2797,424,"solid"],[2798,-1,"none"],[2795,-1,"none"],[2796,424,"solid"],[2795,-1,"none"],[2795,-1,"none"],[2796,-1,"none"],[2797,325,"none",false,true],[2798,-1,"none"],[2796,417,"interactable"],[2796,-1,"none"],[2797,-1,"none"],[2798,-1,"none"],[2798,-1,"none"],[2795,-1,"none"],[2796,-1,"none"],[2795,-1,"none"],[2796,-1,"none"],[2797,-1,"door-auto"],
  /* r11 */ [2894,-1,"door-auto"],[2895,-1,"none"],[2896,-1,"none"],[2897,-1,"none"],[2894,-1,"none"],[2895,-1,"none"],[2896,-1,"none"],[2897,-1,"none"],[2894,-1,"none"],[2894,-1,"none"],[2895,-1,"none"],[2896,-1,"none"],[2897,-1,"none"],[2894,-1,"none"],[2895,-1,"none"],[2894,-1,"none"],[2894,-1,"none"],[2889,-1,"none"],[2890,424,"solid"],[2891,-1,"none"],[2892,-1,"none"],[2895,-1,"none"],[2896,-1,"none"],[2897,-1,"none"],[2897,-1,"none"],[2894,-1,"none"],[2895,-1,"none"],[2894,-1,"none"],[2895,-1,"none"],[2896,-1,"door-auto"],
  /* r12 */ [-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],[-1,-1,"solid"],
  /* r13 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,636,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r14 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,735,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,636,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,635,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r15 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,828,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,735,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"none"],[2400,-1,"none"],[2401,325,"none",false,true],[2402,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,734,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r16 */ [1936,-1,"none"],[1937,-1,"none"],[1938,-1,"none"],[1939,-1,"none"],[1940,-1,"none"],[1941,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1127,927,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,828,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,424,"solid"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,827,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r17 */ [2035,-1,"none"],[2036,-1,"none"],[2037,-1,"none"],[2038,-1,"none"],[2039,-1,"none"],[2040,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1127,927,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1338,-1,"none"],[1127,926,"interactable"],[1340,-1,"none"],[1341,-1,"none"],
  /* r18 */ [2134,-1,"none"],[2135,-1,"none"],[2136,-1,"none"],[2137,-1,"none"],[2138,-1,"none"],[2139,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1437,-1,"none"],[1438,-1,"none"],[1439,-1,"none"],[1440,-1,"none"],
  /* r19 */ [2233,-1,"none"],[2234,-1,"none"],[2235,-1,"none"],[2236,-1,"none"],[2237,-1,"none"],[2238,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"door-auto"],[2400,-1,"door-auto"],[2401,-1,"door-auto"],[2402,-1,"door-auto"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1536,-1,"none"],[1537,-1,"none"],[1538,-1,"none"],[1539,-1,"none"],
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

const downtown3: RoomDef = {
  id: "downtown3",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: downtown
  tilesetCols: 99,
  backgroundSrc: bgMallRooftopSrc, // background: mall-rooftop
  bgScrollMode: "left-to-right",
  teleports: {
    "8,0": { roomId: "downtown1", spawnCol: 58, spawnRow: 25, spawnDir: "left" },
    "9,0": { roomId: "downtown1", spawnCol: 58, spawnRow: 25, spawnDir: "left" },
    "10,0": { roomId: "downtown1", spawnCol: 58, spawnRow: 25, spawnDir: "left" },
    "11,0": { roomId: "downtown1", spawnCol: 58, spawnRow: 25, spawnDir: "left" },
    "8,29": { roomId: "downtown1", spawnCol: 1, spawnRow: 16, spawnDir: "right" },
    "9,29": { roomId: "downtown1", spawnCol: 1, spawnRow: 16, spawnDir: "right" },
    "10,29": { roomId: "downtown1", spawnCol: 1, spawnRow: 16, spawnDir: "right" },
    "11,29": { roomId: "downtown1", spawnCol: 1, spawnRow: 16, spawnDir: "right" },
    "19,17": { roomId: "downtown1", spawnCol: 55, spawnRow: 1, spawnDir: "down" },
    "19,18": { roomId: "downtown1", spawnCol: 55, spawnRow: 1, spawnDir: "down" },
    "19,19": { roomId: "downtown1", spawnCol: 55, spawnRow: 1, spawnDir: "down" },
    "19,20": { roomId: "downtown1", spawnCol: 55, spawnRow: 1, spawnDir: "down" },
  },
  interactables: {
    "10,20": { id: "trashKey1", type: "event", lines: ["You reach into the trash.", "You found a key!"], lockId: "officeBuildingDoor1", changeType: "door-interact", changeTeleport: { roomId: "office1", spawnCol: 21, spawnRow: 10, spawnDir: "up" }, changeDoorSound: "key.wav" },
    "3,12": { id: "new-interact", type: "dialogue", lines: ["Hello!"], proxSound: "clock.wav", proxSoundMode: "interval", proxSoundInterval: 1.677, proxSoundVolume: 0.8, proxSoundMaxDist: 16 },
    "17,27": { id: "new-interact", type: "dialogue", lines: ["Hello!"], proxSound: "clock.wav", proxSoundMode: "interval", proxSoundInterval: 3, proxSoundVolume: 0.9, proxSoundMaxDist: 12 },
  },
  defaultSpawn: { col: 1, row: 9, dir: "down" },
  musicKey: "Alone-Again.wav",
  animTiles: {
    "635": [635, 632],
    "636": [636, 633],
  },
  animIntervalMs: 500,
};

export default downtown3;
