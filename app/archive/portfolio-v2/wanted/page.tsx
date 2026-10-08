"use client";
/* eslint-disable react-hooks/refs -- preserved legacy minigame state model */
// anti oop lol
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";
import s from "./wanted.module.css";
import {
  FIELD_W, FIELD_H, TITLE_BAR_H,
  SPRITE_W, SPRITE_H,
  PENALTY_S, REVEAL_MS,
  DECOY_TYPES, DECOY_REPEAT_MIN, DECOY_REPEAT_MAX,
  MIN_SPEED, MAX_SPEED,
  MAX_ROUNDS, RESULT_DELAY_MS,
  SCALE, lerpScale,
  BIG_TARGET_SPEED,
} from "./engine/constants";
import { SPRITES, type SpriteInfo } from "./engine/sprites";
import { rollGimmick, type GimmickDef, type GimmickType } from "./engine/gimmicks";

const DEV_MODE = process.env.NODE_ENV === "development";

/* ── Types ─────────────────────────────────────────────────────── */
type RoundState = "idle" | "introReveal" | "playing" | "won" | "lost";

interface FieldSprite {
  uid: string;
  sprite: SpriteInfo;
  isTarget: boolean;
  x: number;
  y: number;
  vx: number;            // px/s
  vy: number;
  alive: boolean;
}

/* ── Helpers ───────────────────────────────────────────────────── */
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PLAYFIELD_H = FIELD_H - TITLE_BAR_H;
const SPAWN_PAD = 16; // keep sprites away from edges at spawn
const MAX_X = FIELD_W - SPRITE_W - SPAWN_PAD;
const MAX_Y = PLAYFIELD_H - SPRITE_H - SPAWN_PAD;

