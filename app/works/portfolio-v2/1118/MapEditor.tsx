/* ================================================================
   1118 Map Editor
   Full-featured tile-based map editor with:
   - Tileset palette with bg/fg layer painting
   - Right-click collision context menu
   - Spawn point + teleport block editing
   - Room creation / dimension editing
   - Export to .ts room files
   ================================================================ */

"use client";
/* eslint-disable react-hooks/refs, @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect -- preserved legacy editor state model */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import s from "./editor.module.css";
import { TILE } from "./engine/constants";
import type {
  CollisionType,
  CutsceneDef,
  Direction,
  InteractableDef,
  RoomDef,
  TeleportTarget,
  TileDef,
} from "./engine/types";
import type { RoomEntry } from "./rooms/registry";
import { SOUND_FILES, PLAYABLE_MUSIC } from "./engine/soundCatalog";

/* ── Available tilesets (served from /public/1118-sprites/tilesets/) ── */

const TILESET_OPTIONS: Record<string, string> = {
  alienocean: "/1118-sprites/tilesets/alienocean.png",
  apartments: "/1118-sprites/tilesets/apartments.png",
  ashydesert: "/1118-sprites/tilesets/ashydesert.png",
  bathhouse: "/1118-sprites/tilesets/bathhouse.png",
  bedroom2: "/1118-sprites/tilesets/bedroom2.png",
  blacklace: "/1118-sprites/tilesets/blacklace.png",
  cathedral: "/1118-sprites/tilesets/cathedral.png",
  cavern: "/1118-sprites/tilesets/cavern.png",
  crystal: "/1118-sprites/tilesets/crystal.png",
  darktown: "/1118-sprites/tilesets/darktown.png",
  docks: "/1118-sprites/tilesets/docks.png",
  downtown: "/1118-sprites/tilesets/downtown.png",
  dreamdistrict: "/1118-sprites/tilesets/dreamdistrict.png",
  eden: "/1118-sprites/tilesets/eden.png",
  eerieapartments: "/1118-sprites/tilesets/eerieapartments.png",
  emptycity: "/1118-sprites/tilesets/emptycity.png",
  ending: "/1118-sprites/tilesets/ending.png",
  escher: "/1118-sprites/tilesets/escher.png",
  escher2: "/1118-sprites/tilesets/escher2.png",
  factory: "/1118-sprites/tilesets/factory.png",
  flowerfield: "/1118-sprites/tilesets/flowerfield.png",
  forest: "/1118-sprites/tilesets/forest.png",
  hospital: "/1118-sprites/tilesets/hospital.png",
  infinitystreet: "/1118-sprites/tilesets/infinitystreet.png",
  jovianmoon: "/1118-sprites/tilesets/jovianmoon.png",
  laboratory1: "/1118-sprites/tilesets/laboratory1.png",
  laboratory2: "/1118-sprites/tilesets/laboratory2.png",
  lampforest: "/1118-sprites/tilesets/lampforest.png",
  library: "/1118-sprites/tilesets/library.png",
  lilyfield: "/1118-sprites/tilesets/lilyfield.png",
  mauveshoal: "/1118-sprites/tilesets/mauveshoal.png",
  mistyforest: "/1118-sprites/tilesets/mistyforest.png",
  mistyforest2: "/1118-sprites/tilesets/mistyforest2.png",
  overworld: "/1118-sprites/tilesets/overworld.png",
  palace: "/1118-sprites/tilesets/palace.png",
  paradigm: "/1118-sprites/tilesets/paradigm.png",
  planetarium: "/1118-sprites/tilesets/planetarium.png",
  puppetpath: "/1118-sprites/tilesets/puppetpath.png",
  redriver: "/1118-sprites/tilesets/redriver.png",
  riverbottom: "/1118-sprites/tilesets/riverbottom.png",
  sewers: "/1118-sprites/tilesets/sewers.png",
  stoneruins: "/1118-sprites/tilesets/stoneruins.png",
  trainscar: "/1118-sprites/tilesets/trainscar.png",
  trainstation: "/1118-sprites/tilesets/trainstation.png",
  twilightvalley: "/1118-sprites/tilesets/twilightvalley.png",
  watermill: "/1118-sprites/tilesets/watermill.png",
};

/** Reverse lookup: tileset src URL → key name */
const TILESET_SRC_TO_KEY: Record<string, string> = {};
for (const [k, v] of Object.entries(TILESET_OPTIONS)) TILESET_SRC_TO_KEY[v] = k;

/* ── Available backgrounds (served from /public/1118-sprites/backgrounds/) ── */

const BACKGROUND_OPTIONS: Record<string, string> = {
  none: "",
  arena: "/1118-sprites/backgrounds/arena.png",
  barren: "/1118-sprites/backgrounds/barren.png",
  bath: "/1118-sprites/backgrounds/bath.png",
  beach: "/1118-sprites/backgrounds/beach.png",
  blur: "/1118-sprites/backgrounds/blur.png",
  bridge: "/1118-sprites/backgrounds/bridge.png",
  building: "/1118-sprites/backgrounds/building.png",
  castle: "/1118-sprites/backgrounds/castle.png",
  desert: "/1118-sprites/backgrounds/desert.png",
  dungeon1: "/1118-sprites/backgrounds/dungeon1.png",
  dungeon2: "/1118-sprites/backgrounds/dungeon2.png",
  dungeon3: "/1118-sprites/backgrounds/dungeon3.png",
  dungeon4: "/1118-sprites/backgrounds/dungeon4.png",
  dungeon5: "/1118-sprites/backgrounds/dungeon5.png",
  dungeon6: "/1118-sprites/backgrounds/dungeon6.png",
  forest1: "/1118-sprites/backgrounds/forest1.png",
  forest2: "/1118-sprites/backgrounds/forest2.png",
  "garden-background": "/1118-sprites/backgrounds/garden-background.png",
  "ghost-town": "/1118-sprites/backgrounds/ghost-town.png",
  graveyard: "/1118-sprites/backgrounds/graveyard.png",
  "mall-rooftop": "/1118-sprites/backgrounds/mall-rooftop.png",
  mountain: "/1118-sprites/backgrounds/mountain.png",
  mystery: "/1118-sprites/backgrounds/mystery.png",
  ocean: "/1118-sprites/backgrounds/ocean.png",
  plains: "/1118-sprites/backgrounds/plains.png",
  "puddle-world": "/1118-sprites/backgrounds/puddle-world.png",
  road: "/1118-sprites/backgrounds/road.png",
  rockbed: "/1118-sprites/backgrounds/rockbed.png",
  ruins1: "/1118-sprites/backgrounds/ruins1.png",
  ruins2: "/1118-sprites/backgrounds/ruins2.png",
  shipdeck: "/1118-sprites/backgrounds/shipdeck.png",
  shrine: "/1118-sprites/backgrounds/shrine.png",
  sky: "/1118-sprites/backgrounds/sky.png",
  snowfield: "/1118-sprites/backgrounds/snowfield.png",
  space: "/1118-sprites/backgrounds/space.png",
  strange: "/1118-sprites/backgrounds/strange.png",
  swamp: "/1118-sprites/backgrounds/swamp.png",
  town: "/1118-sprites/backgrounds/town.png",
  wasteland: "/1118-sprites/backgrounds/wasteland.png",
};

const BACKGROUND_SRC_TO_KEY: Record<string, string> = {};
for (const [k, v] of Object.entries(BACKGROUND_OPTIONS)) if (v) BACKGROUND_SRC_TO_KEY[v] = k;

const BG_SCROLL_MODES = [
  "diagonal-ne", "diagonal-nw", "diagonal-sw", "diagonal-se",
  "player-move", "left-to-right",
] as const;

/** Maps bg key → variable name + public path for self-contained exports */
const BG_EXPORT_MAP: Record<string, { varName: string; path: string }> = {
  arena:               { varName: "bgArenaSrc",       path: "/1118-sprites/backgrounds/arena.png" },
  barren:              { varName: "bgBarrenSrc",      path: "/1118-sprites/backgrounds/barren.png" },
  bath:                { varName: "bgBathSrc",        path: "/1118-sprites/backgrounds/bath.png" },
  beach:               { varName: "bgBeachSrc",       path: "/1118-sprites/backgrounds/beach.png" },
  blur:                { varName: "bgBlurSrc",        path: "/1118-sprites/backgrounds/blur.png" },
  bridge:              { varName: "bgBridgeSrc",      path: "/1118-sprites/backgrounds/bridge.png" },
  building:            { varName: "bgBuildingSrc",    path: "/1118-sprites/backgrounds/building.png" },
  castle:              { varName: "bgCastleSrc",      path: "/1118-sprites/backgrounds/castle.png" },
  desert:              { varName: "bgDesertSrc",      path: "/1118-sprites/backgrounds/desert.png" },
  dungeon1:            { varName: "bgDungeon1Src",    path: "/1118-sprites/backgrounds/dungeon1.png" },
  dungeon2:            { varName: "bgDungeon2Src",    path: "/1118-sprites/backgrounds/dungeon2.png" },
  dungeon3:            { varName: "bgDungeon3Src",    path: "/1118-sprites/backgrounds/dungeon3.png" },
  dungeon4:            { varName: "bgDungeon4Src",    path: "/1118-sprites/backgrounds/dungeon4.png" },
  dungeon5:            { varName: "bgDungeon5Src",    path: "/1118-sprites/backgrounds/dungeon5.png" },
  dungeon6:            { varName: "bgDungeon6Src",    path: "/1118-sprites/backgrounds/dungeon6.png" },
  forest1:             { varName: "bgForest1Src",     path: "/1118-sprites/backgrounds/forest1.png" },
  forest2:             { varName: "bgForest2Src",     path: "/1118-sprites/backgrounds/forest2.png" },
  "garden-background": { varName: "bgGardenSrc",      path: "/1118-sprites/backgrounds/garden-background.png" },
  "ghost-town":        { varName: "bgGhostTownSrc",   path: "/1118-sprites/backgrounds/ghost-town.png" },
  graveyard:           { varName: "bgGraveyardSrc",   path: "/1118-sprites/backgrounds/graveyard.png" },
  "mall-rooftop":      { varName: "bgMallRooftopSrc", path: "/1118-sprites/backgrounds/mall-rooftop.png" },
  mountain:            { varName: "bgMountainSrc",    path: "/1118-sprites/backgrounds/mountain.png" },
  mystery:             { varName: "bgMysterySrc",     path: "/1118-sprites/backgrounds/mystery.png" },
  ocean:               { varName: "bgOceanSrc",       path: "/1118-sprites/backgrounds/ocean.png" },
  plains:              { varName: "bgPlainsSrc",      path: "/1118-sprites/backgrounds/plains.png" },
  "puddle-world":      { varName: "bgPuddleWorldSrc", path: "/1118-sprites/backgrounds/puddle-world.png" },
  road:                { varName: "bgRoadSrc",        path: "/1118-sprites/backgrounds/road.png" },
  rockbed:             { varName: "bgRockbedSrc",     path: "/1118-sprites/backgrounds/rockbed.png" },
  ruins1:              { varName: "bgRuins1Src",      path: "/1118-sprites/backgrounds/ruins1.png" },
  ruins2:              { varName: "bgRuins2Src",      path: "/1118-sprites/backgrounds/ruins2.png" },
  shipdeck:            { varName: "bgShipdeckSrc",    path: "/1118-sprites/backgrounds/shipdeck.png" },
  shrine:              { varName: "bgShrineSrc",      path: "/1118-sprites/backgrounds/shrine.png" },
  sky:                 { varName: "bgSkySrc",         path: "/1118-sprites/backgrounds/sky.png" },
  snowfield:           { varName: "bgSnowfieldSrc",   path: "/1118-sprites/backgrounds/snowfield.png" },
  space:               { varName: "bgSpaceSrc",       path: "/1118-sprites/backgrounds/space.png" },
  strange:             { varName: "bgStrangeSrc",     path: "/1118-sprites/backgrounds/strange.png" },
  swamp:               { varName: "bgSwampSrc",       path: "/1118-sprites/backgrounds/swamp.png" },
  town:                { varName: "bgTownSrc",        path: "/1118-sprites/backgrounds/town.png" },
  wasteland:           { varName: "bgWastelandSrc",   path: "/1118-sprites/backgrounds/wasteland.png" },
};

const BG_SCROLL_LABELS: Record<string, string> = {
  "diagonal-ne": "↗ Northeast",
  "diagonal-nw": "↖ Northwest",
  "diagonal-sw": "↙ Southwest",
  "diagonal-se": "↘ Southeast",
  "player-move": "⟳ Player move",
  "left-to-right": "→ Left to right",
};

/* ── Constants ───────────────────────────────────────────────── */

const PALETTE_SCALE = 2;      // scale for the palette tiles
const MAP_SCALE = 2;          // scale for the map canvas

const ALL_COLLISIONS: CollisionType[] = [
  "none",
  "solid",
  "slope-left",
  "slope-right",
  "slope-left-n",
  "slope-right-n",
  "door-auto",
  "door-interact",
  "interactable",
];

const COLLISION_COLORS: Record<CollisionType, string> = {
  none: "transparent",
  solid: "rgba(255,0,0,0.3)",
  "slope-left": "rgba(255,165,0,0.3)",
  "slope-right": "rgba(255,200,0,0.3)",
  "slope-left-n": "rgba(165,255,0,0.3)",
  "slope-right-n": "rgba(200,255,0,0.3)",
  "door-auto": "rgba(0,200,255,0.3)",
  "door-interact": "rgba(0,100,255,0.3)",
  interactable: "rgba(200,0,255,0.3)",
};

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

/* ── Helper: create empty tile ───────────────────────────────── */

function emptyTile(): TileDef {
  return { bgTile: -1, fgTile: -1, collision: "none" };
}

function emptyRoom(id: string, cols: number, rows: number): RoomDef {
  const tiles: TileDef[] = [];
  for (let i = 0; i < cols * rows; i++) tiles.push(emptyTile());
  return {
    id,
    cols,
    rows,
    tiles,
    tilesetSrc: "",
    teleports: {},
    interactables: {},
    defaultSpawn: { col: 1, row: 1, dir: "down" },
    animTiles: {},
    animIntervalMs: 500,
  };
}

/* ── Naming helpers ───────────────────────────────────────────── */

