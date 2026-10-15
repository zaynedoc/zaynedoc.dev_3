/* ================================================================
   1118 Room Registry
   Maps room IDs → room data + asset paths.
   The game loop uses this to load and switch between rooms.
   ================================================================ */

import type { RoomDef } from "../engine/types";

/* ── Tileset paths (served from /public/1118-sprites/tilesets/) ── */

/** All tilesets keyed by name, for use in registry entries. */
export const TILESET_MAP: Record<string, string> = {
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


/* ── Room data imports ───────────────────────────────────────── */
import forest1 from "./forest1";
import island1 from "./island1";
import bridge1 from "./bridge1";
import downtown1 from "./downtown1";
import downtown2 from "./downtown2";
import downtown3 from "./downtown3";
import office1 from "./office1";
import office2 from "./office2";
import office3 from "./office3";
import crystal1 from "./crystal1";
import crystal2 from "./crystal2";
import downtown4 from "./downtown4";
import liminal1 from "./liminal1";
import hospital1 from "./hospital1";
import hospital2 from "./hospital2";
import hospital3 from "./hospital3";
import hospital4 from "./hospital4";
import water1 from "./water1";
import water2 from "./water2";
import water3 from "./water3";
import stoneruins1 from "./stoneruins1";
import nexus from "./nexus";

/* ── Types ───────────────────────────────────────────────────── */

export interface RoomEntry {
  room: RoomDef;
  tilesetSrc: string;
  backgroundSrc?: string;
}

/* ── Registry ────────────────────────────────────────────────── */

const ROOMS: Record<string, RoomEntry> = {
  "forest1": {
    room: forest1,
    tilesetSrc: TILESET_MAP.forest,
  },
  "island1": {
    room: island1,
    tilesetSrc: TILESET_MAP.forest,
  },
  "bridge1": {
    room: bridge1,
    tilesetSrc: TILESET_MAP.forest,
  },
  "downtown1": {
    room: downtown1,
    tilesetSrc: TILESET_MAP.downtown,
  },
  "downtown2": {
    room: downtown2,
    tilesetSrc: TILESET_MAP.downtown,
    backgroundSrc: "/1118-sprites/backgrounds/mystery.png",
  },
  "downtown3": {
    room: downtown3,
    tilesetSrc: TILESET_MAP.downtown,
  },
  "office1": {
    room: office1,
    tilesetSrc: TILESET_MAP.cathedral,
  },
  "office2": {
    room: office2,
    tilesetSrc: TILESET_MAP.cathedral,
  },
  "office3": {
    room: office3,
    tilesetSrc: TILESET_MAP.cathedral,
  },
  "crystal1": {
    room: crystal1,
    tilesetSrc: TILESET_MAP.crystal,
  },
  crystal2: {
    room: crystal2,
    tilesetSrc: TILESET_MAP.paradigm,
  },
  downtown4: {
    room: downtown4,
    tilesetSrc: TILESET_MAP.downtown,
  },
  liminal1: {
    room: liminal1,
    tilesetSrc: TILESET_MAP.lilyfield,
  },
  hospital1: {
    room: hospital1,
    tilesetSrc: TILESET_MAP.hospital,
  },
  hospital2: {
    room: hospital2,
    tilesetSrc: TILESET_MAP.hospital,
  },
  hospital3: {
    room: hospital3,
    tilesetSrc: TILESET_MAP.hospital,
  },
  hospital4: {
    room: hospital4,
    tilesetSrc: TILESET_MAP.hospital,
  },
  water1: {
    room: water1,
    tilesetSrc: TILESET_MAP.watermill,
  },
  water2: {
    room: water2,
    tilesetSrc: TILESET_MAP.watermill,
  },
  water3: {
    room: water3,
    tilesetSrc: TILESET_MAP.watermill,
  },
  stoneruins1: {
    room: stoneruins1,
    tilesetSrc: TILESET_MAP.stoneruins,
  },
  nexus: {
    room: nexus,
    tilesetSrc: TILESET_MAP.overworld,
  }
};  

/** Look up a room by its id. */
export function getRoom(roomId: string): RoomEntry | undefined {
  return ROOMS[roomId];
}

/** List all registered room IDs. */
export function getAllRoomIds(): string[] {
  return Object.keys(ROOMS);
}

export default ROOMS;
