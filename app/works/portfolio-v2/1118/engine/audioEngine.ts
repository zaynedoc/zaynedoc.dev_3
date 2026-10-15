/* ================================================================
   1118 Game Engine — Audio Engine
   Manages all game audio: walking SFX, wall bumps, door transitions,
   proximity sounds, and background music.
   ================================================================ */

/* ── URL helpers ─────────────────────────────────────────────── */

function sfxUrl(filename: string): string {
  return `/sounds/${filename}`;
}

function musicUrl(filename: string): string {
  return `/music/${filename}`;
}

/* ── Master volume ────────────────────────────────────────────── */

let masterVolume = 1;

export function setMasterVolume(vol: number): void {
  masterVolume = Math.max(0, Math.min(1, vol));
  // Apply immediately to any active audio
  if (walkAudio) walkAudio.volume = 1 * masterVolume;
  if (musicAudio) musicAudio.volume = 0.6 * masterVolume;
  for (const entry of proxSounds.values()) {
    entry.audio.volume = entry.audio.volume; // will be re-scaled next frame
  }
}

export function getMasterVolume(): number {
  return masterVolume;
}

/* ── Shared audio pool (prevents creating too many Audio objects) */

function playOneShot(url: string, volume = 1): void {
  const a = new Audio(url);
  a.volume = Math.max(0, Math.min(1, volume * masterVolume));
  a.play().catch(() => {});
}

/* ================================================================
   WALKING LOOP
   Loops Fotstep_Carpet_Right_2.wav while the player is moving.
   ================================================================ */

let walkAudio: HTMLAudioElement | null = null;
let walkPlaying = false;

/** How far into the clip (seconds) to loop back — trims the tail silence. */
const WALK_LOOP_END = 0.5;

export function startWalkLoop(): void {
  if (walkPlaying) return;
  if (!walkAudio) {
    walkAudio = new Audio(sfxUrl("Fotstep_Carpet_Right_2.wav"));
    walkAudio.loop = true;
    walkAudio.volume = 1 * masterVolume;
    walkAudio.playbackRate = 2;
    // Trim the tail: restart early so the loop feels snappier
    walkAudio.addEventListener("timeupdate", () => {
      if (walkAudio && walkAudio.currentTime >= WALK_LOOP_END) {
        walkAudio.currentTime = 0;
      }
    });
  }
  walkAudio.currentTime = 0;
  walkAudio.play().catch(() => {});
  walkPlaying = true;
}

export function stopWalkLoop(): void {
  if (!walkPlaying || !walkAudio) return;
  walkAudio.pause();
  walkPlaying = false;
}

export function isWalkLoopPlaying(): boolean {
  return walkPlaying;
}

/* ================================================================
   WALL BUMP
   Plays Basic_1.wav once when the player walks into a wall.
   Cooldown prevents rapid re-triggering.
   ================================================================ */

let bumpCooldown = 0;
const BUMP_COOLDOWN_MS = 250;

export function playWallBump(): void {
  const now = performance.now();
  if (now - bumpCooldown < BUMP_COOLDOWN_MS) return;
  bumpCooldown = now;
  playOneShot(sfxUrl("Basic_1.wav"), 0.5);
}

/* ================================================================
   DOOR / TELEPORT SOUND
   Default: footstep.wav.  Configurable per-door via TeleportTarget.doorSound.
   ================================================================ */

export function playDoorSound(filename?: string): void {
  playOneShot(sfxUrl(filename || "footstep.wav"), 0.3);
}

/* ================================================================
   GENERIC SFX (for one-shots triggered by events, etc.)
   ================================================================ */

export function playSfx(filename: string, volume = 1): void {
  playOneShot(sfxUrl(filename), volume);
}

/* ================================================================
   BACKGROUND MUSIC
   Loops a music track per room. Doesn't restart if the same track
   is already playing (seamless room transitions).
   ================================================================ */

let musicAudio: HTMLAudioElement | null = null;
let currentMusicKey = "";

/**
 * Set the background music. Pass "" or undefined to stop music.
 * If the same key is already playing, does nothing (continuity).
 */
export function setMusic(key: string | undefined): void {
  const k = key ?? "";
  if (k === currentMusicKey) return;
  currentMusicKey = k;

  // Stop current music
  if (musicAudio) {
    musicAudio.pause();
    musicAudio.src = "";
    musicAudio = null;
  }

  if (!k) return;

  // Don't play .mid files (browsers can't handle them natively)
  if (k.endsWith(".mid")) return;

  musicAudio = new Audio(musicUrl(k));
  musicAudio.loop = true;
  musicAudio.volume = 0.6 * masterVolume;
  musicAudio.play().catch(() => {});
}