/** Pick a random target, avoiding the previous one */
function pickTarget(prev: SpriteInfo | null): SpriteInfo {
  const pool = prev ? SPRITES.filter((sp) => sp.id !== prev.id) : SPRITES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Pick 3 random decoy types, excluding the target */
function pickDecoyTypes(target: SpriteInfo): SpriteInfo[] {
  const pool = shuffle(SPRITES.filter((sp) => sp.id !== target.id));
  return pool.slice(0, DECOY_TYPES);
}

/** Assign a random velocity with guaranteed minimum axis components */
function randomVelocity(minSpd: number, maxSpd: number): { vx: number; vy: number } {
  const speed = randFloat(minSpd, maxSpd);
  const angle = randFloat(0.3, Math.PI / 2 - 0.3) + (Math.floor(Math.random() * 4)) * (Math.PI / 2);
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

/** Build the full field: 1 target + scattered decoys, scaled by round */
function buildField(target: SpriteInfo, round: number): FieldSprite[] {
  const decoyTypes = pickDecoyTypes(target);
  const sprites: FieldSprite[] = [];
  let uid = 0;

  const decoyMul = lerpScale(SCALE.decoyMultiplier, round);
  const speedMul = lerpScale(SCALE.speedMultiplier, round);
  const minSpd = MIN_SPEED * speedMul;
  const maxSpd = MAX_SPEED * speedMul;

  const makeSprite = (sp: SpriteInfo, isTarget: boolean): FieldSprite => {
    const { vx, vy } = randomVelocity(
      isTarget ? minSpd : minSpd * 0.8,
      isTarget ? maxSpd * 0.85 : maxSpd,
    );
    return {
      uid: `s${uid++}`,
      sprite: sp,
      isTarget,
      x: SPAWN_PAD + Math.random() * (MAX_X - SPAWN_PAD),
      y: SPAWN_PAD + Math.random() * (MAX_Y - SPAWN_PAD),
      vx,
      vy,
      alive: true,
    };
  };

  // Target
  sprites.push(makeSprite(target, true));

  // Decoys — each type repeated, scaled by round
  for (const decoy of decoyTypes) {
    const base = randInt(DECOY_REPEAT_MIN, DECOY_REPEAT_MAX);
    const count = Math.max(5, Math.round(base * decoyMul));
    for (let i = 0; i < count; i++) {
      sprites.push(makeSprite(decoy, false));
    }
  }

  return shuffle(sprites);
}

/** Build a gimmick field: decoys only, target injected specially */
function buildGimmickField(target: SpriteInfo, round: number, gimmick: GimmickDef): FieldSprite[] {
  const sprites: FieldSprite[] = [];
  let uid = 0;
  const speedMul = lerpScale(SCALE.speedMultiplier, round);
  const decoyMul = lerpScale(SCALE.decoyMultiplier, round);
  const minSpd = MIN_SPEED * speedMul;
  const maxSpd = MAX_SPEED * speedMul;

  // Decoys (if this gimmick has them)
  if (gimmick.hasDecoys) {
    const decoyTypes = pickDecoyTypes(target);
    for (const decoy of decoyTypes) {
      const base = randInt(DECOY_REPEAT_MIN, DECOY_REPEAT_MAX);
      const count = Math.max(5, Math.round(base * decoyMul));
      for (let i = 0; i < count; i++) {
        const { vx, vy } = randomVelocity(minSpd * 0.8, maxSpd);
        sprites.push({
          uid: `s${uid++}`, sprite: decoy, isTarget: false,
          x: SPAWN_PAD + Math.random() * (MAX_X - SPAWN_PAD),
          y: SPAWN_PAD + Math.random() * (MAX_Y - SPAWN_PAD),
          vx, vy, alive: true,
        });
      }
    }
  }

  // Target placement depends on gimmick type
  if (gimmick.targetVisibleAtStart) {
    if (gimmick.type === "corner") {
      const corners = [
        { x: 4, y: 4 },
        { x: FIELD_W - SPRITE_W - 4, y: 4 },
        { x: 4, y: PLAYFIELD_H - SPRITE_H - 4 },
        { x: FIELD_W - SPRITE_W - 4, y: PLAYFIELD_H - SPRITE_H - 4 },
      ];
      const c = corners[Math.floor(Math.random() * corners.length)];
      sprites.push({
        uid: `s${uid++}`, sprite: target, isTarget: true,
        x: c.x, y: c.y, vx: 0, vy: 0, alive: true,
      });
    } else if (gimmick.type === "rabbit") {
      sprites.push({
        uid: `s${uid++}`, sprite: target, isTarget: true,
        x: FIELD_W / 2 - SPRITE_W / 2,
        y: PLAYFIELD_H - SPRITE_H - 8,
        vx: randFloat(80, 140) * (Math.random() > 0.5 ? 1 : -1),
        vy: -randFloat(200, 300),
        alive: true,
      });
    } else if (gimmick.type === "outOfBounds") {
      // Random edge: 0=left, 1=top, 2=right, 3=bottom
      const edge = Math.floor(Math.random() * 4);
      const margin = -SPRITE_W / 2;
      let sx: number, sy: number, svx: number, svy: number;
      if (edge === 0) {        // left edge, moving up
        sx = margin; sy = Math.random() * PLAYFIELD_H; svx = 0; svy = -60;
      } else if (edge === 1) { // top edge, moving right
        sx = Math.random() * FIELD_W; sy = margin; svx = 60; svy = 0;
      } else if (edge === 2) { // right edge, moving down
        sx = FIELD_W - SPRITE_W / 2; sy = Math.random() * PLAYFIELD_H; svx = 0; svy = 60;
      } else {                 // bottom edge, moving left
        sx = Math.random() * FIELD_W; sy = PLAYFIELD_H - SPRITE_H / 2; svx = -60; svy = 0;
      }
      sprites.push({
        uid: `s${uid++}`, sprite: target, isTarget: true,
        x: sx, y: sy, vx: svx, vy: svy,
        alive: true,
      });
    }
  }

  return shuffle(sprites);
}

/* ── Component ─────────────────────────────────────────────────── */
export default function WantedPage() {
  const router = useRouter();

  const [roundState, setRoundState] = useState<RoundState>("idle");
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState<SpriteInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState(25);
  const [field, setField] = useState<FieldSprite[]>([]);
  const [gimmick, setGimmick] = useState<GimmickDef | null>(null);
  const [gimmickText, setGimmickText] = useState<string | null>(null);
  const [bigTargetX, setBigTargetX] = useState(-PLAYFIELD_H);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [gimmickCallout, setGimmickCallout] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [started, setStarted] = useState(false);
  const [decoysReady, setDecoysReady] = useState(false);

  const prevTarget = useRef<SpriteInfo | null>(null);
  const inputLocked = useRef(false);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const fieldRef = useRef<FieldSprite[]>([]);
  const roundStateRef = useRef<RoundState>("idle");
  const timeLeftRef = useRef(25);
  const gimmickTriggered = useRef(false);
  const usedGimmicks = useRef<Set<GimmickType>>(new Set());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const clockRef = useRef<HTMLAudioElement | null>(null);
  const correctRef = useRef<HTMLAudioElement | null>(null);
  const wrongRef = useRef<HTMLAudioElement | null>(null);
  const cheerRef = useRef<HTMLAudioElement | null>(null);
  const musicStarted = useRef(false);
  const decoyLoadCount = useRef(0);

  useEffect(() => { roundStateRef.current = roundState; }, [roundState]);
  useEffect(() => { fieldRef.current = field; }, [field]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  /* ── Audio setup (Web Audio API for gapless music loop) ─────── */
  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    gain.connect(ctx.destination);
    audioCtxRef.current = ctx;
    musicGainRef.current = gain;

    /* Helper: start the loop source once context is running + buffer decoded */
    const tryStartMusic = () => {
      if (musicStarted.current || ctx.state !== "running" || !musicBufferRef.current) return;
      musicStarted.current = true;
      const src = ctx.createBufferSource();
      src.buffer = musicBufferRef.current;
      src.loop = true;
      src.connect(gain);
      src.start(0);
      musicSourceRef.current = src;
    };

    /* When context transitions to "running" (after user gesture resume), try starting */
    ctx.addEventListener("statechange", tryStartMusic);

    fetch("/wanted-sounds/loop.mp3")
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        musicBufferRef.current = decoded;
        tryStartMusic(); // start immediately if context is already running
      })
      .catch(() => {});

    clockRef.current = new Audio("/wanted-sounds/clock.wav");
    correctRef.current = new Audio("/wanted-sounds/correct.wav");
    wrongRef.current = new Audio("/wanted-sounds/wrong.wav");
    cheerRef.current = new Audio("/wanted-sounds/cheer.mp3");
    clockRef.current.volume = 0.5;
    correctRef.current.volume = 0.5;
    wrongRef.current.volume = 0.5;
    cheerRef.current.volume = 0.5;
    return () => { ctx.close(); };
  }, []);

  /* Resume the AudioContext on any user gesture — music auto-starts via statechange */
  const ensureMusic = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
  }, []);

  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (musicGainRef.current) musicGainRef.current.gain.value = v;
    if (clockRef.current) clockRef.current.volume = v;
    if (correctRef.current) correctRef.current.volume = v;
    if (wrongRef.current) wrongRef.current.volume = v;
    if (cheerRef.current) cheerRef.current.volume = v;
  }, []);

  /* ── Start a new round ───────────────────────────────────────── */
  const startRound = useCallback((roundNum: number) => {
    const newTarget = pickTarget(prevTarget.current);
    prevTarget.current = newTarget;
    const gim = rollGimmick(roundNum, usedGimmicks.current);
    if (gim) usedGimmicks.current.add(gim.type);
    setGimmick(gim);
    setGimmickCallout(gim ? gim.label : null);
    setTarget(newTarget);
    setRound(roundNum);
    setTimeLeft(Math.round(lerpScale(SCALE.timerSeconds, roundNum)));
    setField([]);
    setGimmickText(null);
    setBigTargetX(-PLAYFIELD_H);
    setWrongFlash(false);
    setDecoysReady(false);
    decoyLoadCount.current = 0;
    gimmickTriggered.current = false;
    inputLocked.current = true;
    setRoundState("introReveal");
  }, []);

  const restartGame = useCallback(() => {
    ensureMusic();
    setScore(0);
    setGameOver(false);
    setGimmickCallout(null);
    usedGimmicks.current.clear();
    startRound(1);
  }, [startRound, ensureMusic]);

  const handleStartGame = useCallback(() => {
    if (started) return;
    ensureMusic();
    setStarted(true);
    startRound(1);
  }, [started, ensureMusic, startRound]);

  useEffect(() => {
    if (started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        handleStartGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, handleStartGame]);

  /* ── Intro reveal → playing ──────────────────────────────────── */
  useEffect(() => {
    if (roundState !== "introReveal" || !target) return;
    const timer = setTimeout(() => {
      setGimmickCallout(null);
      let newField: FieldSprite[];
      if (gimmick) {
        newField = buildGimmickField(target, round, gimmick);
        if (gimmick.type === "waitForIt") {
          setGimmickText("wait for it...");
          inputLocked.current = true;
        } else {
          inputLocked.current = false;
        }
      } else {
        newField = buildField(target, round);
        inputLocked.current = false;
      }
      setField(newField);
      fieldRef.current = newField;
      if (newField.filter(sp => !sp.isTarget).length === 0) setDecoysReady(true);
      lastFrameRef.current = performance.now();
      setRoundState("playing");
    }, REVEAL_MS);
    return () => clearTimeout(timer);
  }, [roundState, target, round, gimmick]);

  /* ── Loss helper: reveal where the target was ────────────────── */
  const triggerLoss = useCallback(() => {
    inputLocked.current = true;
    setField((prev) => {
      const next = prev.map((sp) =>
        sp.isTarget ? sp : { ...sp, alive: false }
      );
      fieldRef.current = next;
      return next;
    });
    setRoundState("lost");
  }, []);

  /* ── Countdown timer ─────────────────────────────────────────── */
  useEffect(() => {
    if (roundState !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          triggerLoss();
          return 0;
        }
        if (next >= 1 && next <= 3) playSound(clockRef.current);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundState, triggerLoss]);

  /* ── Gimmick triggers (timed events during playing) ──────────── */
  useEffect(() => {
    if (roundState !== "playing" || !gimmick || !target) return;

    const checkGimmickTriggers = () => {
      if (gimmickTriggered.current) return;
      const t = timeLeftRef.current;

      if (gimmick.type === "waitForIt" && t <= 2) {
        gimmickTriggered.current = true;
        setGimmickText(null);
        const sp: FieldSprite = {
          uid: "gimmick-target",
          sprite: target,
          isTarget: true,
          x: SPAWN_PAD + Math.random() * (MAX_X - SPAWN_PAD),
          y: SPAWN_PAD + Math.random() * (MAX_Y - SPAWN_PAD),
          vx: 0, vy: 0,
          alive: true,
        };
        setField((prev) => {
          const next = [...prev, sp];
          fieldRef.current = next;
          return next;
        });
        inputLocked.current = false;
      }

      if (gimmick.type === "bigTarget" && t <= 15) {
        gimmickTriggered.current = true;
        setBigTargetX(-PLAYFIELD_H);
      }
    };

    const interval = setInterval(checkGimmickTriggers, 200);
    return () => clearInterval(interval);
  }, [roundState, gimmick, target]);

  /* ── Round progression / endgame ───────────────────────────────── */
  useEffect(() => {
    if (roundState === "lost") {
      const timer = setTimeout(() => setGameOver(true), RESULT_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (roundState !== "won") return;
    if (round >= MAX_ROUNDS) {
      const timer = setTimeout(() => {
        playSound(cheerRef.current);
        setGameOver(true);
      }, RESULT_DELAY_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => startRound(round + 1), RESULT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [roundState, round, startRound]);

  /* ── Movement loop ───────────────────────────────────────────── */
  useEffect(() => {
    if (roundState !== "playing") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      if (roundStateRef.current !== "playing") return;
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;

      const currentGimmick = gimmick?.type;

      setField((prev) => {
        const next = prev.map((sp) => {
          if (!sp.alive) return sp;
          let { x, y, vx, vy } = sp;

          // Rabbit gimmick: target hops with gravity
          if (sp.isTarget && currentGimmick === "rabbit") {
            vy += 600 * dt;
            x += vx * dt;
            y += vy * dt;
            if (y >= PLAYFIELD_H - SPRITE_H) {
              y = PLAYFIELD_H - SPRITE_H;
              vy = -randFloat(200, 300);
            }
            if (x <= 0) { x = 0; vx = Math.abs(vx); }
            else if (x >= FIELD_W - SPRITE_W) { x = FIELD_W - SPRITE_W; vx = -Math.abs(vx); }
            return { ...sp, x, y, vx, vy };
          }

          // Out-of-bounds gimmick: target moves along the border perimeter
          if (sp.isTarget && currentGimmick === "outOfBounds") {
            x += vx * dt;
            y += vy * dt;
            const margin = -SPRITE_W / 2;
            const rightEdge = FIELD_W - SPRITE_W / 2;
            const bottomEdge = PLAYFIELD_H - SPRITE_H / 2;
            if (x <= margin && vy < 0) {
              if (y <= margin) { vy = 0; vx = 60; }
            } else if (y <= margin && vx > 0) {
              if (x >= rightEdge) { vx = 0; vy = 60; }
            } else if (x >= rightEdge && vy > 0) {
              if (y >= bottomEdge) { vy = 0; vx = -60; }
            } else if (y >= bottomEdge && vx < 0) {
              if (x <= margin) { vx = 0; vy = -60; }
            }
            return { ...sp, x, y, vx, vy };
          }

          // Corner gimmick: target stays still
          if (sp.isTarget && currentGimmick === "corner") {
            return sp;
          }

          // Normal movement
          x += vx * dt;
          y += vy * dt;
          if (x <= 0) { x = 0; vx = Math.abs(vx); }
          else if (x >= FIELD_W - SPRITE_W) { x = FIELD_W - SPRITE_W; vx = -Math.abs(vx); }
          if (y <= 0) { y = 0; vy = Math.abs(vy); }
          else if (y >= PLAYFIELD_H - SPRITE_H) { y = PLAYFIELD_H - SPRITE_H; vy = -Math.abs(vy); }
          return { ...sp, x, y, vx, vy };
        });
        fieldRef.current = next;
        return next;
      });

      // Big target scroll animation
      if (currentGimmick === "bigTarget" && gimmickTriggered.current) {
        setBigTargetX((prev) => prev + BIG_TARGET_SPEED * dt);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [roundState, gimmick]);

  /* ── Click handlers ──────────────────────────────────────────── */
  const handleSpriteClick = useCallback((uid: string) => {
    if (inputLocked.current) return;
    const sprite = fieldRef.current.find((sp) => sp.uid === uid);
    if (!sprite || !sprite.alive) return;

    if (sprite.isTarget) {
      inputLocked.current = true;
      ensureMusic();
      playSound(correctRef.current);
      setScore((prev) => prev + 1);
      setField((prev) => prev.map((sp) =>
        sp.uid === uid ? sp : { ...sp, alive: false }
      ));
      setRoundState("won");
    } else {
      ensureMusic();
      playSound(wrongRef.current);
      // Wrong click flash
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 200);
      setField((prev) => {
        const next = prev.map((sp) =>
          sp.uid === uid ? { ...sp, alive: false } : sp
        );
        fieldRef.current = next;
        return next;
      });
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - PENALTY_S);
        if (next <= 0) {
          triggerLoss();
        }
        return next;
      });
    }
  }, []);

  const handleDecoyLoad = useCallback(() => {
    decoyLoadCount.current += 1;
    const total = fieldRef.current.filter(sp => !sp.isTarget).length;
    if (total > 0 && decoyLoadCount.current >= total) {
      setDecoysReady(true);
    }
  }, []);

  const handleBigTargetClick = useCallback(() => {
    if (inputLocked.current) return;
    inputLocked.current = true;
    ensureMusic();
    playSound(correctRef.current);
    setScore((prev) => prev + 1);
    setField((prev) => prev.map((sp) => ({ ...sp, alive: false })));
    setRoundState("won");
  }, []);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <main className={s.wrapper}>
      <div className={s.backLabel} onClick={() => router.push(portfolioV2Path())}>
        &lt;-- Back to home
      </div>

      <div className={s.volumeMeter}>
        <span className={s.volumeIcon}>♫</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className={s.volumeSlider}
          aria-label="Volume"
        />
      </div>

      <div
        className={s.gameWindow}
        style={{ width: FIELD_W, height: FIELD_H }}
        onClick={started ? ensureMusic : undefined}
      >
        {!started && (
          <div className={s.startOverlay}>
            <div className={s.startTitle}>Wanted!</div>
            <button className={s.startBtn} onClick={handleStartGame}>
              Start
            </button>
          </div>
        )}

        {started && (
          <div className={`${s.timer} ${timeLeft <= 5 ? s.timerUrgent : ""}`}>
            {timeLeft}s
          </div>
        )}

        <div className={s.playfield}>
          {/* ── Wrong-click flash ─────────────────────────────── */}
          {wrongFlash && <div className={s.wrongFlash} />}

          {/* ── Intro reveal overlay ──────────────────────────── */}
          {roundState === "introReveal" && target && (
            <div className={s.revealOverlay}>
              <div className={s.revealLabel}>Find the</div>
              <Image
                src={target.src}
                alt={target.name}
                width={SPRITE_W * 2}
                height={SPRITE_H * 2}
                className={s.revealSprite}
                draggable={false}
                priority
              />
              <div className={s.revealName}>{target.name}</div>
            </div>
          )}

          {/* ── Game-over overlay ─────────────────────────────── */}
          {gameOver && (
            <div className={s.gameOverOverlay}>
              <div className={s.gameOverTitle}>
                {score >= MAX_ROUNDS ? "You win!" : "Game Over"}
              </div>
              <div className={s.gameOverScore}>
                Score: {score} / {MAX_ROUNDS}
              </div>
              <br />
              <button className={s.playAgainBtn} onClick={restartGame}>
                Play Again
              </button>
            </div>
          )}

          {/* ── Won overlay ───────────────────────────────────── */}
          {roundState === "won" && !gameOver && target && (
            <div className={s.resultOverlay}>
              <div className={s.resultText}>Correct!</div>
            </div>
          )}

          {/* ── Lost overlay ──────────────────────────────────── */}
          {roundState === "lost" && !gameOver && (
            <div className={s.resultOverlay}>
              <div className={s.resultTextBad}>Too bad!</div>
            </div>
          )}

          {/* ── Gimmick: "wait for it..." text ────────────────── */}
          {gimmickText && roundState === "playing" && (
            <div className={s.gimmickTextOverlay}>
              <span className={s.gimmickText}>{gimmickText}</span>
            </div>
          )}

          {/* ── Gimmick: Big Target sprite (behind normal sprites) ── */}
          {gimmick?.type === "bigTarget" && gimmickTriggered.current && target &&
            roundState === "playing" && (
              <div
                className={s.bigTarget}
                style={{
                  left: bigTargetX,
                  width: PLAYFIELD_H,
                  height: PLAYFIELD_H,
                }}
                onClick={handleBigTargetClick}
              >
                <Image
                  src={target.src}
                  alt={target.name}
                  width={PLAYFIELD_H}
                  height={PLAYFIELD_H}
                  className={s.bigTargetImg}
                  draggable={false}
                />
              </div>
            )}

          {/* ── Sprites ───────────────────────────────────────── */}
          {(roundState === "playing" || roundState === "won" || roundState === "lost") &&
            field.filter((sp) => sp.alive).map((sp) => (
              <Image
                key={sp.uid}
                src={sp.sprite.src}
                alt={sp.sprite.name}
                width={SPRITE_W}
                height={SPRITE_H}
                className={`${s.sprite} ${sp.isTarget ? (decoysReady ? s.targetVisible : s.targetHidden) : ""}`}
                style={{ left: sp.x, top: sp.y }}
                draggable={false}
                onClick={() => handleSpriteClick(sp.uid)}
                onLoad={sp.isTarget ? undefined : handleDecoyLoad}
              />
            ))}
        </div>
      </div>

      {started && <div className={s.roundLabel}>Round {round}</div>}

      {DEV_MODE && (
        <div className={s.debug}>
          state: {roundState} | round: {round} | target: {target?.id ?? "–"} | alive: {field.filter(sp => sp.alive).length} | gimmick: {gimmick?.label ?? "none"}
        </div>
      )}
    </main>
  );
}
