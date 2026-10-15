import type { RoomDef, TileDef } from "../engine/types";
const bgMysterySrc = "/1118-sprites/backgrounds/mystery.png";

const COLS = 20;
const ROWS = 30;

/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */
const DATA: [number, number, string, boolean?, boolean?][] = [
  /* r0 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"door-auto"],[2103,-1,"door-auto"],[2104,-1,"door-auto"],[2105,-1,"door-auto"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,635,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r1 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,636,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,734,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r2 */ [1378,-1,"none"],[1379,-1,"none"],[1380,-1,"none"],[1381,-1,"none"],[-1,735,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,827,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r3 */ [1477,-1,"none"],[1478,-1,"none"],[1479,-1,"none"],[1480,-1,"none"],[-1,828,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"none"],[2400,-1,"none"],[2401,-1,"none"],[2402,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[3097,926,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r4 */ [1576,-1,"none"],[1577,-1,"none"],[1578,521,"none"],[1579,-1,"none"],[3097,927,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,635,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r5 */ [1675,-1,"none"],[1676,-1,"none"],[1677,620,"none"],[1678,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,734,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r6 */ [1774,-1,"none"],[1775,-1,"none"],[1776,719,"none"],[1777,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,827,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[465,-1,"none"],[466,-1,"none"],
  /* r7 */ [1873,-1,"none"],[1874,-1,"none"],[1875,818,"none"],[1876,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[3097,926,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[564,-1,"none"],[565,-1,"none"],
  /* r8 */ [1972,-1,"none"],[1973,-1,"none"],[1974,-1,"none"],[1975,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[663,-1,"none"],[664,-1,"none"],
  /* r9 */ [2071,-1,"none"],[2072,-1,"none"],[2073,-1,"none"],[2074,636,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[762,-1,"none"],[763,-1,"none"],
  /* r10 */ [873,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,735,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"none"],[2400,-1,"none"],[2401,-1,"none"],[2402,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[861,-1,"none"],[862,-1,"none"],
  /* r11 */ [972,521,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,828,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1356,-1,"none"],[1357,-1,"none"],
  /* r12 */ [-1,620,"none"],[-1,-1,"none"],[-1,-1,"none"],[3097,927,"interactable"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,635,"none"],[-1,-1,"none"],[1455,-1,"none"],[1456,-1,"none"],
  /* r13 */ [773,719,"none"],[774,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,734,"none"],[-1,-1,"none"],[1554,-1,"none"],[1555,-1,"none"],
  /* r14 */ [872,818,"none"],[873,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,827,"none"],[-1,-1,"none"],[1653,-1,"none"],[1654,-1,"none"],
  /* r15 */ [971,-1,"none"],[972,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[3097,926,"none"],[-1,-1,"none"],[1752,-1,"none"],[1753,-1,"none"],
  /* r16 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"none"],[2400,-1,"none"],[2401,-1,"none"],[2402,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1851,-1,"none"],[1852,-1,"none"],
  /* r17 */ [774,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1171,-1,"none"],[1172,-1,"none"],[1173,-1,"none"],
  /* r18 */ [873,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,636,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1270,-1,"none"],[1271,-1,"none"],[1272,-1,"none"],
  /* r19 */ [972,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,735,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1369,-1,"none"],[1370,520,"none"],[1371,-1,"none"],
  /* r20 */ [785,-1,"none"],[786,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,828,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"none"],[2400,-1,"none"],[2401,-1,"none"],[2402,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1468,-1,"none"],[1469,619,"none"],[1470,-1,"none"],
  /* r21 */ [884,-1,"none"],[885,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[3097,927,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1567,-1,"none"],[1568,718,"none"],[1569,-1,"none"],
  /* r22 */ [983,-1,"none"],[984,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1666,-1,"none"],[1667,817,"none"],[1668,-1,"none"],
  /* r23 */ [1082,-1,"none"],[1083,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1765,-1,"interactable"],[1766,-1,"none"],[1767,-1,"none"],
  /* r24 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"none"],[2400,-1,"none"],[2401,-1,"none"],[2402,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1864,-1,"none"],[1865,-1,"none"],[1866,-1,"none"],
  /* r25 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[1963,-1,"none"],[1964,-1,"none"],[1965,-1,"none"],
  /* r26 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2102,-1,"none"],[2103,-1,"none"],[2104,-1,"none"],[2105,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r27 */ [-1,1069,"none"],[-1,1070,"none"],[-1,1071,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2201,-1,"none"],[2202,-1,"none"],[2203,-1,"none"],[2204,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r28 */ [-1,1168,"none"],[-1,1169,"none"],[-1,1170,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2300,-1,"none"],[2301,-1,"none"],[2302,-1,"none"],[2303,-1,"none"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
  /* r29 */ [-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"solid"],[2399,-1,"door-auto"],[2400,-1,"door-auto"],[2401,-1,"door-auto"],[2402,-1,"door-auto"],[-1,-1,"solid"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],[-1,-1,"none"],
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

const downtown2: RoomDef = {
  id: "downtown2",
  cols: COLS,
  rows: ROWS,
  tiles: buildTiles(),
  tilesetSrc: "", // resolved by registry — tileset: downtown
  tilesetCols: 99,
  backgroundSrc: bgMysterySrc, // background: mystery
  bgScrollMode: "diagonal-se",
  teleports: {
    "0,8": { roomId: "downtown1", spawnCol: 20, spawnRow: 28, spawnDir: "up" },
    "0,9": { roomId: "downtown1", spawnCol: 20, spawnRow: 28, spawnDir: "up" },
    "0,10": { roomId: "downtown1", spawnCol: 20, spawnRow: 28, spawnDir: "up" },
    "0,11": { roomId: "downtown1", spawnCol: 20, spawnRow: 28, spawnDir: "up" },
    "29,8": { roomId: "downtown1", spawnCol: 20, spawnRow: 1, spawnDir: "down" },
    "29,9": { roomId: "downtown1", spawnCol: 20, spawnRow: 1, spawnDir: "down" },
    "29,10": { roomId: "downtown1", spawnCol: 20, spawnRow: 1, spawnDir: "down" },
    "29,11": { roomId: "downtown1", spawnCol: 20, spawnRow: 1, spawnDir: "down" },
  },
  interactables: {
    "12,3": { id: "new-interact", type: "dialogue", lines: ["Hello!"], proxSound: "clock.wav", proxSoundMode: "interval", proxSoundVolume: 0.9, proxSoundMaxDist: 16 },
    "23,17": { id: "new-interact", type: "dialogue", lines: ["Hello!"], proxSound: "clock.wav", proxSoundMode: "interval", proxSoundInterval: 3.33, proxSoundVolume: 0.9, proxSoundMaxDist: 16 },
  },
  defaultSpawn: { col: 9, row: 1, dir: "down" },
  musicKey: "Alone-Again.wav",
  animTiles: {
    "635": [635, 632],
    "636": [636, 633],
  },
  animIntervalMs: 500,
};

export default downtown2;