export function getMusicKey(): string {
  return currentMusicKey;
}

export function setMusicVolume(vol: number): void {
  if (musicAudio) musicAudio.volume = Math.max(0, Math.min(1, vol * masterVolume));
}

/* ================================================================
   PROXIMITY SOUND SYSTEM
   Interactables can emit sounds that get louder/quieter based on
   the player's distance. Managed per-room.
   ================================================================ */

export interface ProxSoundEntry {
  /** Unique key (usually "row,col"). */
  key: string;
  /** Audio element. */
  audio: HTMLAudioElement;
  /** Tile column of the emitter. */
  col: number;
  /** Tile row of the emitter. */
  row: number;
  /** Max volume (0–1). */
  maxVolume: number;
  /** Max tile distance for audibility. */
  maxDist: number;
  /** "loop" | "once" | "interval" */
  mode: string;
  /** Interval in seconds (for mode "interval"). */
  interval: number;
  /** Interval timer accumulator. */
  timer: number;
  /** Whether this source is currently active (can be toggled). */
  active: boolean;
}

const proxSounds: Map<string, ProxSoundEntry> = new Map();

/**
 * Register a proximity sound emitter for the current room.
 */
export function registerProximitySound(
  key: string,
  filename: string,
  col: number,
  row: number,
  mode: string,
  volume: number,
  maxDist: number,
  interval: number,
): void {
  // Don't double-register
  if (proxSounds.has(key)) return;

  const audio = new Audio(sfxUrl(filename));
  audio.volume = 0;

  if (mode === "loop") {
    audio.loop = true;
    audio.play().catch(() => {});
  }
  // "once" and "interval" are handled in updateProximitySounds

  proxSounds.set(key, {
    key,
    audio,
    col,
    row,
    maxVolume: Math.max(0, Math.min(1, volume)),
    maxDist: Math.max(1, maxDist),
    mode,
    interval,
    timer: 0,
    active: true,
  });
}

/**
 * Update all proximity sounds based on the player's current tile position.
 * Call this every frame during explore mode.
 */
export function updateProximitySounds(
  playerCol: number,
  playerRow: number,
  dt: number,
): void {
  for (const entry of proxSounds.values()) {
    if (!entry.active) {
      entry.audio.volume = 0;
      continue;
    }

    // Calculate tile distance
    const dx = playerCol - entry.col;
    const dy = playerRow - entry.row;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Volume based on distance (linear falloff)
    const factor = Math.max(0, 1 - dist / entry.maxDist);
    const vol = entry.maxVolume * factor * masterVolume;
    entry.audio.volume = vol;

    if (entry.mode === "interval") {
      entry.timer += dt;
      if (entry.timer >= entry.interval && vol > 0) {
        entry.timer = 0;
        // Re-play from start
        entry.audio.currentTime = 0;
        entry.audio.play().catch(() => {});
      }
    } else if (entry.mode === "once") {
      // "once" plays when player enters range for the first time
      if (vol > 0 && entry.audio.paused) {
        entry.audio.play().catch(() => {});
      }
    }
    // "loop" is always playing (started in register), volume handles audibility
  }
}

/**
 * Toggle a proximity sound on/off (e.g. when player interacts with it).
 */
export function toggleProximitySound(key: string): boolean {
  const entry = proxSounds.get(key);
  if (!entry) return false;
  entry.active = !entry.active;
  if (!entry.active) {
    entry.audio.pause();
    entry.audio.currentTime = 0;
  } else if (entry.mode === "loop") {
    entry.audio.play().catch(() => {});
  }
  return entry.active;
}

/**
 * Remove a specific proximity sound.
 */
export function removeProximitySound(key: string): void {
  const entry = proxSounds.get(key);
  if (entry) {
    entry.audio.pause();
    entry.audio.src = "";
    proxSounds.delete(key);
  }
}

/**
 * Remove all proximity sounds (call on room change).
 */
export function clearAllProximitySounds(): void {
  for (const entry of proxSounds.values()) {
    entry.audio.pause();
    entry.audio.src = "";
  }
  proxSounds.clear();
}

/* ================================================================
   CLEANUP
   Call on unmount to release all audio resources.
   ================================================================ */

export function cleanupAudio(): void {
  stopWalkLoop();
  if (walkAudio) { walkAudio.src = ""; walkAudio = null; }

  if (musicAudio) { musicAudio.pause(); musicAudio.src = ""; musicAudio = null; }
  currentMusicKey = "";

  clearAllProximitySounds();
  bumpCooldown = 0;
}