/** kebab-case → camelCase: "test-forest" → "testForest" */
function idToName(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/* ── Export helper ────────────────────────────────────────────── */

function exportRoom(room: RoomDef, tilesetKey: string, bgKey: string, name: string, sheetCols: number): string {
  const lines: string[] = [];

  lines.push(`import type { RoomDef, TileDef } from "../engine/types";`);

  // If a background is selected, add its path constant
  const bgExport = bgKey !== "none" ? BG_EXPORT_MAP[bgKey] : undefined;
  if (bgExport) {
    lines.push(`const ${bgExport.varName} = "${bgExport.path}";`);
  }

  lines.push(``);
  lines.push(`const COLS = ${room.cols};`);
  lines.push(`const ROWS = ${room.rows};`);
  lines.push(``);
  lines.push(`/* Tile data — each entry is [bgTile, fgTile, collision, flipX?, overlay?] */`);
  lines.push(`const DATA: [number, number, string, boolean?, boolean?][] = [`);

  for (let r = 0; r < room.rows; r++) {
    const rowEntries: string[] = [];
    for (let c = 0; c < room.cols; c++) {
      const t = room.tiles[r * room.cols + c];
      // Only include trailing booleans when needed (keep exports compact)
      let suffix = "";
      if (t.overlay) {
        suffix = `,${t.flipX ? "true" : "false"},true`;
      } else if (t.flipX) {
        suffix = `,true`;
      }
      rowEntries.push(`[${t.bgTile},${t.fgTile},"${t.collision}"${suffix}]`);
    }
    lines.push(`  /* r${r} */ ${rowEntries.join(",")},`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`function buildTiles(): TileDef[] {`);
  lines.push(`  return DATA.map(([bgTile, fgTile, collision, flipX, overlay]) => ({`);
  lines.push(`    bgTile,`);
  lines.push(`    fgTile,`);
  lines.push(`    collision: collision as TileDef["collision"],`);
  lines.push(`    flipX: flipX ?? false,`);
  lines.push(`    overlay: overlay ?? false,`);
  lines.push(`  }));`);
  lines.push(`}`);
  lines.push(``);

  // Teleports
  const tpEntries = Object.entries(room.teleports);
  const teleportsStr = tpEntries.length === 0
    ? "{}"
    : `{\n${tpEntries.map(([k, v]) => {
      let parts = `roomId: "${v.roomId}", spawnCol: ${v.spawnCol}, spawnRow: ${v.spawnRow}, spawnDir: "${v.spawnDir}"`;
      if (v.doorSound) parts += `, doorSound: "${v.doorSound}"`;
      if (v.cutscene && v.cutscene.images.length > 0) {
        const imgs = `[${v.cutscene.images.map(i => `"${i}"`).join(", ")}]`;
        let csParts = `images: ${imgs}, waitTime: ${v.cutscene.waitTime}, interval: ${v.cutscene.interval}, fadeTime: ${v.cutscene.fadeTime}`;
        if (v.cutscene.revealSound) csParts += `, revealSound: "${v.cutscene.revealSound}"`;
        parts += `, cutscene: { ${csParts} }`;
      }
      return `    "${k}": { ${parts} },`;
    }).join("\n")}\n  }`;

  // Interactables
  const intEntries = Object.entries(room.interactables);
  const interactablesStr = intEntries.length === 0
    ? "{}"
    : `{\n${intEntries.map(([k, v]) => {
      const linesArr = v.lines ? `[${v.lines.map(l => `"${l.replace(/"/g, '\\"')}"`).join(", ")}]` : "undefined";
      const baseParts = `id: "${v.id}", type: "${v.type}", lines: ${linesArr}`;
      // Proximity sound fields
      const extras: string[] = [];
      if (v.proxSound) {
        extras.push(`proxSound: "${v.proxSound}"`);
        if (v.proxSoundMode && v.proxSoundMode !== "loop") extras.push(`proxSoundMode: "${v.proxSoundMode}"`);
        if (v.proxSoundInterval != null && v.proxSoundInterval !== 5) extras.push(`proxSoundInterval: ${v.proxSoundInterval}`);
        if (v.proxSoundVolume != null && v.proxSoundVolume !== 1) extras.push(`proxSoundVolume: ${v.proxSoundVolume}`);
        if (v.proxSoundMaxDist != null && v.proxSoundMaxDist !== 8) extras.push(`proxSoundMaxDist: ${v.proxSoundMaxDist}`);
      }
      // Event-only unlock fields
      if (v.type === "event") {
        if (v.lockId) extras.push(`lockId: "${v.lockId}"`);
        if (v.changeType) extras.push(`changeType: "${v.changeType}"`);
        if (v.changeTeleport) {
          const tp = v.changeTeleport;
          extras.push(`changeTeleport: { roomId: "${tp.roomId}", spawnCol: ${tp.spawnCol}, spawnRow: ${tp.spawnRow}, spawnDir: "${tp.spawnDir}" }`);
        }
        if (v.changeLines && v.changeLines.length > 0) {
          const cl = `[${v.changeLines.map(l => `"${l.replace(/"/g, '\\"')}"`).join(", ")}]`;
          extras.push(`changeLines: ${cl}`);
        }
        if (v.changeDoorSound) extras.push(`changeDoorSound: "${v.changeDoorSound}"`);
        if (v.changeMusic) extras.push(`changeMusic: "${v.changeMusic}"`);
        if (v.changeProxSound) extras.push(`changeProxSound: "${v.changeProxSound}"`);
        if (v.changeSpriteCol != null) extras.push(`changeSpriteCol: ${v.changeSpriteCol}`);
        if (v.changeSpriteRow != null) extras.push(`changeSpriteRow: ${v.changeSpriteRow}`);
        if (v.changeCutscene && v.changeCutscene.images.length > 0) {
          const imgs = `[${v.changeCutscene.images.map(i => `"${i}"`).join(", ")}]`;
          let csParts = `images: ${imgs}, waitTime: ${v.changeCutscene.waitTime}, interval: ${v.changeCutscene.interval}, fadeTime: ${v.changeCutscene.fadeTime}`;
          if (v.changeCutscene.revealSound) csParts += `, revealSound: "${v.changeCutscene.revealSound}"`;
          extras.push(`changeCutscene: { ${csParts} }`);
        }
      }
      const allParts = extras.length > 0 ? `${baseParts}, ${extras.join(", ")}` : baseParts;
      return `    "${k}": { ${allParts} },`;
    }).join("\n")}\n  }`;

  // Animated tile definitions
  const animEntries = Object.entries(room.animTiles ?? {}).filter(([, v]) => v.length > 1);
  const animTilesStr = animEntries.length === 0
    ? "{}"
    : `{\n${animEntries.map(([k, v]) =>
      `    "${k}": [${v.join(", ")}],`
    ).join("\n")}\n  }`;

  lines.push(`const ${name}: RoomDef = {`);
  lines.push(`  id: "${room.id}",`);
  lines.push(`  cols: COLS,`);
  lines.push(`  rows: ROWS,`);
  if (room.loopX) lines.push(`  loopX: true,`);
  if (room.loopY) lines.push(`  loopY: true,`);
  lines.push(`  tiles: buildTiles(),`);
  lines.push(`  tilesetSrc: "", // resolved by registry — tileset: ${tilesetKey}`);
  lines.push(`  tilesetCols: ${sheetCols},`);
  if (bgExport) {
    lines.push(`  backgroundSrc: ${bgExport.varName}, // background: ${bgKey}`);
    lines.push(`  bgScrollMode: "${room.bgScrollMode ?? "diagonal-se"}",`);
    if (room.bgSpeed != null && room.bgSpeed !== 20) {
      lines.push(`  bgSpeed: ${room.bgSpeed},`);
    }
  }
  lines.push(`  teleports: ${teleportsStr},`);
  lines.push(`  interactables: ${interactablesStr},`);
  lines.push(`  defaultSpawn: { col: ${room.defaultSpawn.col}, row: ${room.defaultSpawn.row}, dir: "${room.defaultSpawn.dir}" },`);
  if (room.musicKey) {
    lines.push(`  musicKey: "${room.musicKey}",`);
  }
  if (animEntries.length > 0) {
    lines.push(`  animTiles: ${animTilesStr},`);
    lines.push(`  animIntervalMs: ${room.animIntervalMs ?? 500},`);
  }
  lines.push(`};`);
  lines.push(``);
  lines.push(`export default ${name};`);
  lines.push(``);

  return lines.join("\n");
}

/* ================================================================
   COMPONENT
   ================================================================ */

interface Props {
  /** All rooms registered in the codebase (registry.ts). */
  registryRooms: Record<string, RoomEntry>;
  /** The room ID the player is currently in (game-side). */
  currentRoomId: string;
  /** Called when the user presses \ to exit editor. Passes the active room ID. */
  onClose: (roomId: string) => void;
}

export default function MapEditor({ registryRooms, currentRoomId, onClose }: Props) {
  /* ── Registry tracking ─────────────────────────────────────── */
  const registryNameSet = useRef(
    new Set(Object.keys(registryRooms).map(id => idToName(id)))
  );

  /* ── Room state ────────────────────────────────────────────── */
  const [rooms, setRooms] = useState<RoomDef[]>(() =>
    Object.values(registryRooms).map(entry => ({ ...entry.room }))
  );
  const [roomNames, setRoomNames] = useState<string[]>(() =>
    Object.keys(registryRooms).map(id => idToName(id))
  );
  const [activeRoomIdx, setActiveRoomIdx] = useState(() => {
    const keys = Object.keys(registryRooms);
    const idx = keys.indexOf(currentRoomId);
    return idx >= 0 ? idx : 0;
  });
  const room = rooms[activeRoomIdx];
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  /* ── Undo / redo stacks ────────────────────────────────────── */
  const roomRef = useRef(room);
  roomRef.current = room;
  const undoStack = useRef<RoomDef[]>([]);
  const redoStack = useRef<RoomDef[]>([]);
  const MAX_UNDO = 50;
  const _undoBatch = useRef(false);

  const pushUndo = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), JSON.parse(JSON.stringify(roomRef.current))];
    redoStack.current = [];
  }, []);

  const beginUndoBatch = useCallback(() => {
    pushUndo();
    _undoBatch.current = true;
  }, [pushUndo]);

  const endUndoBatch = useCallback(() => {
    _undoBatch.current = false;
  }, []);

  const updateRoom = useCallback((updater: (r: RoomDef) => RoomDef) => {
    if (!_undoBatch.current) pushUndo();
    setRooms(prev => {
      const copy = [...prev];
      copy[activeRoomIdx] = updater(copy[activeRoomIdx]);
      return copy;
    });
  }, [activeRoomIdx, pushUndo]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push(JSON.parse(JSON.stringify(roomRef.current)));
    setRooms(rs => {
      const copy = [...rs];
      copy[activeRoomIdx] = prev;
      return copy;
    });
  }, [activeRoomIdx]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push(JSON.parse(JSON.stringify(roomRef.current)));
    setRooms(rs => {
      const copy = [...rs];
      copy[activeRoomIdx] = next;
      return copy;
    });
  }, [activeRoomIdx]);

  // Clear undo/redo when switching rooms
  useEffect(() => {
    undoStack.current = [];
    redoStack.current = [];
  }, [activeRoomIdx]);

  /* ── Panel widths (resizable) ─────────────────────────────── */
  const [toolbarWidth, setToolbarWidth] = useState(200);
  const [paletteWidth, setPaletteWidth] = useState(260);
  const resizeState = useRef<{ side: "toolbar" | "palette"; startX: number; startWidth: number } | null>(null);

  /* ── Per-room tileset ──────────────────────────────────────── */
  const [roomTilesets, setRoomTilesets] = useState<string[]>(() =>
    Object.values(registryRooms).map(entry =>
      TILESET_SRC_TO_KEY[entry.tilesetSrc] ?? "forest"
    )
  );
  const tilesetKey = roomTilesets[activeRoomIdx] ?? "forest";
  const setTilesetKey = useCallback((key: string) => {
    setRoomTilesets(prev => {
      const copy = [...prev];
      copy[activeRoomIdx] = key;
      return copy;
    });
  }, [activeRoomIdx]);
  const tilesetSrc = TILESET_OPTIONS[tilesetKey];
  const [tilesetImg, setTilesetImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setTilesetImg(img);
    img.src = tilesetSrc;
  }, [tilesetSrc]);

  const sheetCols = tilesetImg ? Math.floor(tilesetImg.width / TILE) : 30;
  const sheetRows = tilesetImg ? Math.floor(tilesetImg.height / TILE) : 16;
  const sheetColsRef = useRef(sheetCols);
  const sheetRowsRef = useRef(sheetRows);
  sheetColsRef.current = sheetCols;
  sheetRowsRef.current = sheetRows;

  /* ── Per-room background ───────────────────────────────────── */
  const [roomBackgrounds, setRoomBackgrounds] = useState<string[]>(() =>
    Object.values(registryRooms).map(entry => {
      const src = entry.backgroundSrc || entry.room.backgroundSrc;
      return src ? (BACKGROUND_SRC_TO_KEY[src] ?? "none") : "none";
    })
  );
  const bgKey = roomBackgrounds[activeRoomIdx] ?? "none";
  const setBgKey = useCallback((key: string) => {
    setRoomBackgrounds(prev => {
      const copy = [...prev];
      copy[activeRoomIdx] = key;
      return copy;
    });
    if (key === "none") {
      updateRoom(r => ({ ...r, bgScrollMode: undefined, bgSpeed: undefined }));
    } else if (!room.bgScrollMode) {
      updateRoom(r => ({ ...r, bgScrollMode: "diagonal-se" as const }));
    }
  }, [activeRoomIdx, room.bgScrollMode, updateRoom]);

  /* ── Per-room music ────────────────────────────────────────── */
  const [roomMusics, setRoomMusics] = useState<string[]>(() =>
    Object.values(registryRooms).map(entry => entry.room.musicKey ?? "")
  );
  const musicKey = roomMusics[activeRoomIdx] ?? "";
  const setMusicKey = useCallback((key: string) => {
    setRoomMusics(prev => {
      const copy = [...prev];
      copy[activeRoomIdx] = key;
      return copy;
    });
    updateRoom(r => ({ ...r, musicKey: key || undefined }));
  }, [activeRoomIdx, updateRoom]);

  /* ── Palette selection (multi-tile rectangle) ──────────────── */
  const [paletteSel, setPaletteSel] = useState<{ c1: number; r1: number; c2: number; r2: number } | null>(null);
  const paletteSelDrag = useRef<{ startCol: number; startRow: number } | null>(null);
  /** Derived: top-left tile index (backward compat with hotbar etc.) */
  const selectedTile = paletteSel ? paletteSel.r1 * sheetCols + paletteSel.c1 : -1;
  const setSelectedTile = useCallback((id: number) => {
    if (id < 0) { setPaletteSel(null); return; }
    const c = id % sheetCols;
    const r = Math.floor(id / sheetCols);
    setPaletteSel({ c1: c, r1: r, c2: c, r2: r });
  }, [sheetCols]);
  const [activeLayer, setActiveLayer] = useState<"bg" | "fg">("bg");

  /* ── Tool mode ─────────────────────────────────────────────── */
  const [tool, setTool] = useState<"paint" | "erase" | "spawn" | "collision" | "select" | "select-all" | "move">("paint");
  const [showCollision, setShowCollision] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  /* ── Collapsible toolbar sections ────────────────────────────── */
  /* ── Minimized tabs ────────────────────────────────────────── */
  const [minimizedTabs, setMinimizedTabs] = useState<Set<number>>(() => new Set());

  /* ── Tab multi-select (Ctrl+Click) ─────────────────────────── */
  const [selectedTabs, setSelectedTabs] = useState<Set<number>>(() => new Set());

  /* ── Tab groups (Opera GX style) ───────────────────────────── */
  interface TabGroup {
    id: string;          // unique identifier
    name: string;
    color: string;
    roomIndices: number[]; // room indices in this group
    collapsed: boolean;
  }

  const GROUP_COLORS = ["#5544aa", "#aa4455", "#44aa55", "#aa8833", "#3388aa", "#8844aa", "#aa5533", "#338855"];
  const GROUPS_STORAGE_KEY = "1118-editor-tab-groups";

  // Load groups from localStorage keyed by room names
  const [tabGroups, setTabGroups] = useState<TabGroup[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (!raw) return [];
      const saved = JSON.parse(raw) as Array<{ id: string; name: string; color: string; roomNames: string[]; collapsed: boolean }>;
      // Map saved roomNames to current indices
      const nameToIdx = new Map<string, number>();
      Object.keys(registryRooms).forEach((id, i) => nameToIdx.set(idToName(id), i));
      return saved
        .map(g => ({
          id: g.id,
          name: g.name,
          color: g.color,
          collapsed: g.collapsed,
          roomIndices: g.roomNames
            .map(n => nameToIdx.get(n))
            .filter((i): i is number => i !== undefined),
        }))
        .filter(g => g.roomIndices.length > 0);
    } catch { return []; }
  });

  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [groupRenameValue, setGroupRenameValue] = useState("");

  // Persist groups whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const toSave = tabGroups.map(g => ({
      id: g.id,
      name: g.name,
      color: g.color,
      collapsed: g.collapsed,
      roomNames: g.roomIndices.map(i => roomNames[i]).filter(Boolean),
    }));
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(toSave));
  }, [tabGroups, roomNames]);

  // Which group (if any) a room index belongs to
  const roomGroupMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const g of tabGroups) {
      for (const i of g.roomIndices) m.set(i, g.id);
    }
    return m;
  }, [tabGroups]);

  const createGroup = useCallback((indices: number[]) => {
    const id = `grp_${Date.now()}`;
    // Remove these indices from any existing groups
    setTabGroups(prev => {
      const cleaned = prev.map(g => ({
        ...g,
        roomIndices: g.roomIndices.filter(i => !indices.includes(i)),
      })).filter(g => g.roomIndices.length > 0);
      const colorIdx = cleaned.length % GROUP_COLORS.length;
      return [...cleaned, { id, name: "Group", color: GROUP_COLORS[colorIdx], roomIndices: [...indices], collapsed: false }];
    });
    setSelectedTabs(new Set());
    // Start renaming immediately
    setRenamingGroupId(id);
    setGroupRenameValue("Group");
  }, []);

  const ungroupById = useCallback((groupId: string) => {
    setTabGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setTabGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
  }, []);

  const beginGroupRename = useCallback((groupId: string) => {
    const grp = tabGroups.find(g => g.id === groupId);
    if (!grp) return;
    setRenamingGroupId(groupId);
    setGroupRenameValue(grp.name);
  }, [tabGroups]);

  const commitGroupRename = useCallback(() => {
    if (renamingGroupId === null) return;
    const newName = groupRenameValue.trim() || "Group";
    setTabGroups(prev => prev.map(g =>
      g.id === renamingGroupId ? { ...g, name: newName } : g
    ));
    setRenamingGroupId(null);
  }, [renamingGroupId, groupRenameValue]);

  const cancelGroupRename = useCallback(() => {
    setRenamingGroupId(null);
  }, []);

  /* ── Layer visibility & opacity ────────────────────────────── */
  const [bgVisible, setBgVisible] = useState(true);
  const [fgVisible, setFgVisible] = useState(true);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [fgOpacity, setFgOpacity] = useState(1);

  /* ── Context menu ──────────────────────────────────────────── */
  const [ctxMenu, setCtxMenu] = useState<{
    x: number; y: number; col: number; row: number;
  } | null>(null);

  /* ── Hovered tile (for status bar + paste preview) ───────── */
  const [hovered, setHovered] = useState<{ col: number; row: number } | null>(null);

  /* ── Teleport modal ────────────────────────────────────────── */
  const [tpModal, setTpModal] = useState<{
    col: number; row: number;
    tp: TeleportTarget;
  } | null>(null);

  /* ── Interactable modal ────────────────────────────────────── */
  const [intModal, setIntModal] = useState<{
    col: number; row: number;
    def: InteractableDef;
  } | null>(null);

  /* ── Map canvas ref ────────────────────────────────────────── */
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const paletteCanvasRef = useRef<HTMLCanvasElement>(null);
  const paletteScrollRef = useRef<HTMLDivElement>(null);

  /* ── Painting state (for drag painting) ────────────────────── */
  const isPainting = useRef(false);

  /* ── Palette drag-to-pan state ──────────────────────────────── */
  const paletteDrag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
    moved: false,
  });

  /* ── Selection (marquee) state ─────────────────────────────── */
  const [selection, setSelection] = useState<{ c1: number; r1: number; c2: number; r2: number } | null>(null);
  const selDrag = useRef<{ startCol: number; startRow: number } | null>(null);

  /* ── Move tool state ───────────────────────────────────────── */
  const moveDrag = useRef<{
    /** Tiles being moved (copied from source at drag start). */
    tiles: TileDef[];
    /** Width/height of the moved region. */
    width: number;
    height: number;
    /** Teleports within the moved region (relative keys). */
    teleports: Record<string, import("./engine/types").TeleportTarget>;
    /** Interactables within the moved region (relative keys). */
    interactables: Record<string, import("./engine/types").InteractableDef>;
    /** Anchor offset: where in the dragged region the cursor grabbed. */
    grabCol: number;
    grabRow: number;
    /** Source region in the map. */
    srcC1: number; srcR1: number; srcC2: number; srcR2: number;
    /** Whether the source has already been cleared. */
    cleared: boolean;
  } | null>(null);
  const [movePreview, setMovePreview] = useState<{ col: number; row: number } | null>(null);

  /* ── Clipboard (copy / paste) ──────────────────────────────── */
  const [clipboard, setClipboard] = useState<{
    width: number; height: number;
    tiles: TileDef[];
    teleports: Record<string, TeleportTarget>;
    interactables: Record<string, InteractableDef>;
    sourceLayer: "bg" | "fg" | "all";
  } | null>(null);
  const [pasting, setPasting] = useState(false);

  /* ── Hotbar (9 slots, Minecraft-style) ─────────────────────── */
  const [hotbar, setHotbar] = useState<number[]>(() => Array(9).fill(-1));
  const [activeHotbarSlot, setActiveHotbarSlot] = useState(-1);
  const hotbarCanvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Animation editing ─────────────────────────────────────── */
  const [previewAnims, setPreviewAnims] = useState(false);
  const [editorAnimFrame, setEditorAnimFrame] = useState(0);
  const [animModal, setAnimModal] = useState<{
    tileId: number;
    frames: number[];
  } | null>(null);
  const [showAnimMarkers, setShowAnimMarkers] = useState(true);

  /* ── Stable ref so keyboard handler reads latest state ─────── */
  const kbState = useRef<Record<string, any>>({});
  kbState.current = { selection, clipboard, hotbar, selectedTile, pasting, room, activeLayer, tool, undo, redo, selectedTabs, tabGroups, roomGroupMap, activeRoomIdx };

  /* ── Keyboard shortcuts ────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input / textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "\\") { onClose(kbState.current.room.id); return; }
      if (e.key === "Backspace") {
        e.preventDefault();
        setTool(prev => prev === "erase" ? "paint" : "erase");
        return;
      }
      if (e.key === "Escape") {
        // If mid-move, restore tiles to source
        if (moveDrag.current && moveDrag.current.cleared) {
          const md = moveDrag.current;
          updateRoom(r => {
            const tiles = [...r.tiles];
            const teleports = { ...r.teleports };
            const interactables = { ...r.interactables };
            for (let dr = 0; dr < md.height; dr++) {
              for (let dc = 0; dc < md.width; dc++) {
                const col = md.srcC1 + dc;
                const row = md.srcR1 + dr;
                if (col >= r.cols || row >= r.rows) continue;
                tiles[row * r.cols + col] = { ...md.tiles[dr * md.width + dc] };
                const relKey = `${dr},${dc}`;
                const destKey = `${row},${col}`;
                if (md.teleports[relKey]) teleports[destKey] = { ...md.teleports[relKey] };
                if (md.interactables[relKey]) interactables[destKey] = { ...md.interactables[relKey] };
              }
            }
            return { ...r, tiles, teleports, interactables };
          });
          moveDrag.current = null;
          setMovePreview(null);
          // Move cancelled — no net change, discard the undo entry
          undoStack.current.pop();
          _undoBatch.current = false;
        }
        setSelection(null);
        setPasting(false);
        return;
      }

      const st = kbState.current;

      /* ── Ctrl+Z / Ctrl+Shift+Z: undo / redo ──────────────── */
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) st.redo();
        else st.undo();
        return;
      }

      /* ── Ctrl+G: group / ungroup selected tabs ──────────────── */
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        const sel = st.selectedTabs as Set<number>;
        // If exactly one grouped tab is selected (or none selected and active tab is grouped), ungroup it
        if (sel.size === 0) {
          const gid = (st.roomGroupMap as Map<number, string>).get(st.activeRoomIdx as number);
          if (gid) ungroupById(gid);
        } else if (sel.size === 1) {
          const idx = [...sel][0];
          const gid = (st.roomGroupMap as Map<number, string>).get(idx);
          if (gid) {
            ungroupById(gid);
            setSelectedTabs(new Set());
          } else {
            // single tab — nothing to group
          }
        } else {
          // Check if all selected tabs belong to the same group
          const groupIds = new Set<string>();
          for (const idx of sel) {
            const gid = (st.roomGroupMap as Map<number, string>).get(idx);
            if (gid) groupIds.add(gid);
          }
          if (groupIds.size === 1) {
            // All in same group → ungroup
            ungroupById([...groupIds][0]);
            setSelectedTabs(new Set());
          } else {
            // Group the selected tabs
            createGroup([...sel]);
          }
        }
        return;
      }

      /* ── Ctrl+C: copy selection ─────────────────────────────── */
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && st.selection) {
        e.preventDefault();
        const { c1, r1, c2, r2 } = st.selection;
        const w = c2 - c1 + 1;
        const h = r2 - r1 + 1;
        const copiedTiles: TileDef[] = [];
        const copiedTp: Record<string, TeleportTarget> = {};
        const copiedInt: Record<string, InteractableDef> = {};
        for (let row = r1; row <= r2; row++) {
          for (let col = c1; col <= c2; col++) {
            copiedTiles.push({ ...st.room.tiles[row * st.room.cols + col] });
            const key = `${row},${col}`;
            const relKey = `${row - r1},${col - c1}`;
            if (st.room.teleports[key]) copiedTp[relKey] = { ...st.room.teleports[key] };
            if (st.room.interactables[key]) copiedInt[relKey] = { ...st.room.interactables[key] };
          }
        }
        setClipboard({ width: w, height: h, tiles: copiedTiles, teleports: copiedTp, interactables: copiedInt, sourceLayer: st.tool === "select-all" ? "all" : st.activeLayer });
        return;
      }

      /* ── Ctrl+V: begin paste ─────────────────────────────────── */
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && st.clipboard) {
        e.preventDefault();
        setPasting(true);
        // Stay in select-all if clipboard was copied with it; otherwise use select
        if (st.tool !== "select" && st.tool !== "select-all") {
          setTool(st.clipboard.sourceLayer === "all" ? "select-all" : "select");
        }
        return;
      }

      /* ── Delete: erase tiles in selection ───────────────────── */
      if (e.key === "Delete" && st.selection) {
        e.preventDefault();
        const { c1, r1, c2, r2 } = st.selection;
        const allLayers = st.tool === "select-all";
        updateRoom(r => {
          const tiles = [...r.tiles];
          for (let row = r1; row <= r2; row++) {
            for (let col = c1; col <= c2; col++) {
              const idx = row * r.cols + col;
              if (allLayers) {
                tiles[idx] = emptyTile();
              } else {
                const old = tiles[idx];
                if (st.activeLayer === "fg") {
                  tiles[idx] = { ...old, fgTile: -1 };
                } else {
                  tiles[idx] = { ...old, bgTile: -1 };
                }
              }
            }
          }
          return { ...r, tiles };
        });
        return;
      }

      /* ── 1-9: hotbar ────────────────────────────────────────── */
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const slotIdx = num - 1;
        if (e.shiftKey) {
          // Shift+N → assign selected palette tile to this slot
          if (st.selectedTile >= 0) {
            setHotbar(prev => { const n = [...prev]; n[slotIdx] = st.selectedTile; return n; });
            setActiveHotbarSlot(slotIdx);
          }
        } else {
          // N → equip tile from this slot
          const tileId = st.hotbar[slotIdx];
          if (tileId >= 0) {
            setSelectedTile(tileId);
            setActiveHotbarSlot(slotIdx);
            setTool("paint");
          }
        }
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, updateRoom, createGroup, ungroupById]);

  /* ── Palette pan/select + panel resize: shared document listeners */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Panel resize
      const rs = resizeState.current;
      if (rs) {
        const dx = e.clientX - rs.startX;
        if (rs.side === "toolbar") {
          setToolbarWidth(Math.max(140, Math.min(480, rs.startWidth + dx)));
        } else {
          setPaletteWidth(Math.max(180, Math.min(600, rs.startWidth - dx)));
        }
      }
      // Palette pan (middle-button / Alt+drag)
      const d = paletteDrag.current;
      if (d.active) {
        const el = paletteScrollRef.current;
        if (el) {
          const dx2 = e.clientX - d.startX;
          const dy2 = e.clientY - d.startY;
          if (Math.abs(dx2) > 3 || Math.abs(dy2) > 3) d.moved = true;
          el.scrollLeft = d.scrollLeft - dx2;
          el.scrollTop = d.scrollTop - dy2;
        }
      }
      // Palette selection drag (left-button)
      if (paletteSelDrag.current) {
        const canvas = paletteCanvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = rect.width / canvas.width;
          const scaleY = rect.height / canvas.height;
          const mx = (e.clientX - rect.left) / scaleX;
          const my = (e.clientY - rect.top) / scaleY;
          const col = Math.max(0, Math.min(sheetColsRef.current - 1, Math.floor(mx / (TILE * PALETTE_SCALE))));
          const row = Math.max(0, Math.min(sheetRowsRef.current - 1, Math.floor(my / (TILE * PALETTE_SCALE))));
          const sd = paletteSelDrag.current;
          setPaletteSel({
            c1: Math.min(sd.startCol, col),
            r1: Math.min(sd.startRow, row),
            c2: Math.max(sd.startCol, col),
            r2: Math.max(sd.startRow, row),
          });
        }
      }
    };
    const onUp = () => {
      resizeState.current = null;
      if (paletteDrag.current.active) {
        paletteDrag.current.active = false;
        if (paletteScrollRef.current)
          paletteScrollRef.current.style.cursor = "crosshair";
      }
      paletteSelDrag.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /* ── Animation preview timer ───────────────────────────────── */
  useEffect(() => {
    if (!previewAnims) { setEditorAnimFrame(0); return; }
    const ms = room.animIntervalMs ?? 500;
    const id = setInterval(() => setEditorAnimFrame(f => f + 1), ms);
    return () => clearInterval(id);
  }, [previewAnims, room.animIntervalMs]);

  const onResizeMouseDown = (e: React.MouseEvent, side: "toolbar" | "palette") => {
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = {
      side,
      startX: e.clientX,
      startWidth: side === "toolbar" ? toolbarWidth : paletteWidth,
    };
  };

  const onPaletteMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = paletteScrollRef.current;
    if (!el) return;

    // Middle button or Alt+left → pan
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      paletteDrag.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        moved: false,
      };
      el.style.cursor = "grabbing";
      e.preventDefault();
      return;
    }

    if (e.button !== 0) return;

    // Left button → start palette selection drag
    const canvas = paletteCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    const mx = (e.clientX - rect.left) / scaleX;
    const my = (e.clientY - rect.top) / scaleY;
    const col = Math.floor(mx / (TILE * PALETTE_SCALE));
    const row = Math.floor(my / (TILE * PALETTE_SCALE));
    if (col < 0 || col >= sheetCols || row < 0 || row >= sheetRows) return;
    paletteSelDrag.current = { startCol: col, startRow: row };
    setPaletteSel({ c1: col, r1: row, c2: col, r2: row });
    setTool("paint");
    e.preventDefault();
  }, [sheetCols, sheetRows]);

  /* ── Draw palette ──────────────────────────────────────────── */
  useEffect(() => {
    const canvas = paletteCanvasRef.current;
    if (!canvas || !tilesetImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = sheetCols * TILE * PALETTE_SCALE;
    const h = sheetRows * TILE * PALETTE_SCALE;
    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = false;

    // Draw tileset scaled
    ctx.drawImage(tilesetImg, 0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= sheetCols; c++) {
      const x = c * TILE * PALETTE_SCALE;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let r = 0; r <= sheetRows; r++) {
      const y = r * TILE * PALETTE_SCALE;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Highlight selected region
    if (paletteSel) {
      const ts = TILE * PALETTE_SCALE;
      ctx.strokeStyle = "#ff0";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        paletteSel.c1 * ts + 1,
        paletteSel.r1 * ts + 1,
        (paletteSel.c2 - paletteSel.c1 + 1) * ts - 2,
        (paletteSel.r2 - paletteSel.r1 + 1) * ts - 2
      );
      // Dim everything outside the selection
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      // Top strip
      if (paletteSel.r1 > 0)
        ctx.fillRect(0, 0, w, paletteSel.r1 * ts);
      // Bottom strip
      if (paletteSel.r2 < sheetRows - 1)
        ctx.fillRect(0, (paletteSel.r2 + 1) * ts, w, h - (paletteSel.r2 + 1) * ts);
      // Left strip (between top and bottom)
      if (paletteSel.c1 > 0)
        ctx.fillRect(0, paletteSel.r1 * ts, paletteSel.c1 * ts, (paletteSel.r2 - paletteSel.r1 + 1) * ts);
      // Right strip
      if (paletteSel.c2 < sheetCols - 1)
        ctx.fillRect((paletteSel.c2 + 1) * ts, paletteSel.r1 * ts, w - (paletteSel.c2 + 1) * ts, (paletteSel.r2 - paletteSel.r1 + 1) * ts);
    }
  }, [tilesetImg, sheetCols, sheetRows, paletteSel]);

  /* ── Draw map ──────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas || !tilesetImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = room.cols * TILE * MAP_SCALE;
    const h = room.rows * TILE * MAP_SCALE;
    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingEnabled = false;

    // Clear with dark background
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, w, h);

    // Draw tiles
    const anim = room.animTiles;
    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.cols; c++) {
        const tile = room.tiles[r * room.cols + c];
        const dx = c * TILE * MAP_SCALE;
        const dy = r * TILE * MAP_SCALE;
        const ts = TILE * MAP_SCALE;

        // BG layer (resolve animated tile)
        if (tile.bgTile >= 0 && bgVisible && bgOpacity > 0) {
          let tileId = tile.bgTile;
          if (previewAnims && anim) {
            const frames = anim[String(tileId)];
            if (frames && frames.length > 1) tileId = frames[editorAnimFrame % frames.length];
          }
          const sc = tileId % sheetCols;
          const sr = Math.floor(tileId / sheetCols);
          ctx.globalAlpha = bgOpacity;
          ctx.drawImage(
            tilesetImg,
            sc * TILE, sr * TILE, TILE, TILE,
            dx, dy, ts, ts
          );
        }

        // FG layer (resolve animated tile)
        if (tile.fgTile >= 0 && fgVisible && fgOpacity > 0) {
          let tileId = tile.fgTile;
          if (previewAnims && anim) {
            const frames = anim[String(tileId)];
            if (frames && frames.length > 1) tileId = frames[editorAnimFrame % frames.length];
          }
          const sc = tileId % sheetCols;
          const sr = Math.floor(tileId / sheetCols);
          ctx.globalAlpha = fgOpacity;
          ctx.drawImage(
            tilesetImg,
            sc * TILE, sr * TILE, TILE, TILE,
            dx, dy, ts, ts
          );
        }

        // Reset alpha for overlays
        ctx.globalAlpha = 1;

        // Collision overlay
        if (showCollision && tile.collision !== "none") {
          ctx.fillStyle = COLLISION_COLORS[tile.collision];
          ctx.fillRect(dx, dy, ts, ts);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= room.cols; c++) {
      const x = c * TILE * MAP_SCALE;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let r = 0; r <= room.rows; r++) {
      const y = r * TILE * MAP_SCALE;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Spawn marker
    if (showMarkers) {
      const sp = room.defaultSpawn;
      const sx = sp.col * TILE * MAP_SCALE;
      const sy = sp.row * TILE * MAP_SCALE;
      const ts = TILE * MAP_SCALE;
      ctx.fillStyle = "rgba(0,255,100,0.4)";
      ctx.fillRect(sx, sy, ts, ts);
      ctx.fillStyle = "#0f8";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S", sx + ts / 2, sy + ts / 2);

      // Teleport markers
      for (const [key, tp] of Object.entries(room.teleports)) {
        const [tr, tc] = key.split(",").map(Number);
        const tx = tc * TILE * MAP_SCALE;
        const ty = tr * TILE * MAP_SCALE;
        ctx.fillStyle = "rgba(0,200,255,0.35)";
        ctx.fillRect(tx, ty, ts, ts);
        ctx.fillStyle = "#0cf";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("T", tx + ts / 2, ty + ts / 2 - 4);
        ctx.font = "7px monospace";
        ctx.fillText(tp.roomId.slice(0, 8), tx + ts / 2, ty + ts / 2 + 5);
      }

      // Interactable markers
      for (const [key, inter] of Object.entries(room.interactables)) {
        const [ir, ic] = key.split(",").map(Number);
        const ix = ic * TILE * MAP_SCALE;
        const iy = ir * TILE * MAP_SCALE;
        ctx.fillStyle = "rgba(200,0,255,0.3)";
        ctx.fillRect(ix, iy, ts, ts);
        ctx.fillStyle = "#c4f";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("!", ix + ts / 2, iy + ts / 2);
      }

      // Animated-tile markers (small "A" badge on tiles with anim defs)
      if (showAnimMarkers && anim) {
        const animSet = new Set<number>();
        for (const key of Object.keys(anim)) animSet.add(Number(key));
        if (animSet.size > 0) {
          for (let r2 = 0; r2 < room.rows; r2++) {
            for (let c2 = 0; c2 < room.cols; c2++) {
              const t = room.tiles[r2 * room.cols + c2];
              const hasBg = t.bgTile >= 0 && animSet.has(t.bgTile);
              const hasFg = t.fgTile >= 0 && animSet.has(t.fgTile);
              if (hasBg || hasFg) {
                const ax = c2 * ts + ts - 9;
                const ay = r2 * ts + 1;
                ctx.fillStyle = "rgba(255,200,0,0.8)";
                ctx.fillRect(ax, ay, 8, 9);
                ctx.fillStyle = "#000";
                ctx.font = "bold 7px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText("A", ax + 4, ay + 1);
              }
            }
          }
        }
      }

      // Overlay markers (small "▲" badge on FG tiles rendered above the player)
      for (let r2 = 0; r2 < room.rows; r2++) {
        for (let c2 = 0; c2 < room.cols; c2++) {
          const t = room.tiles[r2 * room.cols + c2];
          if (t.overlay && t.fgTile >= 0) {
            const ox = c2 * ts + 1;
            const oy = r2 * ts + 1;
            ctx.fillStyle = "rgba(255,100,0,0.8)";
            ctx.fillRect(ox, oy, 9, 9);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText("O", ox + 5, oy + 1);
          }
        }
      }
    }

    // ── Selection overlay (dashed blue rect) ────────────────────
    if (selection) {
      const ts = TILE * MAP_SCALE;
      const sx = selection.c1 * ts;
      const sy = selection.r1 * ts;
      const sw = (selection.c2 - selection.c1 + 1) * ts;
      const sh = (selection.r2 - selection.r1 + 1) * ts;
      ctx.fillStyle = "rgba(100,150,255,0.12)";
      ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = "#88aaff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(sx + 1, sy + 1, sw - 2, sh - 2);
      ctx.setLineDash([]);
    }

    // ── Paste preview (semi-transparent ghost) ──────────────────
    if (pasting && clipboard && hovered) {
      const ts = TILE * MAP_SCALE;
      const src = clipboard.sourceLayer;
      for (let dr = 0; dr < clipboard.height; dr++) {
        for (let dc = 0; dc < clipboard.width; dc++) {
          const destCol = hovered.col + dc;
          const destRow = hovered.row + dr;
          if (destCol >= room.cols || destRow >= room.rows) continue;
          const tile = clipboard.tiles[dr * clipboard.width + dc];
          const dx = destCol * ts;
          const dy = destRow * ts;
          ctx.globalAlpha = 0.5;
          if (src === "all") {
            // All-layer: show both bg + fg
            if (tile.bgTile >= 0) {
              const sc2 = tile.bgTile % sheetCols;
              const sr2 = Math.floor(tile.bgTile / sheetCols);
              ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, dx, dy, ts, ts);
            }
            if (tile.fgTile >= 0) {
              const sc2 = tile.fgTile % sheetCols;
              const sr2 = Math.floor(tile.fgTile / sheetCols);
              ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, dx, dy, ts, ts);
            }
          } else if (src !== activeLayer) {
            // Cross-layer: show only the source layer's sprite
            const srcId = src === "bg" ? tile.bgTile : tile.fgTile;
            if (srcId >= 0) {
              const sc2 = srcId % sheetCols;
              const sr2 = Math.floor(srcId / sheetCols);
              ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, dx, dy, ts, ts);
            }
          } else {
            // Same-layer: show only the active layer's sprite
            const layerId = activeLayer === "bg" ? tile.bgTile : tile.fgTile;
            if (layerId >= 0) {
              const sc2 = layerId % sheetCols;
              const sr2 = Math.floor(layerId / sheetCols);
              ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, dx, dy, ts, ts);
            }
          }
          ctx.globalAlpha = 1;
        }
      }
      // Outline the paste region
      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        hovered.col * ts, hovered.row * ts,
        clipboard.width * ts, clipboard.height * ts
      );
      ctx.setLineDash([]);
    }

    // ── Paint preview (multi-tile ghost of palette selection) ────
    if (tool === "paint" && paletteSel && hovered && !pasting) {
      const ts = TILE * MAP_SCALE;
      const pw = paletteSel.c2 - paletteSel.c1 + 1;
      const ph = paletteSel.r2 - paletteSel.r1 + 1;
      ctx.globalAlpha = 0.45;
      for (let dr = 0; dr < ph; dr++) {
        for (let dc = 0; dc < pw; dc++) {
          const destCol = hovered.col + dc;
          const destRow = hovered.row + dr;
          if (destCol >= room.cols || destRow >= room.rows) continue;
          const tileId = (paletteSel.r1 + dr) * sheetCols + (paletteSel.c1 + dc);
          const sc2 = tileId % sheetCols;
          const sr2 = Math.floor(tileId / sheetCols);
          ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, destCol * ts, destRow * ts, ts, ts);
        }
      }
      ctx.globalAlpha = 1;
      // Outline
      if (pw > 1 || ph > 1) {
        ctx.strokeStyle = "#ff0";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(hovered.col * ts, hovered.row * ts, pw * ts, ph * ts);
        ctx.setLineDash([]);
      }
    }

    // ── Move preview (semi-transparent ghost of dragged tiles) ──
    if (tool === "move" && moveDrag.current && movePreview) {
      const md = moveDrag.current;
      const ts = TILE * MAP_SCALE;
      const destCol = movePreview.col - md.grabCol;
      const destRow = movePreview.row - md.grabRow;
      for (let dr = 0; dr < md.height; dr++) {
        for (let dc = 0; dc < md.width; dc++) {
          const dc2 = destCol + dc;
          const dr2 = destRow + dr;
          if (dc2 < 0 || dc2 >= room.cols || dr2 < 0 || dr2 >= room.rows) continue;
          const tile = md.tiles[dr * md.width + dc];
          const dx = dc2 * ts;
          const dy = dr2 * ts;
          ctx.globalAlpha = 0.6;
          if (tile.bgTile >= 0) {
            const sc2 = tile.bgTile % sheetCols;
            const sr2 = Math.floor(tile.bgTile / sheetCols);
            ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, dx, dy, ts, ts);
          }
          if (tile.fgTile >= 0) {
            const sc2 = tile.fgTile % sheetCols;
            const sr2 = Math.floor(tile.fgTile / sheetCols);
            ctx.drawImage(tilesetImg, sc2 * TILE, sr2 * TILE, TILE, TILE, dx, dy, ts, ts);
          }
          ctx.globalAlpha = 1;
        }
      }
      // Dashed outline
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        destCol * ts, destRow * ts,
        md.width * ts, md.height * ts
      );
      ctx.setLineDash([]);
    }

  }, [room, tilesetImg, sheetCols, showCollision, showMarkers, showAnimMarkers, previewAnims, editorAnimFrame, selection, pasting, clipboard, hovered, tool, movePreview, bgVisible, fgVisible, bgOpacity, fgOpacity, paletteSel, activeLayer]);

  /* ── Map mouse → tile coords ───────────────────────────────── */
  const mapTileAt = useCallback(
    (e: React.MouseEvent) => {
      const canvas = mapCanvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      const mx = (e.clientX - rect.left) / scaleX;
      const my = (e.clientY - rect.top) / scaleY;
      const col = Math.floor(mx / (TILE * MAP_SCALE));
      const row = Math.floor(my / (TILE * MAP_SCALE));
      if (col < 0 || col >= room.cols || row < 0 || row >= room.rows) return null;
      return { col, row };
    },
    [room.cols, room.rows]
  );

  /* ── Paint tile(s) — stamps the full palette selection ──────── */
  const paintTile = useCallback(
    (col: number, row: number) => {
      updateRoom(r => {
        const tiles = [...r.tiles];

        if (tool === "erase") {
          // Erase operates on the single tile under cursor
          const idx = row * r.cols + col;
          const old = tiles[idx];
          if (activeLayer === "fg") {
            tiles[idx] = { ...old, fgTile: -1 };
          } else {
            tiles[idx] = { ...old, bgTile: -1 };
          }
        } else if (tool === "paint" && paletteSel) {
          // Stamp the entire palette selection rectangle
          const pw = paletteSel.c2 - paletteSel.c1 + 1;
          const ph = paletteSel.r2 - paletteSel.r1 + 1;
          for (let dr = 0; dr < ph; dr++) {
            for (let dc = 0; dc < pw; dc++) {
              const destCol = col + dc;
              const destRow = row + dr;
              if (destCol >= r.cols || destRow >= r.rows) continue;
              const tileId = (paletteSel.r1 + dr) * sheetCols + (paletteSel.c1 + dc);
              const idx = destRow * r.cols + destCol;
              const old = tiles[idx];
              if (activeLayer === "fg") {
                tiles[idx] = { ...old, fgTile: tileId };
              } else {
                tiles[idx] = { ...old, bgTile: tileId };
              }
            }
          }
        } else if (tool === "spawn") {
          return { ...r, defaultSpawn: { col, row, dir: r.defaultSpawn.dir } };
        }

        return { ...r, tiles };
      });
    },
    [tool, paletteSel, sheetCols, activeLayer, updateRoom]
  );

  /* ── Map mouse handlers ────────────────────────────────────── */
  const onMapMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (ctxMenu) { setCtxMenu(null); return; }
      const pos = mapTileAt(e);
      if (!pos) return;

      if (e.button === 2) {
        // Right click → context menu
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY, col: pos.col, row: pos.row });
        return;
      }

      // Paste mode: place clipboard at cursor
      if (pasting && clipboard) {
        const src = clipboard.sourceLayer; // "bg" | "fg" | "all"
        updateRoom(r => {
          const tiles = [...r.tiles];
          const teleports = { ...r.teleports };
          const interactables = { ...r.interactables };
          for (let dr = 0; dr < clipboard.height; dr++) {
            for (let dc = 0; dc < clipboard.width; dc++) {
              const destCol = pos.col + dc;
              const destRow = pos.row + dr;
              if (destCol >= r.cols || destRow >= r.rows) continue;
              const clipTile = clipboard.tiles[dr * clipboard.width + dc];
              const idx = destRow * r.cols + destCol;
              if (src === "all") {
                // Select-all clipboard: replace entire TileDef (both layers)
                tiles[idx] = { ...clipTile };
              } else if (src === activeLayer) {
                // Same-layer paste: only overwrite the active layer
                const existing = { ...tiles[idx] };
                if (activeLayer === "fg") existing.fgTile = clipTile.fgTile;
                else existing.bgTile = clipTile.bgTile;
                existing.collision = clipTile.collision;
                existing.flipX = clipTile.flipX;
                tiles[idx] = existing;
              } else {
                // Cross-layer paste: source layer sprite → active layer
                const srcVal = src === "bg" ? clipTile.bgTile : clipTile.fgTile;
                const existing = { ...tiles[idx] };
                if (activeLayer === "bg") existing.bgTile = srcVal;
                else existing.fgTile = srcVal;
                existing.collision = clipTile.collision;
                existing.flipX = clipTile.flipX;
                tiles[idx] = existing;
              }
              // Teleports & interactables always transfer
              const relKey = `${dr},${dc}`;
              const destKey = `${destRow},${destCol}`;
              if (clipboard.teleports[relKey]) teleports[destKey] = { ...clipboard.teleports[relKey] };
              if (clipboard.interactables[relKey]) interactables[destKey] = { ...clipboard.interactables[relKey] };
            }
          }
          return { ...r, tiles, teleports, interactables };
        });
        setPasting(false);
        return;
      }

      // Select / Select-all mode: start marquee drag
      if (tool === "select" || tool === "select-all") {
        selDrag.current = { startCol: pos.col, startRow: pos.row };
        setSelection({ c1: pos.col, r1: pos.row, c2: pos.col, r2: pos.row });
        return;
      }

      // Move mode: pick up tile(s) and start dragging
      if (tool === "move") {
        beginUndoBatch();
        const sel = selection;
        const inSel = sel &&
          pos.col >= sel.c1 && pos.col <= sel.c2 &&
          pos.row >= sel.r1 && pos.row <= sel.r2;

        let c1: number, r1: number, c2: number, r2: number;
        if (inSel && sel) {
          c1 = sel.c1; r1 = sel.r1; c2 = sel.c2; r2 = sel.r2;
        } else {
          c1 = pos.col; r1 = pos.row; c2 = pos.col; r2 = pos.row;
        }
        const w = c2 - c1 + 1;
        const h = r2 - r1 + 1;
        const copiedTiles: TileDef[] = [];
        const copiedTp: Record<string, TeleportTarget> = {};
        const copiedInt: Record<string, InteractableDef> = {};
        // Read the current room directly from the state ref
        const curRoom = room;
        for (let row = r1; row <= r2; row++) {
          for (let col = c1; col <= c2; col++) {
            copiedTiles.push({ ...curRoom.tiles[row * curRoom.cols + col] });
            const key = `${row},${col}`;
            const relKey = `${row - r1},${col - c1}`;
            if (curRoom.teleports[key]) copiedTp[relKey] = { ...curRoom.teleports[key] };
            if (curRoom.interactables[key]) copiedInt[relKey] = { ...curRoom.interactables[key] };
          }
        }
        moveDrag.current = {
          tiles: copiedTiles,
          width: w,
          height: h,
          teleports: copiedTp,
          interactables: copiedInt,
          grabCol: pos.col - c1,
          grabRow: pos.row - r1,
          srcC1: c1, srcR1: r1, srcC2: c2, srcR2: r2,
          cleared: false,
        };
        // Clear source tiles immediately so the user sees them "picked up"
        updateRoom(r => {
          const tiles = [...r.tiles];
          const teleports = { ...r.teleports };
          const interactables = { ...r.interactables };
          for (let row = r1; row <= r2; row++) {
            for (let col = c1; col <= c2; col++) {
              tiles[row * r.cols + col] = emptyTile();
              const key = `${row},${col}`;
              delete teleports[key];
              delete interactables[key];
            }
          }
          return { ...r, tiles, teleports, interactables };
        });
        moveDrag.current.cleared = true;
        setMovePreview(pos);
        return;
      }

      // Paint / erase / spawn: normal painting
      beginUndoBatch();
      isPainting.current = true;
      paintTile(pos.col, pos.row);
    },
    [mapTileAt, paintTile, ctxMenu, tool, pasting, clipboard, updateRoom, room, selection, beginUndoBatch, activeLayer]
  );

  const onMapMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Move mode: update preview position
      if (tool === "move" && moveDrag.current) {
        const pos = mapTileAt(e);
        if (pos) setMovePreview(pos);
        return;
      }

      // Select / Select-all mode: rubber-band marquee
      if ((tool === "select" || tool === "select-all") && selDrag.current) {
        const pos = mapTileAt(e);
        if (pos) {
          const sd = selDrag.current;
          setSelection({
            c1: Math.min(sd.startCol, pos.col),
            r1: Math.min(sd.startRow, pos.row),
            c2: Math.max(sd.startCol, pos.col),
            r2: Math.max(sd.startRow, pos.row),
          });
        }
        return;
      }

      // Paint mode drag
      if (!isPainting.current) return;
      const pos = mapTileAt(e);
      if (pos) paintTile(pos.col, pos.row);
    },
    [mapTileAt, paintTile, tool]
  );

  const onMapMouseUp = useCallback((e?: React.MouseEvent) => {
    // Move mode: commit placement
    if (tool === "move" && moveDrag.current && movePreview) {
      const md = moveDrag.current;
      const destCol = movePreview.col - md.grabCol;
      const destRow = movePreview.row - md.grabRow;
      updateRoom(r => {
        const tiles = [...r.tiles];
        const teleports = { ...r.teleports };
        const interactables = { ...r.interactables };
        for (let dr = 0; dr < md.height; dr++) {
          for (let dc = 0; dc < md.width; dc++) {
            const dc2 = destCol + dc;
            const dr2 = destRow + dr;
            if (dc2 < 0 || dc2 >= r.cols || dr2 < 0 || dr2 >= r.rows) continue;
            tiles[dr2 * r.cols + dc2] = { ...md.tiles[dr * md.width + dc] };
            const relKey = `${dr},${dc}`;
            const destKey = `${dr2},${dc2}`;
            if (md.teleports[relKey]) teleports[destKey] = { ...md.teleports[relKey] };
            if (md.interactables[relKey]) interactables[destKey] = { ...md.interactables[relKey] };
          }
        }
        return { ...r, tiles, teleports, interactables };
      });
      // Update selection to new position
      if (selection) {
        const w = selection.c2 - selection.c1;
        const h = selection.r2 - selection.r1;
        setSelection({
          c1: destCol, r1: destRow,
          c2: destCol + w, r2: destRow + h,
        });
      }
      moveDrag.current = null;
      setMovePreview(null);
      endUndoBatch();
      return;
    }
    isPainting.current = false;
    selDrag.current = null;
    endUndoBatch();
  }, [tool, movePreview, updateRoom, selection, endUndoBatch]);

  /* ── Context menu: set collision (single tile or selection) ── */
  const setCollision = useCallback(
    (collision: CollisionType) => {
      if (!ctxMenu) return;
      const sel = selection;
      const inSel = sel &&
        ctxMenu.col >= sel.c1 && ctxMenu.col <= sel.c2 &&
        ctxMenu.row >= sel.r1 && ctxMenu.row <= sel.r2;

      const isDoor = (ct: CollisionType) => ct === "door-auto" || ct === "door-interact";

      updateRoom(r => {
        const tiles = [...r.tiles];
        const teleports = { ...r.teleports };
        const interactables = { ...r.interactables };

        const cleanTile = (col: number, row: number) => {
          const idx = row * r.cols + col;
          const old = tiles[idx].collision;
          tiles[idx] = { ...tiles[idx], collision };
          const key = `${row},${col}`;
          // If changing away from a door type, remove teleport data
          if (isDoor(old) && !isDoor(collision)) {
            delete teleports[key];
          }
          // If changing away from interactable, remove interactable data
          if (old === "interactable" && collision !== "interactable") {
            delete interactables[key];
          }
        };

        if (inSel && sel) {
          for (let row = sel.r1; row <= sel.r2; row++)
            for (let col = sel.c1; col <= sel.c2; col++)
              cleanTile(col, row);
        } else {
          cleanTile(ctxMenu.col, ctxMenu.row);
        }
        return { ...r, tiles, teleports, interactables };
      });
      setCtxMenu(null);
    },
    [ctxMenu, updateRoom, selection]
  );

  /* ── Context menu: toggle overlay (FG renders above player) ── */
  const toggleOverlay = useCallback(() => {
    if (!ctxMenu) return;
    const sel = selection;
    const inSel = sel &&
      ctxMenu.col >= sel.c1 && ctxMenu.col <= sel.c2 &&
      ctxMenu.row >= sel.r1 && ctxMenu.row <= sel.r2;
    updateRoom(r => {
      const tiles = [...r.tiles];
      const toggle = (col: number, row: number) => {
        const idx = row * r.cols + col;
        tiles[idx] = { ...tiles[idx], overlay: !tiles[idx].overlay };
      };
      if (inSel && sel) {
        for (let row = sel.r1; row <= sel.r2; row++)
          for (let col = sel.c1; col <= sel.c2; col++)
            toggle(col, row);
      } else {
        toggle(ctxMenu.col, ctxMenu.row);
      }
      return { ...r, tiles };
    });
    setCtxMenu(null);
  }, [ctxMenu, updateRoom, selection]);

  /* ── Context menu: teleport ────────────────────────────────── */
  const openTeleportModal = useCallback(() => {
    if (!ctxMenu) return;
    const key = `${ctxMenu.row},${ctxMenu.col}`;
    const existing = room.teleports[key];
    setTpModal({
      col: ctxMenu.col,
      row: ctxMenu.row,
      tp: existing ?? { roomId: "", spawnCol: 1, spawnRow: 1, spawnDir: "down" },
    });
    setCtxMenu(null);
  }, [ctxMenu, room.teleports]);

  const saveTeleport = useCallback(() => {
    if (!tpModal) return;
    const sel = selection;
    const inSel = sel &&
      tpModal.col >= sel.c1 && tpModal.col <= sel.c2 &&
      tpModal.row >= sel.r1 && tpModal.row <= sel.r2;
    updateRoom(r => {
      const teleports = { ...r.teleports };
      if (inSel && sel) {
        for (let row = sel.r1; row <= sel.r2; row++)
          for (let col = sel.c1; col <= sel.c2; col++) {
            const key = `${row},${col}`;
            if (tpModal.tp.roomId) teleports[key] = { ...tpModal.tp };
            else delete teleports[key];
          }
      } else {
        const key = `${tpModal.row},${tpModal.col}`;
        if (tpModal.tp.roomId) teleports[key] = { ...tpModal.tp };
        else delete teleports[key];
      }
      return { ...r, teleports };
    });
    setTpModal(null);
  }, [tpModal, updateRoom, selection]);

  const removeTeleport = useCallback(() => {
    if (!tpModal) return;
    const sel = selection;
    const inSel = sel &&
      tpModal.col >= sel.c1 && tpModal.col <= sel.c2 &&
      tpModal.row >= sel.r1 && tpModal.row <= sel.r2;
    updateRoom(r => {
      const teleports = { ...r.teleports };
      if (inSel && sel) {
        for (let row = sel.r1; row <= sel.r2; row++)
          for (let col = sel.c1; col <= sel.c2; col++)
            delete teleports[`${row},${col}`];
      } else {
        delete teleports[`${tpModal.row},${tpModal.col}`];
      }
      return { ...r, teleports };
    });
    setTpModal(null);
  }, [tpModal, updateRoom, selection]);

  /* ── Context menu: interactable ────────────────────────────── */
  const openInteractableModal = useCallback(() => {
    if (!ctxMenu) return;
    const key = `${ctxMenu.row},${ctxMenu.col}`;
    const existing = room.interactables[key];
    setIntModal({
      col: ctxMenu.col,
      row: ctxMenu.row,
      def: existing ?? { id: "new-interact", type: "dialogue", lines: ["Hello!"] },
    });
    setCtxMenu(null);
  }, [ctxMenu, room.interactables]);

  const saveInteractable = useCallback(() => {
    if (!intModal) return;
    const sel = selection;
    const inSel = sel &&
      intModal.col >= sel.c1 && intModal.col <= sel.c2 &&
      intModal.row >= sel.r1 && intModal.row <= sel.r2;
    updateRoom(r => {
      const interactables = { ...r.interactables };
      if (inSel && sel) {
        for (let row = sel.r1; row <= sel.r2; row++)
          for (let col = sel.c1; col <= sel.c2; col++)
            interactables[`${row},${col}`] = { ...intModal.def };
      } else {
        interactables[`${intModal.row},${intModal.col}`] = { ...intModal.def };
      }
      return { ...r, interactables };
    });
    setIntModal(null);
  }, [intModal, updateRoom, selection]);

  const removeInteractable = useCallback(() => {
    if (!intModal) return;
    const sel = selection;
    const inSel = sel &&
      intModal.col >= sel.c1 && intModal.col <= sel.c2 &&
      intModal.row >= sel.r1 && intModal.row <= sel.r2;
    updateRoom(r => {
      const interactables = { ...r.interactables };
      if (inSel && sel) {
        for (let row = sel.r1; row <= sel.r2; row++)
          for (let col = sel.c1; col <= sel.c2; col++)
            delete interactables[`${row},${col}`];
      } else {
        delete interactables[`${intModal.row},${intModal.col}`];
      }
      return { ...r, interactables };
    });
    setIntModal(null);
  }, [intModal, updateRoom, selection]);

  /* ── Context menu: animation ───────────────────────────────── */
  const openAnimModal = useCallback(() => {
    if (!ctxMenu) return;
    const tile = room.tiles[ctxMenu.row * room.cols + ctxMenu.col];
    // Use the bg tile if present, otherwise fg (we animate by tile-index in the sheet)
    const baseTile = activeLayer === "fg"
      ? (tile.fgTile >= 0 ? tile.fgTile : tile.bgTile)
      : (tile.bgTile >= 0 ? tile.bgTile : tile.fgTile);
    if (baseTile < 0) { setCtxMenu(null); return; } // no tile to animate
    const existing = room.animTiles?.[String(baseTile)];
    setAnimModal({
      tileId: baseTile,
      frames: existing ? [...existing] : [baseTile],
    });
    setCtxMenu(null);
  }, [ctxMenu, room, activeLayer]);

  const saveAnim = useCallback(() => {
    if (!animModal) return;
    updateRoom(r => {
      const animTiles = { ...(r.animTiles ?? {}) };
      if (animModal.frames.length <= 1) {
        // Only one frame = no animation, remove it
        delete animTiles[String(animModal.tileId)];
      } else {
        animTiles[String(animModal.tileId)] = [...animModal.frames];
      }
      return { ...r, animTiles };
    });
    setAnimModal(null);
  }, [animModal, updateRoom]);

  const removeAnim = useCallback(() => {
    if (!animModal) return;
    updateRoom(r => {
      const animTiles = { ...(r.animTiles ?? {}) };
      delete animTiles[String(animModal.tileId)];
      return { ...r, animTiles };
    });
    setAnimModal(null);
  }, [animModal, updateRoom]);

  /* ── Room management ───────────────────────────────────────── */
  const addRoom = useCallback(() => {
    let idx = 1;
    let name = `room${idx}`;
    const allNames = [...roomNames, ...Array.from(registryNameSet.current)];
    while (allNames.includes(name)) { idx++; name = `room${idx}`; }
    setRooms(prev => [...prev, emptyRoom(name, 24, 18)]);
    setRoomNames(prev => [...prev, name]);
    setRoomTilesets(prev => [...prev, tilesetKey]);
    setRoomBackgrounds(prev => [...prev, "none"]);
    setRoomMusics(prev => [...prev, ""]);
    setActiveRoomIdx(rooms.length);
  }, [rooms.length, roomNames, tilesetKey]);

  const deleteRoom = useCallback((idx: number) => {
    if (rooms.length <= 1) return; // always keep at least one room
    setRooms(prev => prev.filter((_, i) => i !== idx));
    setRoomNames(prev => prev.filter((_, i) => i !== idx));
    setRoomTilesets(prev => prev.filter((_, i) => i !== idx));
    setRoomBackgrounds(prev => prev.filter((_, i) => i !== idx));
    setRoomMusics(prev => prev.filter((_, i) => i !== idx));
    setActiveRoomIdx(prev => {
      if (idx < prev) return prev - 1;
      if (idx === prev) return Math.max(0, prev - 1);
      return prev;
    });
  }, [rooms.length]);

  const beginRename = useCallback((idx: number) => {
    setRenamingIdx(idx);
    setRenameValue(roomNames[idx]);
  }, [roomNames]);

  const commitRename = useCallback(() => {
    if (renamingIdx === null) return;
    const newName = renameValue.trim() || roomNames[renamingIdx];
    // Check for duplicate names (including registry names)
    const isDuplicate = roomNames.some((n, i) => i !== renamingIdx && n === newName);
    if (isDuplicate) {
      alert(`A room with name "${newName}" already exists.`);
      return;
    }
    if (newName !== roomNames[renamingIdx]) {
      setRoomNames(prev => { const copy = [...prev]; copy[renamingIdx] = newName; return copy; });
      setRooms(prev => {
        const copy = [...prev];
        copy[renamingIdx] = { ...copy[renamingIdx], id: newName };
        return copy;
      });
    }
    setRenamingIdx(null);
  }, [renamingIdx, renameValue, roomNames]);

  const cancelRename = useCallback(() => {
    setRenamingIdx(null);
  }, []);

  const resizeRoom = useCallback((newCols: number, newRows: number) => {
    updateRoom(r => {
      const tiles: TileDef[] = [];
      for (let row = 0; row < newRows; row++) {
        for (let col = 0; col < newCols; col++) {
          if (row < r.rows && col < r.cols) {
            tiles.push(r.tiles[row * r.cols + col]);
          } else {
            tiles.push(emptyTile());
          }
        }
      }
      return { ...r, cols: newCols, rows: newRows, tiles };
    });
  }, [updateRoom]);

  /* ── Export ─────────────────────────────────────────────────── */
  const handleExport = useCallback(() => {
    const name = roomNames[activeRoomIdx];
    const bg = roomBackgrounds[activeRoomIdx] ?? "none";
    const code = exportRoom(room, tilesetKey, bg, name, sheetCols);
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  }, [room, tilesetKey, roomNames, activeRoomIdx, roomBackgrounds, sheetCols]);

  const handleExportAll = useCallback(() => {
    for (let i = 0; i < rooms.length; i++) {
      const name = roomNames[i];
      const bg = roomBackgrounds[i] ?? "none";
      const code = exportRoom(rooms[i], roomTilesets[i] ?? "forest", bg, name, sheetCols);
      const blob = new Blob([code], { type: "text/typescript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.ts`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [rooms, roomNames, roomTilesets, roomBackgrounds, sheetCols]);

  /* ── Save (write to filesystem via API) ─────────────────────── */
  const [saveStatus, setSaveStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const isExistingRoom = registryNameSet.current.has(roomNames[activeRoomIdx]);
  const isNewRoomRenamed = !isExistingRoom && roomNames[activeRoomIdx] !== "room1" && !roomNames[activeRoomIdx].match(/^room\d+$/);

  /** Save an existing (registry) room — overwrites the .ts file. */
  const handleSave = useCallback(async () => {
    const name = roomNames[activeRoomIdx];
    const bg = roomBackgrounds[activeRoomIdx] ?? "none";
    const code = exportRoom(room, tilesetKey, bg, name, sheetCols);
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/editor/save-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", fileName: name, code }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSaveStatus({ msg: data.message ?? `Saved ${name}.ts`, ok: true });
      } else {
        setSaveStatus({ msg: data.error ?? "Save failed.", ok: false });
      }
    } catch (err) {
      setSaveStatus({ msg: (err as Error).message, ok: false });
    } finally {
      setSaving(false);
    }
  }, [room, tilesetKey, roomNames, activeRoomIdx, roomBackgrounds, sheetCols]);

  /** Save a new room — writes .ts file + adds import & entry to registry.ts. */
  const handleSaveToRegistry = useCallback(async () => {
    const name = roomNames[activeRoomIdx];
    if (name.match(/^room\d+$/)) {
      alert("Please rename the room before saving to registry. The default name \"room1\" is not allowed.");
      return;
    }
    const bg = roomBackgrounds[activeRoomIdx] ?? "none";
    const code = exportRoom(room, tilesetKey, bg, name, sheetCols);
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/editor/save-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          fileName: name,
          code,
          tilesetKey,
          bgKey: bg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSaveStatus({ msg: data.message ?? `Registered ${name}`, ok: true });
        // Mark as a registry room now so future saves use "Save" instead of "Save to Registry"
        registryNameSet.current.add(name);
      } else {
        setSaveStatus({ msg: data.error ?? "Registration failed.", ok: false });
      }
    } catch (err) {
      setSaveStatus({ msg: (err as Error).message, ok: false });
    } finally {
      setSaving(false);
    }
  }, [room, tilesetKey, roomNames, activeRoomIdx, roomBackgrounds, sheetCols]);

  // Clear save status when switching rooms
  useEffect(() => {
    setSaveStatus(null);
  }, [activeRoomIdx]);

  /* ── Import room from file (.ts export format) ───────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFromFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        // Parse the exported TS room format
        const colsMatch = text.match(/const\s+COLS\s*=\s*(\d+)/);
        const rowsMatch = text.match(/const\s+ROWS\s*=\s*(\d+)/);
        if (!colsMatch || !rowsMatch) { alert("Could not parse COLS/ROWS from file."); return; }
        const cols = Number(colsMatch[1]);
        const rows = Number(rowsMatch[1]);

        // Parse DATA array: each entry is [bgTile, fgTile, "collision", flipX?, overlay?]
        const dataMatch = text.match(/const\s+DATA[^=]*=\s*\[([\s\S]*?)\];/);
        if (!dataMatch) { alert("Could not parse DATA array from file."); return; }
        const dataStr = dataMatch[1];
        const tileRegex = /\[(-?\d+),(-?\d+),"([^"]+)"(?:,(true|false))?(?:,(true|false))?\]/g;
        const tiles: TileDef[] = [];
        let m: RegExpExecArray | null;
        while ((m = tileRegex.exec(dataStr)) !== null) {
          tiles.push({
            bgTile: Number(m[1]),
            fgTile: Number(m[2]),
            collision: m[3] as TileDef["collision"],
            flipX: m[4] === "true",
            overlay: m[5] === "true",
          });
        }
        if (tiles.length !== cols * rows) {
          alert(`Tile count mismatch: expected ${cols * rows}, got ${tiles.length}`);
          return;
        }

        // Parse name from const declaration or filename
        const constMatch = text.match(/const\s+(\w+)\s*:\s*RoomDef/);
        const name = constMatch ? constMatch[1] : file.name.replace(/\.ts$/, "");

        // Parse ID (from id field), or derive from name
        const idMatch = text.match(/id:\s*"([^"]+)"/);
        const id = idMatch ? idMatch[1] : name;

        // Duplicate name check
        if (roomNames.includes(name)) {
          alert(`A room with name "${name}" already exists. Rename or delete it first.`);
          return;
        }

        // Parse teleports
        const teleports: Record<string, import("./engine/types").TeleportTarget> = {};
        const tpBlock = text.match(/teleports:\s*\{([\s\S]*?)\},/);
        if (tpBlock) {
          const tpRegex = /"(\d+,\d+)":\s*\{\s*roomId:\s*"([^"]+)",\s*spawnCol:\s*(\d+),\s*spawnRow:\s*(\d+),\s*spawnDir:\s*"([^"]+)"(?:,\s*doorSound:\s*"([^"]+)")?/g;
          let tm: RegExpExecArray | null;
          while ((tm = tpRegex.exec(tpBlock[1])) !== null) {
            const tp: import("./engine/types").TeleportTarget = { roomId: tm[2], spawnCol: Number(tm[3]), spawnRow: Number(tm[4]), spawnDir: tm[5] as import("./engine/types").Direction };
            if (tm[6]) tp.doorSound = tm[6];
            // Parse cutscene if present in this teleport entry
            const afterMatch = tpBlock[1].substring(tm.index);
            const csMatch = afterMatch.match(/cutscene:\s*\{\s*images:\s*\[([^\]]*)\],\s*waitTime:\s*(\d+),\s*interval:\s*(\d+),\s*fadeTime:\s*(\d+)(?:,\s*revealSound:\s*"([^"]+)")?\s*\}/);
            if (csMatch) {
              const csImages = csMatch[1].match(/"([^"]+)"/g)?.map(s => s.slice(1, -1)) ?? [];
              if (csImages.length > 0) {
                const cs: import("./engine/types").CutsceneDef = {
                  images: csImages,
                  waitTime: Number(csMatch[2]),
                  interval: Number(csMatch[3]),
                  fadeTime: Number(csMatch[4]),
                };
                if (csMatch[5]) cs.revealSound = csMatch[5];
                tp.cutscene = cs;
              }
            }
            teleports[tm[1]] = tp;
          }
        }

        // Parse interactables
        const interactables: Record<string, import("./engine/types").InteractableDef> = {};
        const intBlock = text.match(/interactables:\s*\{([\s\S]*?)\n\s*\}/);
        if (intBlock) {
          // Match each "row,col": { ... } entry — supports one level of nested braces
          const entryRegex = /"(\d+,\d+)":\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g;
          let em: RegExpExecArray | null;
          while ((em = entryRegex.exec(intBlock[1])) !== null) {
            const body = em[2];
            const idM = body.match(/id:\s*"([^"]+)"/);
            const typeM = body.match(/type:\s*"([^"]+)"/);
            const linesM = body.match(/lines:\s*\[([^\]]*)\]/);
            if (!idM || !typeM) continue;
            const lines = linesM
              ? (linesM[1].match(/"((?:[^"\\]|\\.)*)"/g)?.map(s => s.slice(1, -1).replace(/\\"/g, '"')) ?? [])
              : [];
            const def: import("./engine/types").InteractableDef = {
              id: idM[1],
              type: typeM[1] as "dialogue" | "event",
              lines,
            };
            // Event unlock fields
            const lockIdM = body.match(/lockId:\s*"([^"]+)"/);
            if (lockIdM) def.lockId = lockIdM[1];
            const changeTypeM = body.match(/changeType:\s*"([^"]+)"/);
            if (changeTypeM) def.changeType = changeTypeM[1] as import("./engine/types").CollisionType;
            const ctpM = body.match(/changeTeleport:\s*\{\s*roomId:\s*"([^"]+)",\s*spawnCol:\s*(\d+),\s*spawnRow:\s*(\d+),\s*spawnDir:\s*"([^"]+)"/);
            if (ctpM) def.changeTeleport = { roomId: ctpM[1], spawnCol: Number(ctpM[2]), spawnRow: Number(ctpM[3]), spawnDir: ctpM[4] as import("./engine/types").Direction };
            const changeLinesM = body.match(/changeLines:\s*\[([^\]]*)\]/);
            if (changeLinesM) def.changeLines = changeLinesM[1].match(/"((?:[^"\\]|\\.)*)"/g)?.map(s => s.slice(1, -1).replace(/\\"/g, '"')) ?? [];
            // Proximity sound fields
            const proxSoundM = body.match(/proxSound:\s*"([^"]+)"/);
            if (proxSoundM) def.proxSound = proxSoundM[1];
            const proxSoundModeM = body.match(/proxSoundMode:\s*"([^"]+)"/);
            if (proxSoundModeM) def.proxSoundMode = proxSoundModeM[1] as "loop" | "once" | "interval";
            const proxSoundIntM = body.match(/proxSoundInterval:\s*(\d+(?:\.\d+)?)/);
            if (proxSoundIntM) def.proxSoundInterval = Number(proxSoundIntM[1]);
            const proxSoundVolM = body.match(/proxSoundVolume:\s*(\d+(?:\.\d+)?)/);
            if (proxSoundVolM) def.proxSoundVolume = Number(proxSoundVolM[1]);
            const proxSoundDistM = body.match(/proxSoundMaxDist:\s*(\d+)/);
            if (proxSoundDistM) def.proxSoundMaxDist = Number(proxSoundDistM[1]);
            // Event sound fields
            const changeDoorSoundM = body.match(/changeDoorSound:\s*"([^"]+)"/);
            if (changeDoorSoundM) def.changeDoorSound = changeDoorSoundM[1];
            const changeMusicM = body.match(/changeMusic:\s*"([^"]+)"/);
            if (changeMusicM) def.changeMusic = changeMusicM[1];
            const changeProxSoundM = body.match(/changeProxSound:\s*"([^"]+)"/);
            if (changeProxSoundM) def.changeProxSound = changeProxSoundM[1];
            const changeSpriteColM = body.match(/changeSpriteCol:\s*(\d+)/);
            if (changeSpriteColM) def.changeSpriteCol = Number(changeSpriteColM[1]);
            const changeSpriteRowM = body.match(/changeSpriteRow:\s*(\d+)/);
            if (changeSpriteRowM) def.changeSpriteRow = Number(changeSpriteRowM[1]);
            // Parse changeCutscene
            const changeCsMatch = body.match(/changeCutscene:\s*\{\s*images:\s*\[([^\]]*)\],\s*waitTime:\s*(\d+),\s*interval:\s*(\d+),\s*fadeTime:\s*(\d+)(?:,\s*revealSound:\s*"([^"]+)")?\s*\}/);
            if (changeCsMatch) {
              const csImages = changeCsMatch[1].match(/"([^"]+)"/g)?.map(s => s.slice(1, -1)) ?? [];
              if (csImages.length > 0) {
                const cs: import("./engine/types").CutsceneDef = {
                  images: csImages,
                  waitTime: Number(changeCsMatch[2]),
                  interval: Number(changeCsMatch[3]),
                  fadeTime: Number(changeCsMatch[4]),
                };
                if (changeCsMatch[5]) cs.revealSound = changeCsMatch[5];
                def.changeCutscene = cs;
              }
            }
            interactables[em[1]] = def;
          }
        }

        // Parse defaultSpawn
        const spawnMatch = text.match(/defaultSpawn:\s*\{\s*col:\s*(\d+),\s*row:\s*(\d+),\s*dir:\s*"([^"]+)"/);
        const defaultSpawn = spawnMatch
          ? { col: Number(spawnMatch[1]), row: Number(spawnMatch[2]), dir: spawnMatch[3] as import("./engine/types").Direction }
          : { col: 1, row: 1, dir: "down" as const };

        // Parse animTiles
        const animTiles: Record<string, number[]> = {};
        const animBlock = text.match(/animTiles:\s*\{([\s\S]*?)\},/);
        if (animBlock) {
          const animRegex = /"(\d+)":\s*\[([^\]]*)\]/g;
          let am: RegExpExecArray | null;
          while ((am = animRegex.exec(animBlock[1])) !== null) {
            animTiles[am[1]] = am[2].split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
          }
        }

        const animMsMatch = text.match(/animIntervalMs:\s*(\d+)/);
        const animIntervalMs = animMsMatch ? Number(animMsMatch[1]) : 500;

        // Parse tilesetCols
        const tilesetColsMatch = text.match(/tilesetCols:\s*(\d+)/);
        const tilesetCols = tilesetColsMatch ? Number(tilesetColsMatch[1]) : undefined;

        const newRoom: RoomDef = {
          id, cols, rows, tiles,
          tilesetSrc: "",
          ...(tilesetCols != null && { tilesetCols }),
          teleports, interactables, defaultSpawn,
          animTiles, animIntervalMs,
        };
        // Try to detect tileset from file comment
        const tsMatch = text.match(/tileset:\s*(\w+)/);
        const importedTileset = tsMatch && TILESET_OPTIONS[tsMatch[1]] ? tsMatch[1] : "forest";

        // Try to detect background from file comment
        const bgMatch = text.match(/background:\s*([\w-]+)/);
        const importedBg = bgMatch && BACKGROUND_OPTIONS[bgMatch[1]] ? bgMatch[1] : "none";
        if (importedBg !== "none") {
          const scrollMatch = text.match(/bgScrollMode:\s*"([\w-]+)"/);
          newRoom.bgScrollMode = (scrollMatch ? scrollMatch[1] : "diagonal-se") as RoomDef["bgScrollMode"];
          const spdMatch = text.match(/bgSpeed:\s*(\d+)/);
          if (spdMatch) newRoom.bgSpeed = Number(spdMatch[1]);
        }

        // Parse loopX / loopY
        if (/loopX:\s*true/.test(text)) newRoom.loopX = true;
        if (/loopY:\s*true/.test(text)) newRoom.loopY = true;

        // Parse musicKey
        const musicMatch = text.match(/musicKey:\s*"([^"]+)"/);
        if (musicMatch) newRoom.musicKey = musicMatch[1];

        setRooms(prev => [...prev, newRoom]);
        setRoomNames(prev => [...prev, name]);
        setRoomTilesets(prev => [...prev, importedTileset]);
        setRoomBackgrounds(prev => [...prev, importedBg]);
        setRoomMusics(prev => [...prev, newRoom.musicKey ?? ""]);
        setActiveRoomIdx(rooms.length);
      } catch (err) {
        alert("Failed to parse room file: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  }, [rooms.length, roomNames]);

  /* ── Hovered tile: update handler ──────────────────────────── */
  const onMapHover = useCallback(
    (e: React.MouseEvent) => {
      const pos = mapTileAt(e);
      setHovered(pos);
    },
    [mapTileAt]
  );

  /* ── Collision label for context tile ──────────────────────── */
  const ctxTile = ctxMenu ? room.tiles[ctxMenu.row * room.cols + ctxMenu.col] : null;

  /* ── Is right-click inside selection? ──────────────────────── */
  const isInSelection = !!(ctxMenu && selection &&
    ctxMenu.col >= selection.c1 && ctxMenu.col <= selection.c2 &&
    ctxMenu.row >= selection.r1 && ctxMenu.row <= selection.r2);
  const selTileCount = selection ? (selection.c2 - selection.c1 + 1) * (selection.r2 - selection.r1 + 1) : 0;

  /* ── Available room IDs for teleport targets ───────────────── */
  const allRoomIds = useMemo(
    () => rooms.map(r => r.id).filter((v, i, a) => a.indexOf(v) === i),
    [rooms]
  );

  /* ── Hotbar canvas drawing ─────────────────────────────────── */
  const HOTBAR_SLOT_SIZE = 36;
  const HOTBAR_PAD = 2;
  const HOTBAR_SLOTS = 9;

  useEffect(() => {
    const canvas = hotbarCanvasRef.current;
    if (!canvas || !tilesetImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const totalW = HOTBAR_SLOTS * HOTBAR_SLOT_SIZE + (HOTBAR_SLOTS + 1) * HOTBAR_PAD;
    const totalH = HOTBAR_SLOT_SIZE + HOTBAR_PAD * 2;
    canvas.width = totalW;
    canvas.height = totalH;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, totalW, totalH);

    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const x = HOTBAR_PAD + i * (HOTBAR_SLOT_SIZE + HOTBAR_PAD);
      const y = HOTBAR_PAD;
      // Slot bg
      ctx.fillStyle = i === activeHotbarSlot ? "#443388" : "#1a1a2e";
      ctx.fillRect(x, y, HOTBAR_SLOT_SIZE, HOTBAR_SLOT_SIZE);
      ctx.strokeStyle = i === activeHotbarSlot ? "#8877cc" : "#444";
      ctx.lineWidth = i === activeHotbarSlot ? 2 : 1;
      ctx.strokeRect(x, y, HOTBAR_SLOT_SIZE, HOTBAR_SLOT_SIZE);
      // Draw tile preview
      const tileId = hotbar[i];
      if (tileId >= 0) {
        const tc = tileId % sheetCols;
        const tr = Math.floor(tileId / sheetCols);
        ctx.drawImage(
          tilesetImg,
          tc * TILE, tr * TILE, TILE, TILE,
          x + 2, y + 2, HOTBAR_SLOT_SIZE - 4, HOTBAR_SLOT_SIZE - 4
        );
      }
      // Number label
      ctx.fillStyle = i === activeHotbarSlot ? "#fff" : "#888";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${i + 1}`, x + 2, y + 1);
    }
  }, [hotbar, tilesetImg, sheetCols, activeHotbarSlot]);

  /* ── Hotbar click ──────────────────────────────────────────── */
  const onHotbarClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = hotbarCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const slotIdx = Math.floor((mx - HOTBAR_PAD) / (HOTBAR_SLOT_SIZE + HOTBAR_PAD));
      if (slotIdx < 0 || slotIdx >= HOTBAR_SLOTS) return;

      if (e.button === 2) {
        // Right-click: clear slot
        e.preventDefault();
        setHotbar(prev => { const n = [...prev]; n[slotIdx] = -1; return n; });
        if (activeHotbarSlot === slotIdx) setActiveHotbarSlot(-1);
        return;
      }

      if (e.shiftKey && selectedTile >= 0) {
        // Shift+click: assign current palette tile to slot
        setHotbar(prev => { const n = [...prev]; n[slotIdx] = selectedTile; return n; });
        setActiveHotbarSlot(slotIdx);
      } else {
        // Click: equip tile from slot
        const tileId = hotbar[slotIdx];
        if (tileId >= 0) {
          setSelectedTile(tileId);
          setActiveHotbarSlot(slotIdx);
          setTool("paint");
        }
      }
    },
    [selectedTile, hotbar, activeHotbarSlot]
  );

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className={s.editorWrapper} onContextMenu={e => e.preventDefault()}>
      {/* ── TAB BAR ────────────────────────────────────────────── */}
      <div className={s.tabBar}>
        {/* ── Grouped tabs ─────────────────────────────────────── */}
        {tabGroups.map(group => (
          <div
            key={group.id}
            className={`${s.tabGroup} ${group.collapsed ? s.tabGroupCollapsed : ""}`}
            style={{ "--group-color": group.color } as React.CSSProperties}
          >
            <div
              className={s.tabGroupHeader}
              onClick={() => toggleGroupCollapse(group.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                ungroupById(group.id);
              }}
              title={group.collapsed
                ? `${group.name} (${group.roomIndices.length}) — Click to expand, Right-click to ungroup`
                : `${group.name} — Click to collapse, Right-click to ungroup`}
            >
              {renamingGroupId === group.id ? (
                <input
                  className={s.tabGroupRenameInput}
                  value={groupRenameValue}
                  onChange={e => setGroupRenameValue(e.target.value)}
                  onBlur={commitGroupRename}
                  onKeyDown={e => {
                    if (e.key === "Enter") commitGroupRename();
                    if (e.key === "Escape") cancelGroupRename();
                    e.stopPropagation();
                  }}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span onDoubleClick={(e) => { e.stopPropagation(); beginGroupRename(group.id); }}>
                  {group.collapsed ? "▶" : "▼"} {group.name}
                </span>
              )}
              <span className={s.tabGroupCount}>{group.roomIndices.length}</span>
            </div>
            <div className={s.tabGroupTabs}>
              {group.roomIndices.map(i => {
                const r = rooms[i];
                if (!r) return null;
                const isMinimized = minimizedTabs.has(i);
                return (
                  <div
                    key={i}
                    className={`${s.tab} ${i === activeRoomIdx ? s.tabActive : ""} ${selectedTabs.has(i) ? s.tabSelected : ""} ${isMinimized ? s.tabMinimized : ""}`}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        e.stopPropagation();
                        setSelectedTabs(prev => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        });
                      } else {
                        setSelectedTabs(new Set());
                        setActiveRoomIdx(i);
                      }
                    }}
                  >
                    <button
                      className={s.tabFolderIcon}
                      title={isMinimized ? "Expand room" : "Minimize room"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMinimizedTabs(prev => {
                          const next = new Set(prev);
                          next.has(i) ? next.delete(i) : next.add(i);
                          return next;
                        });
                      }}
                    >📁</button>
                    {!isMinimized && (renamingIdx === i ? (
                      <input
                        className={s.tabRenameInput}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={e => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") cancelRename();
                          e.stopPropagation();
                        }}
                        onClick={e => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={s.tabName}
                        onDoubleClick={(e) => { e.stopPropagation(); beginRename(i); }}
                        title={`${roomNames[i]} (${r.id})`}
                      >
                        {roomNames[i]}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {/* ── Ungrouped tabs ────────────────────────────────────── */}
        {rooms.map((r, i) => {
          if (roomGroupMap.has(i)) return null; // skip grouped rooms
          const isRegistry = registryNameSet.current.has(roomNames[i]);
          const isMinimized = minimizedTabs.has(i);
          return (
            <div
              key={i}
              className={`${s.tab} ${i === activeRoomIdx ? s.tabActive : ""} ${isRegistry ? s.tabRegistry : ""} ${selectedTabs.has(i) ? s.tabSelected : ""} ${isMinimized ? s.tabMinimized : ""}`}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.stopPropagation();
                  setSelectedTabs(prev => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  });
                } else {
                  setSelectedTabs(new Set());
                  setActiveRoomIdx(i);
                }
              }}
            >
              {isRegistry && (
                <button
                  className={s.tabFolderIcon}
                  title={isMinimized ? "Expand room" : "Minimize room"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimizedTabs(prev => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    });
                  }}
                >📁</button>
              )}
              {!isMinimized && (renamingIdx === i ? (
                <input
                  className={s.tabRenameInput}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") cancelRename();
                    e.stopPropagation();
                  }}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span
                  className={s.tabName}
                  onDoubleClick={(e) => { e.stopPropagation(); beginRename(i); }}
                  title={`${roomNames[i]} (${r.id})`}
                >
                  {roomNames[i]}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── EDITOR BODY (toolbar + canvas + palette) ───────────── */}
      <div className={s.editorBody}>
      {/* ── LEFT: Toolbar ──────────────────────────────────────── */}
      <div className={s.toolbar} style={{ width: toolbarWidth }}>
        {/* New rooms list (non-registry rooms only) */}
        <div className={s.toolbarSection}>
          <h3>New Rooms</h3>
          <div className={s.roomList}>
            {rooms.map((r, i) => {
              if (registryNameSet.current.has(roomNames[i])) return null;
              return (
                <div
                  key={i}
                  className={`${s.roomItem} ${i === activeRoomIdx ? s.roomItemActive : ""}`}
                  onClick={() => setActiveRoomIdx(i)}
                >
                  <span className={s.roomItemName}>{roomNames[i]}</span>
                </div>
              );
            })}
          </div>
          <div className={s.toolbarRow}>
            <button className={s.toolBtn} onClick={addRoom}>+ New</button>
            <button className={s.toolBtn} onClick={importFromFile}>Import</button>
          </div>
          {/* Hidden file input for Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".ts,.txt"
            style={{ display: "none" }}
            onChange={handleFileImport}
          />
        </div>

        {/* Room settings */}
        <div className={s.toolbarSection}>
          <h3>Room Settings</h3>
          <div className={s.labelRow}>
            <span>Name:</span>
            <input
              className={s.inputSmall}
              style={{ width: 100 }}
              value={roomNames[activeRoomIdx]}
              onChange={e => {
                const newName = e.target.value;
                setRoomNames(prev => { const copy = [...prev]; copy[activeRoomIdx] = newName; return copy; });
                updateRoom(r => ({ ...r, id: newName }));
              }}
            />
          </div>
          <div className={s.labelRow}>
            <span>ID:</span>
            <span style={{ color: "#666", fontSize: 10 }}>{room.id}</span>
          </div>
          <div className={s.labelRow}>
            <span>Cols:</span>
            <input
              className={s.inputSmall}
              type="number" min={1} max={200}
              value={room.cols}
              onChange={e => resizeRoom(Number(e.target.value) || 1, room.rows)}
            />
          </div>
          <div className={s.labelRow}>
            <span>Rows:</span>
            <input
              className={s.inputSmall}
              type="number" min={1} max={200}
              value={room.rows}
              onChange={e => resizeRoom(room.cols, Number(e.target.value) || 1)}
            />
          </div>
          <div className={s.labelRow}>
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={!!room.loopX}
                onChange={e => updateRoom(r => ({ ...r, loopX: e.target.checked || undefined }))}
              />
              Loop X
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={!!room.loopY}
                onChange={e => updateRoom(r => ({ ...r, loopY: e.target.checked || undefined }))}
              />
              Loop Y
            </label>
          </div>
          <div className={s.labelRow}>
            <span>Tileset:</span>
            <select
              className={s.selectSmall}
              value={tilesetKey}
              onChange={e => setTilesetKey(e.target.value)}
            >
              {Object.keys(TILESET_OPTIONS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className={s.labelRow}>
            <span>Background:</span>
            <select
              className={s.selectSmall}
              value={bgKey}
              onChange={e => setBgKey(e.target.value)}
            >
              {Object.keys(BACKGROUND_OPTIONS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          {bgKey !== "none" && (
            <>
              <div className={s.labelRow}>
                <span>Scroll:</span>
                <select
                  className={s.selectSmall}
                  value={room.bgScrollMode ?? "diagonal-se"}
                  onChange={e => updateRoom(r => ({
                    ...r,
                    bgScrollMode: e.target.value as RoomDef["bgScrollMode"],
                  }))}
                >
                  {BG_SCROLL_MODES.map(m => (
                    <option key={m} value={m}>{BG_SCROLL_LABELS[m]}</option>
                  ))}
                </select>
              </div>
              <div className={s.labelRow}>
                <span>Speed:</span>
                <input
                  className={s.inputSmall}
                  type="number" min={1} max={200}
                  value={room.bgSpeed ?? 20}
                  onChange={e => updateRoom(r => ({
                    ...r,
                    bgSpeed: Number(e.target.value) || 20,
                  }))}
                />
              </div>
            </>
          )}
          <div className={s.labelRow}>
            <span>Music:</span>
            <select
              className={s.selectSmall}
              value={musicKey}
              onChange={e => setMusicKey(e.target.value)}
            >
              <option value="">(none)</option>
              {PLAYABLE_MUSIC.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Spawn settings */}
        <div className={s.toolbarSection}>
          <h3>Spawn Point</h3>
          <div className={s.labelRow}>
            <span>Col:</span>
            <input
              className={s.inputSmall}
              type="number" min={0}
              value={room.defaultSpawn.col}
              onChange={e => updateRoom(r => ({
                ...r,
                defaultSpawn: { ...r.defaultSpawn, col: Number(e.target.value) || 0 },
              }))}
            />
          </div>
          <div className={s.labelRow}>
            <span>Row:</span>
            <input
              className={s.inputSmall}
              type="number" min={0}
              value={room.defaultSpawn.row}
              onChange={e => updateRoom(r => ({
                ...r,
                defaultSpawn: { ...r.defaultSpawn, row: Number(e.target.value) || 0 },
              }))}
            />
          </div>
          <div className={s.labelRow}>
            <span>Dir:</span>
            <select
              className={s.selectSmall}
              value={room.defaultSpawn.dir}
              onChange={e => updateRoom(r => ({
                ...r,
                defaultSpawn: { ...r.defaultSpawn, dir: e.target.value as Direction },
              }))}
            >
              {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button
            className={`${s.toolBtn} ${tool === "spawn" ? s.active : ""}`}
            style={{ marginTop: 4, width: "100%" }}
            onClick={() => setTool("spawn")}
          >
            Click to Place Spawn
          </button>
        </div>

        {/* Tools */}
        <div className={s.toolbarSection}>
          <h3>Tools</h3>
          <div className={s.toolbarRow}>
            <button
              className={`${s.toolBtn} ${tool === "paint" ? s.active : ""}`}
              onClick={() => setTool("paint")}
            >
              Paint
            </button>
            <button
              className={`${s.toolBtnDanger} ${tool === "erase" ? s.active : ""}`}
              onClick={() => setTool("erase")}
            >
              Erase
            </button>
            <button
              className={`${s.toolBtn} ${tool === "select" ? s.active : ""}`}
              onClick={() => setTool("select")}
            >
              Select
            </button>
            <button
              className={`${s.toolBtn} ${tool === "select-all" ? s.active : ""}`}
              onClick={() => setTool("select-all")}
              title="Select All Layers (BG+FG)"
            >
              Sel All
            </button>
            <button
              className={`${s.toolBtn} ${tool === "move" ? s.active : ""}`}
              onClick={() => setTool("move")}
            >
              Move
            </button>
          </div>
          <div className={s.toolbarRow}>
            <button className={s.toolBtn} onClick={undo} title="Undo (Ctrl+Z)">↩ Undo</button>
            <button className={s.toolBtn} onClick={redo} title="Redo (Ctrl+Shift+Z)">↪ Redo</button>
          </div>
          {selection && (
            <div style={{ marginTop: 4, fontSize: 9, color: "#88aaff" }}>
              Selection: {selTileCount} tiles
              <button
                className={s.toolBtn}
                style={{ marginLeft: 6, fontSize: 9, padding: "1px 4px" }}
                onClick={() => setSelection(null)}
              >
                Clear
              </button>
            </div>
          )}
          {pasting && (
            <div style={{ marginTop: 4, fontSize: 9, color: "#ffcc00" }}>
              Paste mode: click to place
              <button
                className={s.toolBtn}
                style={{ marginLeft: 6, fontSize: 9, padding: "1px 4px" }}
                onClick={() => setPasting(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Layers panel (Photoshop-style) */}
        <div className={s.toolbarSection}>
          <h3>Layers</h3>
          <div className={s.layerRow}>
            <button className={s.layerEye} onClick={() => setBgVisible(v => !v)} title="Toggle BG visibility">
              {bgVisible ? "\u{1F441}" : "\u2014"}
            </button>
            <span
              className={`${s.layerName} ${activeLayer === "bg" ? s.layerActive : ""}`}
              onClick={() => setActiveLayer("bg")}
            >BG</span>
            <input
              type="range" min={0} max={100} step={5}
              className={s.layerSlider}
              value={Math.round(bgOpacity * 100)}
              onChange={e => setBgOpacity(Number(e.target.value) / 100)}
              title={`BG opacity: ${Math.round(bgOpacity * 100)}%`}
            />
          </div>
          <div className={s.layerRow}>
            <button className={s.layerEye} onClick={() => setFgVisible(v => !v)} title="Toggle FG visibility">
              {fgVisible ? "\u{1F441}" : "\u2014"}
            </button>
            <span
              className={`${s.layerName} ${activeLayer === "fg" ? s.layerActive : ""}`}
              onClick={() => setActiveLayer("fg")}
            >FG</span>
            <input
              type="range" min={0} max={100} step={5}
              className={s.layerSlider}
              value={Math.round(fgOpacity * 100)}
              onChange={e => setFgOpacity(Number(e.target.value) / 100)}
              title={`FG opacity: ${Math.round(fgOpacity * 100)}%`}
            />
          </div>
          <div className={s.layerRow}>
            <button className={s.layerEye} onClick={() => setShowCollision(v => !v)} title="Toggle collision overlay">
              {showCollision ? "\u{1F441}" : "\u2014"}
            </button>
            <span className={s.layerName}>Collision</span>
          </div>
          <div className={s.layerRow}>
            <button className={s.layerEye} onClick={() => setShowMarkers(v => !v)} title="Toggle markers">
              {showMarkers ? "\u{1F441}" : "\u2014"}
            </button>
            <span className={s.layerName}>Markers</span>
          </div>
          <div className={s.layerRow}>
            <button className={s.layerEye} onClick={() => setShowAnimMarkers(v => !v)} title="Toggle anim markers">
              {showAnimMarkers ? "\u{1F441}" : "\u2014"}
            </button>
            <span className={s.layerName}>Anim ✦</span>
          </div>
        </div>

        {/* Animation settings */}
        <div className={s.toolbarSection}>
          <h3>Animation</h3>
          <div className={s.labelRow}>
            <span>Interval:</span>
            <input
              className={s.inputSmall}
              type="number" min={50} max={5000} step={50}
              style={{ width: 70 }}
              value={room.animIntervalMs ?? 500}
              onChange={e => updateRoom(r => ({ ...r, animIntervalMs: Number(e.target.value) || 500 }))}
            />
            <span style={{ fontSize: 9, color: '#666' }}>ms</span>
          </div>
          <div className={s.toolbarRow}>
            <button
              className={`${s.toolBtn} ${previewAnims ? s.active : ""}`}
              onClick={() => setPreviewAnims(v => !v)}
            >
              Preview
            </button>
          </div>
          {room.animTiles && Object.keys(room.animTiles).length > 0 && (
            <div style={{ marginTop: 4, fontSize: 9, color: '#fc0' }}>
              {Object.keys(room.animTiles).length} animated tile(s)
            </div>
          )}
        </div>

        {/* Export / Save */}
        <div className={s.toolbarSection}>
          <h3>Save &amp; Export</h3>
          {isExistingRoom ? (
            <button
              className={s.toolBtnSave}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Room"}
            </button>
          ) : (
            <button
              className={s.toolBtnSave}
              onClick={handleSaveToRegistry}
              disabled={saving || !isNewRoomRenamed}
              title={!isNewRoomRenamed ? "Rename the room first (cannot use default name)" : "Save to /rooms and update registry.ts"}
            >
              {saving ? "Saving…" : "Save to Registry"}
            </button>
          )}
          {saveStatus && (
            <div className={`${s.saveStatus} ${saveStatus.ok ? s.saveStatusOk : s.saveStatusErr}`}>
              {saveStatus.msg}
            </div>
          )}
          <button className={s.toolBtnExport} style={{ marginTop: 6 }} onClick={handleExport}>
            Export Current Room
          </button>
          <button className={s.toolBtnExport} style={{ marginTop: 4 }} onClick={handleExportAll}>
            Export All Rooms
          </button>
        </div>
        {/* Toolbar resize handle — right edge */}
        <div
          className={s.resizeHandle}
          style={{ right: 0 }}
          onMouseDown={e => onResizeMouseDown(e, "toolbar")}
        />
      </div>

      {/* ── CENTRE: Map canvas ─────────────────────────────────── */}
      <div className={s.mapArea}>
        <div className={s.mapScroll}>
          <div className={s.mapPad}>
            <canvas
              ref={mapCanvasRef}
              className={s.mapCanvas}
              onMouseDown={onMapMouseDown}
              onMouseMove={(e) => { onMapMouseMove(e); onMapHover(e); }}
              onMouseUp={onMapMouseUp}
              onMouseLeave={() => {
                // Don't commit a move when the cursor leaves — user can re-enter or press Escape
                if (!(tool === "move" && moveDrag.current)) onMapMouseUp();
                setHovered(null);
              }}
            />
          </div>
        </div>

        {/* Hotbar */}
        <div className={s.hotbar}>
          <canvas
            ref={hotbarCanvasRef}
            className={s.hotbarCanvas}
            onClick={onHotbarClick}
            onContextMenu={e => { e.preventDefault(); onHotbarClick(e); }}
          />
          <div className={s.hotbarHint}>
            Click to equip · Shift+Click to assign · 1-9 keys · Right-click to clear
          </div>
        </div>

        {/* Status bar */}
        <div className={s.statusBar}>
          <span>
            Tool: <strong style={{ color: "#ddd" }}>{tool}</strong>
          </span>
          <span>
            Layer: <strong style={{ color: "#ddd" }}>{activeLayer.toUpperCase()}</strong>
          </span>
          {paletteSel && (
            <span>
              Tile: <strong style={{ color: "#ff0" }}>
                ({paletteSel.c1}, {paletteSel.r1})
                {(paletteSel.c1 !== paletteSel.c2 || paletteSel.r1 !== paletteSel.r2) &&
                  ` → (${paletteSel.c2}, ${paletteSel.r2}) [${paletteSel.c2 - paletteSel.c1 + 1}×${paletteSel.r2 - paletteSel.r1 + 1}]`}
              </strong>
            </span>
          )}
          {hovered && (
            <span>
              Cursor: <strong style={{ color: "#ddd" }}>
                c{hovered.col}, r{hovered.row}
              </strong>
            </span>
          )}
          <span style={{ marginLeft: "auto", color: "#666" }}>
            \ exit · Backspace erase · Ctrl+Z undo · Ctrl+Shift+Z redo · Ctrl+C/V copy/paste · Del clear
          </span>
        </div>
      </div>

      {/* ── RIGHT: Palette ─────────────────────────────────────── */}
      <div className={s.palettePanel} style={{ width: paletteWidth }}>
        {/* Palette resize handle — left edge */}
        <div
          className={s.resizeHandle}
          style={{ left: 0 }}
          onMouseDown={e => onResizeMouseDown(e, "palette")}
        />
        <div className={s.paletteHeader}>
          Tileset: {tilesetKey} ({sheetCols}×{sheetRows})
        </div>
        <div
          ref={paletteScrollRef}
          className={s.paletteScroll}
          onMouseDown={onPaletteMouseDown}
        >
          <canvas
            ref={paletteCanvasRef}
            className={s.paletteCanvas}
          />
        </div>
      </div>
      </div>{/* end editorBody */}

      {/* ── Context menu ───────────────────────────────────────── */}
      {ctxMenu && (
        <div
          className={s.contextMenu}
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={() => setCtxMenu(null)}
        >
          <div style={{ padding: "2px 12px", color: "#888", fontSize: 9 }}>
            {isInSelection
              ? `Selection: ${selTileCount} tiles`
              : `Tile (${ctxMenu.col}, ${ctxMenu.row})${ctxTile ? ` — ${ctxTile.collision}` : ""}`}
          </div>
          <div className={s.contextSep} />
          {ALL_COLLISIONS.map(ct => (
            <div
              key={ct}
              className={ctxTile?.collision === ct ? s.contextItemActive : s.contextItem}
              onClick={(e) => { e.stopPropagation(); setCollision(ct); }}
            >
              <span>{ct}</span>
              <span style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: COLLISION_COLORS[ct] || "#333",
                border: "1px solid #555",
                borderRadius: 2,
              }} />
            </div>
          ))}
          <div className={s.contextSep} />
          {ctxTile && (ctxTile.collision === "door-auto" || ctxTile.collision === "door-interact") && (
            <div className={s.contextItem} onClick={(e) => { e.stopPropagation(); openTeleportModal(); }}>
              Edit Teleport...
            </div>
          )}
          {ctxTile && ctxTile.collision === "interactable" && (
            <div className={s.contextItem} onClick={(e) => { e.stopPropagation(); openInteractableModal(); }}>
              Edit Interactable...
            </div>
          )}
          <div className={s.contextItem} onClick={(e) => { e.stopPropagation(); openAnimModal(); }}>
            Edit Animation...
          </div>
          <div className={s.contextSep} />
          <div
            className={ctxTile?.overlay ? s.contextItemActive : s.contextItem}
            onClick={(e) => { e.stopPropagation(); toggleOverlay(); }}
          >
            {ctxTile?.overlay ? "✓ Overlay (above player)" : "Overlay (above player)"}
          </div>
          <div
            className={s.contextItem}
            onClick={(e) => { e.stopPropagation(); setTool("spawn"); paintTile(ctxMenu.col, ctxMenu.row); setCtxMenu(null); setTool("paint"); }}
          >
            Set Spawn Here
          </div>
        </div>
      )}

      {/* ── Teleport modal ─────────────────────────────────────── */}
      {tpModal && (
        <div className={s.modal} onClick={() => setTpModal(null)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Teleport at ({tpModal.col}, {tpModal.row})</h3>
            <div className={s.modalRow}>
              <span>Target Room:</span>
              <input
                className={s.modalInput}
                value={tpModal.tp.roomId}
                onChange={e => setTpModal(p => p ? { ...p, tp: { ...p.tp, roomId: e.target.value } } : null)}
                list="room-ids"
              />
              <datalist id="room-ids">
                {allRoomIds.map(id => <option key={id} value={id} />)}
              </datalist>
            </div>
            <div className={s.modalRow}>
              <span>Spawn Col:</span>
              <input
                className={s.modalInput}
                type="number"
                value={tpModal.tp.spawnCol}
                onChange={e => setTpModal(p => p ? { ...p, tp: { ...p.tp, spawnCol: Number(e.target.value) || 0 } } : null)}
              />
            </div>
            <div className={s.modalRow}>
              <span>Spawn Row:</span>
              <input
                className={s.modalInput}
                type="number"
                value={tpModal.tp.spawnRow}
                onChange={e => setTpModal(p => p ? { ...p, tp: { ...p.tp, spawnRow: Number(e.target.value) || 0 } } : null)}
              />
            </div>
            <div className={s.modalRow}>
              <span>Spawn Dir:</span>
              <select
                className={s.modalInput}
                value={tpModal.tp.spawnDir}
                onChange={e => setTpModal(p => p ? { ...p, tp: { ...p.tp, spawnDir: e.target.value as Direction } } : null)}
              >
                {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className={s.modalRow}>
              <span>Door Sound:</span>
              <select
                className={s.modalInput}
                value={tpModal.tp.doorSound ?? ""}
                onChange={e => setTpModal(p => p ? { ...p, tp: { ...p.tp, doorSound: e.target.value || undefined } } : null)}
              >
                <option value="">(default: footstep.wav)</option>
                {SOUND_FILES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* ── Cutscene settings ──────────────────────────── */}
            <hr style={{ border: "none", borderTop: "1px solid #444", margin: "8px 0" }} />
            <div style={{ color: "#f0c", fontSize: 10, marginBottom: 6 }}>Cutscene (plays once per session)</div>
            <div className={s.modalRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <span style={{ marginBottom: 4, fontSize: 10 }}>Image paths (one per line, e.g. /images/cutscene1.png):</span>
              <textarea
                style={{
                  background: "#222",
                  border: "1px solid #444",
                  borderRadius: 3,
                  color: "#ccc",
                  fontFamily: "inherit",
                  fontSize: 11,
                  padding: 6,
                  minHeight: 50,
                  resize: "vertical",
                }}
                value={(tpModal.tp.cutscene?.images ?? []).join("\n")}
                onChange={e => {
                  const imgs = e.target.value.split("\n").filter(l => l.trim());
                  setTpModal(p => {
                    if (!p) return null;
                    const cs: CutsceneDef = p.tp.cutscene
                      ? { ...p.tp.cutscene, images: imgs }
                      : { images: imgs, waitTime: 400, interval: 1500, fadeTime: 600 };
                    return { ...p, tp: { ...p.tp, cutscene: imgs.length > 0 ? cs : undefined } };
                  });
                }}
              />
            </div>
            {tpModal.tp.cutscene && tpModal.tp.cutscene.images.length > 0 && (<>
              <div className={s.modalRow}>
                <span>Wait (ms):</span>
                <input
                  className={s.modalInput}
                  type="number" min={0} max={10000} step={100}
                  value={tpModal.tp.cutscene.waitTime}
                  onChange={e => setTpModal(p => {
                    if (!p || !p.tp.cutscene) return p;
                    return { ...p, tp: { ...p.tp, cutscene: { ...p.tp.cutscene!, waitTime: Number(e.target.value) || 0 } } };
                  })}
                />
                <span style={{ marginLeft: 8 }}>Interval (ms):</span>
                <input
                  className={s.modalInput}
                  type="number" min={100} max={30000} step={100}
                  value={tpModal.tp.cutscene.interval}
                  onChange={e => setTpModal(p => {
                    if (!p || !p.tp.cutscene) return p;
                    return { ...p, tp: { ...p.tp, cutscene: { ...p.tp.cutscene!, interval: Number(e.target.value) || 1500 } } };
                  })}
                />
              </div>
              <div className={s.modalRow}>
                <span>Fade (ms):</span>
                <input
                  className={s.modalInput}
                  type="number" min={0} max={10000} step={100}
                  value={tpModal.tp.cutscene.fadeTime}
                  onChange={e => setTpModal(p => {
                    if (!p || !p.tp.cutscene) return p;
                    return { ...p, tp: { ...p.tp, cutscene: { ...p.tp.cutscene!, fadeTime: Number(e.target.value) || 600 } } };
                  })}
                />
              </div>
              <div className={s.modalRow}>
                <span>Reveal Sound:</span>
                <select
                  className={s.modalInput}
                  value={tpModal.tp.cutscene.revealSound ?? ""}
                  onChange={e => setTpModal(p => {
                    if (!p || !p.tp.cutscene) return p;
                    return { ...p, tp: { ...p.tp, cutscene: { ...p.tp.cutscene!, revealSound: e.target.value || undefined } } };
                  })}
                >
                  <option value="">(none)</option>
                  {SOUND_FILES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </>)}

            <div className={s.modalBtnRow}>
              <button className={s.toolBtnDanger} onClick={removeTeleport}>Remove</button>
              <button className={s.toolBtn} onClick={() => setTpModal(null)}>Cancel</button>
              <button className={s.toolBtnExport} onClick={saveTeleport}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Interactable modal ─────────────────────────────────── */}
      {intModal && (
        <div className={s.modal} onClick={() => setIntModal(null)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Interactable at ({intModal.col}, {intModal.row})</h3>
            <div className={s.modalRow}>
              <span>ID:</span>
              <input
                className={s.modalInput}
                value={intModal.def.id}
                onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, id: e.target.value } } : null)}
              />
            </div>
            <div className={s.modalRow}>
              <span>Type:</span>
              <select
                className={s.modalInput}
                value={intModal.def.type}
                onChange={e => setIntModal(p => p ? {
                  ...p, def: { ...p.def, type: e.target.value as "dialogue" | "event" }
                } : null)}
              >
                <option value="dialogue">dialogue</option>
                <option value="event">event</option>
              </select>
            </div>
            <div className={s.modalRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <span style={{ marginBottom: 4 }}>Lines (one per line):</span>
              <textarea
                style={{
                  background: "#222",
                  border: "1px solid #444",
                  borderRadius: 3,
                  color: "#ccc",
                  fontFamily: "inherit",
                  fontSize: 11,
                  padding: 6,
                  minHeight: 80,
                  resize: "vertical",
                }}
                value={(intModal.def.lines ?? []).join("\n")}
                onChange={e => setIntModal(p => p ? {
                  ...p,
                  def: { ...p.def, lines: e.target.value.split("\n") },
                } : null)}
              />
            </div>

            {/* ── Proximity sound settings ──────────────────────── */}
            <hr style={{ border: "none", borderTop: "1px solid #444", margin: "8px 0" }} />
            <div style={{ color: "#0f0", fontSize: 10, marginBottom: 6 }}>Proximity Sound</div>
            <div className={s.modalRow}>
              <span>Sound:</span>
              <select
                className={s.modalInput}
                value={intModal.def.proxSound ?? ""}
                onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, proxSound: e.target.value || undefined } } : null)}
              >
                <option value="">(none)</option>
                {SOUND_FILES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            {intModal.def.proxSound && (<>
              <div className={s.modalRow}>
                <span>Mode:</span>
                <select
                  className={s.modalInput}
                  value={intModal.def.proxSoundMode ?? "loop"}
                  onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, proxSoundMode: e.target.value as "loop" | "once" | "interval" } } : null)}
                >
                  <option value="loop">loop</option>
                  <option value="once">once (on enter range)</option>
                  <option value="interval">interval (repeat)</option>
                </select>
              </div>
              {intModal.def.proxSoundMode === "interval" && (
                <div className={s.modalRow}>
                  <span>Interval (s):</span>
                  <input
                    className={s.modalInput}
                    type="number" min={0.5} max={60} step={0.5}
                    value={intModal.def.proxSoundInterval ?? 5}
                    onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, proxSoundInterval: Number(e.target.value) || 5 } } : null)}
                  />
                </div>
              )}
              <div className={s.modalRow}>
                <span>Volume:</span>
                <input
                  className={s.modalInput}
                  type="number" min={0} max={1} step={0.05}
                  value={intModal.def.proxSoundVolume ?? 1}
                  onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, proxSoundVolume: Number(e.target.value) || 1 } } : null)}
                />
              </div>
              <div className={s.modalRow}>
                <span>Max Dist:</span>
                <input
                  className={s.modalInput}
                  type="number" min={1} max={50}
                  value={intModal.def.proxSoundMaxDist ?? 8}
                  onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, proxSoundMaxDist: Number(e.target.value) || 8 } } : null)}
                />
              </div>
            </>)}

            {/* ── Event-only fields ─────────────────────────────── */}
            {intModal.def.type === "event" && (<>
              <hr style={{ border: "none", borderTop: "1px solid #444", margin: "8px 0" }} />
              <div style={{ color: "#fc0", fontSize: 10, marginBottom: 6 }}>Event Unlock Settings</div>
              <div className={s.modalRow}>
                <span>Lock ID:</span>
                <input
                  className={s.modalInput}
                  placeholder="target interactable id"
                  value={intModal.def.lockId ?? ""}
                  onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, lockId: e.target.value || undefined } } : null)}
                />
              </div>
              <div className={s.modalRow}>
                <span>Change to:</span>
                <select
                  className={s.modalInput}
                  value={intModal.def.changeType ?? "none"}
                  onChange={e => setIntModal(p => p ? {
                    ...p, def: { ...p.def, changeType: (e.target.value || undefined) as InteractableDef["changeType"] }
                  } : null)}
                >
                  <option value="none">none</option>
                  <option value="solid">solid</option>
                  <option value="door-auto">door-auto</option>
                  <option value="door-interact">door-interact</option>
                  <option value="interactable">interactable</option>
                </select>
              </div>

              {/* ── Door teleport fields ────────────────────────── */}
              {(intModal.def.changeType === "door-auto" || intModal.def.changeType === "door-interact") && (<>
                <div style={{ color: "#0cf", fontSize: 10, marginTop: 6, marginBottom: 4 }}>Teleport Target for Unlocked Door</div>
                <div className={s.modalRow}>
                  <span>Room:</span>
                  <input
                    className={s.modalInput}
                    placeholder="room id"
                    value={intModal.def.changeTeleport?.roomId ?? ""}
                    onChange={e => setIntModal(p => {
                      if (!p) return null;
                      const tp = p.def.changeTeleport ?? { roomId: "", spawnCol: 0, spawnRow: 0, spawnDir: "down" as const };
                      return { ...p, def: { ...p.def, changeTeleport: { ...tp, roomId: e.target.value } } };
                    })}
                  />
                </div>
                <div className={s.modalRow}>
                  <span>Col:</span>
                  <input
                    className={s.modalInput}
                    type="number" min={0}
                    value={intModal.def.changeTeleport?.spawnCol ?? 0}
                    onChange={e => setIntModal(p => {
                      if (!p) return null;
                      const tp = p.def.changeTeleport ?? { roomId: "", spawnCol: 0, spawnRow: 0, spawnDir: "down" as const };
                      return { ...p, def: { ...p.def, changeTeleport: { ...tp, spawnCol: Number(e.target.value) || 0 } } };
                    })}
                  />
                  <span style={{ marginLeft: 8 }}>Row:</span>
                  <input
                    className={s.modalInput}
                    type="number" min={0}
                    value={intModal.def.changeTeleport?.spawnRow ?? 0}
                    onChange={e => setIntModal(p => {
                      if (!p) return null;
                      const tp = p.def.changeTeleport ?? { roomId: "", spawnCol: 0, spawnRow: 0, spawnDir: "down" as const };
                      return { ...p, def: { ...p.def, changeTeleport: { ...tp, spawnRow: Number(e.target.value) || 0 } } };
                    })}
                  />
                </div>
                <div className={s.modalRow}>
                  <span>Dir:</span>
                  <select
                    className={s.modalInput}
                    value={intModal.def.changeTeleport?.spawnDir ?? "down"}
                    onChange={e => setIntModal(p => {
                      if (!p) return null;
                      const tp = p.def.changeTeleport ?? { roomId: "", spawnCol: 0, spawnRow: 0, spawnDir: "down" as const };
                      return { ...p, def: { ...p.def, changeTeleport: { ...tp, spawnDir: e.target.value as "up" | "down" | "left" | "right" } } };
                    })}
                  >
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </>)}

              {/* ── Replacement dialogue lines ──────────────────── */}
              {intModal.def.changeType === "interactable" && (
                <div className={s.modalRow} style={{ flexDirection: "column", alignItems: "stretch", marginTop: 6 }}>
                  <span style={{ marginBottom: 4, color: "#0cf", fontSize: 10 }}>Replacement Lines (for unlocked interactable):</span>
                  <textarea
                    style={{
                      background: "#222",
                      border: "1px solid #444",
                      borderRadius: 3,
                      color: "#ccc",
                      fontFamily: "inherit",
                      fontSize: 11,
                      padding: 6,
                      minHeight: 60,
                      resize: "vertical",
                    }}
                    value={(intModal.def.changeLines ?? []).join("\n")}
                    onChange={e => setIntModal(p => p ? {
                      ...p,
                      def: { ...p.def, changeLines: e.target.value.split("\n") },
                    } : null)}
                  />
                </div>
              )}

              {/* ── Sprite change fields ─────────────────────── */}
              <hr style={{ border: "none", borderTop: "1px solid #333", margin: "8px 0" }} />
              <div style={{ color: "#0f0", fontSize: 10, marginBottom: 6 }}>Sprite Change (Lock ID tiles)</div>
              <div className={s.modalRow}>
                <span>Sprite Col:</span>
                <input
                  className={s.modalInput}
                  type="number" min={0}
                  placeholder="(none)"
                  value={intModal.def.changeSpriteCol ?? ""}
                  onChange={e => setIntModal(p => p ? {
                    ...p, def: { ...p.def, changeSpriteCol: e.target.value !== "" ? Number(e.target.value) : undefined }
                  } : null)}
                />
                <span style={{ marginLeft: 8 }}>Sprite Row:</span>
                <input
                  className={s.modalInput}
                  type="number" min={0}
                  placeholder="(none)"
                  value={intModal.def.changeSpriteRow ?? ""}
                  onChange={e => setIntModal(p => p ? {
                    ...p, def: { ...p.def, changeSpriteRow: e.target.value !== "" ? Number(e.target.value) : undefined }
                  } : null)}
                />
              </div>

              {/* ── Event sound settings ────────────────────────── */}
              <hr style={{ border: "none", borderTop: "1px solid #333", margin: "8px 0" }} />
              <div style={{ color: "#f80", fontSize: 10, marginBottom: 6 }}>Event Sound Overrides</div>

              {(intModal.def.changeType === "door-auto" || intModal.def.changeType === "door-interact") && (
                <div className={s.modalRow}>
                  <span>Door Sound:</span>
                  <select
                    className={s.modalInput}
                    value={intModal.def.changeDoorSound ?? ""}
                    onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, changeDoorSound: e.target.value || undefined } } : null)}
                  >
                    <option value="">(default)</option>
                    {SOUND_FILES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={s.modalRow}>
                <span>Set Music:</span>
                <select
                  className={s.modalInput}
                  value={intModal.def.changeMusic ?? ""}
                  onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, changeMusic: e.target.value || undefined } } : null)}
                >
                  <option value="">(no change)</option>
                  {PLAYABLE_MUSIC.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className={s.modalRow}>
                <span>Prox Sound:</span>
                <select
                  className={s.modalInput}
                  value={intModal.def.changeProxSound ?? ""}
                  onChange={e => setIntModal(p => p ? { ...p, def: { ...p.def, changeProxSound: e.target.value || undefined } } : null)}
                >
                  <option value="">(no change)</option>
                  <option value="__off__">(disable target prox sound)</option>
                  {SOUND_FILES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* ── Event cutscene override (for door targets) ──── */}
              {(intModal.def.changeType === "door-auto" || intModal.def.changeType === "door-interact") && (<>
                <hr style={{ border: "none", borderTop: "1px solid #333", margin: "8px 0" }} />
                <div style={{ color: "#f0c", fontSize: 10, marginBottom: 6 }}>Cutscene (on unlocked door)</div>
                <div className={s.modalRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <span style={{ marginBottom: 4, fontSize: 10 }}>Image paths (one per line):</span>
                  <textarea
                    style={{
                      background: "#222",
                      border: "1px solid #444",
                      borderRadius: 3,
                      color: "#ccc",
                      fontFamily: "inherit",
                      fontSize: 11,
                      padding: 6,
                      minHeight: 40,
                      resize: "vertical",
                    }}
                    value={(intModal.def.changeCutscene?.images ?? []).join("\n")}
                    onChange={e => {
                      const imgs = e.target.value.split("\n").filter(l => l.trim());
                      setIntModal(p => {
                        if (!p) return null;
                        const cs: CutsceneDef = p.def.changeCutscene
                          ? { ...p.def.changeCutscene, images: imgs }
                          : { images: imgs, waitTime: 400, interval: 1500, fadeTime: 600 };
                        return { ...p, def: { ...p.def, changeCutscene: imgs.length > 0 ? cs : undefined } };
                      });
                    }}
                  />
                </div>
                {intModal.def.changeCutscene && intModal.def.changeCutscene.images.length > 0 && (<>
                  <div className={s.modalRow}>
                    <span>Wait (ms):</span>
                    <input
                      className={s.modalInput}
                      type="number" min={0} max={10000} step={100}
                      value={intModal.def.changeCutscene.waitTime}
                      onChange={e => setIntModal(p => {
                        if (!p || !p.def.changeCutscene) return p;
                        return { ...p, def: { ...p.def, changeCutscene: { ...p.def.changeCutscene!, waitTime: Number(e.target.value) || 0 } } };
                      })}
                    />
                    <span style={{ marginLeft: 8 }}>Interval (ms):</span>
                    <input
                      className={s.modalInput}
                      type="number" min={100} max={30000} step={100}
                      value={intModal.def.changeCutscene.interval}
                      onChange={e => setIntModal(p => {
                        if (!p || !p.def.changeCutscene) return p;
                        return { ...p, def: { ...p.def, changeCutscene: { ...p.def.changeCutscene!, interval: Number(e.target.value) || 1500 } } };
                      })}
                    />
                  </div>
                  <div className={s.modalRow}>
                    <span>Fade (ms):</span>
                    <input
                      className={s.modalInput}
                      type="number" min={0} max={10000} step={100}
                      value={intModal.def.changeCutscene.fadeTime}
                      onChange={e => setIntModal(p => {
                        if (!p || !p.def.changeCutscene) return p;
                        return { ...p, def: { ...p.def, changeCutscene: { ...p.def.changeCutscene!, fadeTime: Number(e.target.value) || 600 } } };
                      })}
                    />
                  </div>
                  <div className={s.modalRow}>
                    <span>Reveal Sound:</span>
                    <select
                      className={s.modalInput}
                      value={intModal.def.changeCutscene.revealSound ?? ""}
                      onChange={e => setIntModal(p => {
                        if (!p || !p.def.changeCutscene) return p;
                        return { ...p, def: { ...p.def, changeCutscene: { ...p.def.changeCutscene!, revealSound: e.target.value || undefined } } };
                      })}
                    >
                      <option value="">(none)</option>
                      {SOUND_FILES.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </>)}
              </>)}
            </>)}

            <div className={s.modalBtnRow}>
              <button className={s.toolBtnDanger} onClick={removeInteractable}>Remove</button>
              <button className={s.toolBtn} onClick={() => setIntModal(null)}>Cancel</button>
              <button className={s.toolBtnExport} onClick={saveInteractable}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Animation modal ────────────────────────────────────── */}
      {animModal && (
        <div className={s.modal} onClick={() => setAnimModal(null)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()} style={{ minWidth: 360 }}>
            <h3>Tile Animation — base tile {animModal.tileId}</h3>
            <div style={{ color: "#888", fontSize: 10, marginBottom: 8 }}>
              Base: col {animModal.tileId % sheetCols}, row {Math.floor(animModal.tileId / sheetCols)}
              &nbsp;·&nbsp;Interval: {room.animIntervalMs ?? 500}ms
            </div>

            {/* Frame strip */}
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#aaa" }}>Frames ({animModal.frames.length}):</span>
              <div style={{
                display: "flex",
                gap: 4,
                marginTop: 4,
                padding: 4,
                background: "#111",
                borderRadius: 4,
                overflowX: "auto",
                minHeight: 44,
                alignItems: "center",
              }}>
                {animModal.frames.map((fId, i) => {
                  const fc = fId % sheetCols;
                  const fr = Math.floor(fId / sheetCols);
                  return (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        border: i === 0 ? "2px solid #fc0" : "1px solid #444",
                        borderRadius: 3,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      title={`Frame ${i}: tile (${fc}, ${fr}) — click to remove`}
                      onClick={() => {
                        if (animModal.frames.length <= 1) return;
                        setAnimModal(prev => prev ? {
                          ...prev,
                          frames: prev.frames.filter((_, idx) => idx !== i),
                        } : null);
                      }}
                    >
                      {tilesetImg && (
                        <canvas
                          width={TILE}
                          height={TILE}
                          style={{ width: 40, height: 40, imageRendering: "pixelated" }}
                          ref={el => {
                            if (!el || !tilesetImg) return;
                            const c2 = el.getContext("2d");
                            if (!c2) return;
                            c2.imageSmoothingEnabled = false;
                            c2.clearRect(0, 0, TILE, TILE);
                            c2.drawImage(tilesetImg, fc * TILE, fr * TILE, TILE, TILE, 0, 0, TILE, TILE);
                          }}
                        />
                      )}
                      <span style={{
                        position: "absolute",
                        bottom: 0,
                        right: 1,
                        fontSize: 7,
                        color: "#fff",
                        background: "rgba(0,0,0,0.7)",
                        padding: "0 2px",
                        borderRadius: 2,
                      }}>{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add frame: click a tile from palette preview */}
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#aaa" }}>
                Add frame — click a tile below (or type tile index):
              </span>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                <input
                  className={s.modalInput}
                  type="number"
                  min={0}
                  placeholder="tile index"
                  style={{ width: 80 }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (val >= 0 && val < sheetCols * sheetRows) {
                        setAnimModal(prev => prev ? {
                          ...prev,
                          frames: [...prev.frames, val],
                        } : null);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <span style={{ fontSize: 9, color: "#666" }}>Enter to add</span>
              </div>
              {/* Mini palette for quick picking */}
              {tilesetImg && (
                <div style={{
                  marginTop: 4,
                  maxHeight: 160,
                  overflow: "auto",
                  border: "1px solid #333",
                  borderRadius: 3,
                  cursor: "crosshair",
                }}>
                  <canvas
                    width={sheetCols * TILE}
                    height={sheetRows * TILE}
                    style={{
                      width: sheetCols * TILE,
                      height: sheetRows * TILE,
                      imageRendering: "pixelated",
                      display: "block",
                    }}
                    ref={el => {
                      if (!el || !tilesetImg) return;
                      const c2 = el.getContext("2d");
                      if (!c2) return;
                      c2.imageSmoothingEnabled = false;
                      c2.drawImage(tilesetImg, 0, 0);
                      // Highlight frames already in the list
                      for (const fId of animModal.frames) {
                        const fc2 = fId % sheetCols;
                        const fr2 = Math.floor(fId / sheetCols);
                        c2.strokeStyle = "#fc0";
                        c2.lineWidth = 1;
                        c2.strokeRect(fc2 * TILE + 0.5, fr2 * TILE + 0.5, TILE - 1, TILE - 1);
                      }
                    }}
                    onClick={e => {
                      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
                      const mx = e.clientX - rect.left;
                      const my = e.clientY - rect.top;
                      const col = Math.floor(mx / TILE);
                      const row = Math.floor(my / TILE);
                      if (col >= 0 && col < sheetCols && row >= 0 && row < sheetRows) {
                        const tileIdx = row * sheetCols + col;
                        setAnimModal(prev => prev ? {
                          ...prev,
                          frames: [...prev.frames, tileIdx],
                        } : null);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className={s.modalBtnRow}>
              <button className={s.toolBtnDanger} onClick={removeAnim}>Remove All</button>
              <button className={s.toolBtn} onClick={() => setAnimModal(null)}>Cancel</button>
              <button className={s.toolBtnExport} onClick={saveAnim}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
