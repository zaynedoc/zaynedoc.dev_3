"use client";
/* eslint-disable react-hooks/refs, @next/next/no-html-link-for-pages -- preserved legacy game controls */

import { useState, useEffect, useRef } from "react";
import s from "./limbo.module.css";
import { AuroraBackground } from "@/app/archive/portfolio-v2/_legacy/archive/components/ui/aurora-background";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";

/* ================================================================
   Limbo Key Shuffle — Recreation of the iconic Geometry Dash
   "Limbo" key section. 8 keys shuffle in sync, ease into orbit.
   ================================================================ */

/* ---- Shuffle permutation table (from the original Godot project) ---- */
const STEP_MAP: number[][] = [
  [2, 4, 1, 3, 6, 8, 5, 7], //  0
  [2, 4, 1, 3, 7, 5, 8, 6], //  1
  [3, 1, 4, 2, 6, 8, 5, 7], //  2
  [3, 1, 4, 2, 7, 5, 8, 6], //  3
  [2, 4, 1, 6, 3, 8, 5, 7], //  4
  [3, 1, 5, 2, 7, 4, 8, 6], //  5
  [2, 1, 4, 3, 6, 5, 8, 7], //  6
  [4, 3, 2, 1, 8, 7, 6, 5], //  7
  [3, 4, 5, 6, 7, 8, 2, 1], //  8
  [8, 7, 1, 2, 3, 4, 5, 6], //  9
  [1, 3, 2, 5, 4, 7, 8, 6], // 10
  [1, 3, 2, 5, 4, 8, 6, 7], // 11
  [4, 2, 6, 1, 7, 3, 8, 5], // 12
  [4, 2, 6, 1, 8, 3, 5, 7], // 13
  [2, 4, 6, 1, 8, 3, 7, 5], // 14
  [4, 1, 6, 2, 8, 3, 7, 5], // 15
  [2, 3, 1, 5, 4, 7, 6, 8], // 16
  [3, 1, 2, 5, 4, 7, 6, 8], // 17
  [5, 6, 7, 8, 1, 2, 3, 4], // 18
  [8, 7, 6, 5, 4, 3, 2, 1], // 19
  [1, 2, 3, 4, 5, 6, 7, 8], // 20
];

/* Hue‑rotate offsets from the default orange key image (~30° hue) */
const KEY_HUES = [
  -30,  // → red
  275,  // → pink
  252,  // → purple
  210,  // → blue
  150,  // → cyan
  87,   // → green
  30,   // → yellow
  0,    // → orange (unchanged)
];

const EXCLUDED_RANDOM = new Set([8, 9, 18, 19, 20]);

function getRandomPattern(): number {
  let p = -1;
  while (p === -1 || EXCLUDED_RANDOM.has(p)) {
    p = Math.floor(Math.random() * STEP_MAP.length);
  }
  return p;
}

/* Build the 26‑step shuffle schedule */
function buildSchedule() {
  const steps: { pattern: number; delay: number; speed: number }[] = [];
  for (let i = 1; i <= 26; i++) {
    if (i === 6) steps.push({ pattern: 18, delay: 0.08, speed: 0.5 });
    else if (i === 10) steps.push({ pattern: 8, delay: 0.08, speed: 0.5 });
    else if (i === 19) steps.push({ pattern: 9, delay: 0.08, speed: 0.5 });
    else if (i === 26) steps.push({ pattern: 20, delay: 0.04, speed: 0.1 });
    else steps.push({ pattern: getRandomPattern(), delay: 0.04, speed: 0.3 });
  }
  return steps;
}

/* 2‑column × 4‑row grid, centred */
function computeSlotPositions(
  cw: number, ch: number, ks: number, m: number,
): { x: number; y: number }[] {
  const cols = 2, rows = 4;
  const totalW = cols * ks + (cols - 1) * m;
  const totalH = rows * ks + (rows - 1) * m * 1.5;
  const sx = (cw - totalW) / 2;
  const sy = (ch - totalH) / 2;
  const pos: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pos.push({ x: sx + c * (ks + m), y: sy + r * (ks + m * 1.5) });
  return pos;
}

/* Orbit layout at a given angle */
function computeOrbitPositions(
  cw: number, ch: number, ks: number, baseAngle: number,
): { x: number; y: number }[] {
  const cx = cw / 2 - ks / 2;
  const cy = ch / 2 - ks / 2;
  const rx = Math.min(cw, ch) * 0.32;
  const ry = rx * 0.65;
  return Array.from({ length: 8 }, (_, i) => {
    const a = baseAngle + (i * Math.PI * 2) / 8;
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  });
}

/* RAF‑based volume fade — returns a cancel function */
function fadeVolume(audio: HTMLAudioElement, target: number, dur: number, onCancel?: { current: (() => void) | null }) {
  const start = audio.volume;
  const diff = target - start;
  if (Math.abs(diff) < 0.005) {
    try { audio.volume = target; } catch { /* noop */ }
    return;
  }
  let cancelled = false;
  if (onCancel) onCancel.current = () => { cancelled = true; };
  const t0 = performance.now();
  const ms = dur * 1000;
  function step() {
    if (cancelled || !audio.src) return;
    const t = Math.min(1, (performance.now() - t0) / ms);
    try { audio.volume = Math.max(0, Math.min(1, start + diff * t)); } catch { return; }
    if (t < 1) requestAnimationFrame(step);
    else if (onCancel) onCancel.current = null;
  }
  requestAnimationFrame(step);
}

/* ======== Timing constants ======== */
const MUSIC_SHUFFLE_SEC = 179.6;
const PRE_SHUFFLE_SEC   = 3.1;
const LEAD_SEC          = 1;
const FADE_IN_SEC       = 4;

/* ================================================================ */
export default function LimboPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const slotsRef     = useRef<{ x: number; y: number }[]>([]);
  const cancelFade   = useRef<(() => void) | null>(null);

  const [ready, setReady]                     = useState(false);
  const [started, setStarted]                 = useState(false);
  const [phase, setPhase]                     = useState<
    "waiting" | "loading" | "appearing" | "shuffling" | "transitioning" | "orbiting" | "done"
  >("waiting");
  const [visibleKeys, setVisibleKeys]         = useState(0);
  const [correctKey, setCorrectKey]           = useState(0);
  const [keyPositions, setKeyPositions]       = useState<{ x: number; y: number }[]>([]);
  const [keyRotations, setKeyRotations]       = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [keyHues, setKeyHues]                 = useState<(number | null)[]>(Array(8).fill(null));
  const [transitionSpeed, setTransitionSpeed] = useState(0.3);
  const [flashGreen, setFlashGreen]           = useState<number | null>(null);
  const [result, setResult]                   = useState<"correct" | "wrong" | null>(null);
  const [clickedKey, setClickedKey]           = useState<number | null>(null);
  const [orbitAngle, setOrbitAngle]           = useState(0);
  const [auroraVariant, setAuroraVariant]     = useState<"warm" | "cool" | "hidden">("hidden");
  const [volume, setVolume]                     = useState(0.7);

  const keySize  = 100;
  const marginPx = 40;

  /* ---- Compute grid on mount ---- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const slots = computeSlotPositions(r.width, r.height, keySize, marginPx);
    slotsRef.current = slots;
    setKeyPositions(slots);
    setReady(true);
  }, []);

  /* ---- Start handler (user gesture unlocks audio) ---- */
  const handleStart = () => {
    if (started) return;
    setStarted(true);
    setPhase("loading");
    setAuroraVariant("warm");
  };

  /* ---- Main choreography ---- */
  useEffect(() => {
    if (!ready || !started) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    (async () => {
      /* ---- Music (inside user‑gesture chain) ---- */
      const audio = new Audio(
        "/music/Nighthawk22%20-%20Isolation%20(Official%20LIMBO%20Remix).mp3",
      );
      audio.currentTime = MUSIC_SHUFFLE_SEC - PRE_SHUFFLE_SEC - LEAD_SEC;
      audio.volume = 0;
      audioRef.current = audio;
      try { await audio.play(); } catch { /* fallback */ }
      fadeVolume(audio, 0.7, FADE_IN_SEC, cancelFade);

      /* sync initial volume with slider */
      audio.volume = 0;  // fadeVolume handles ramp from 0

      /* atmospheric lead‑in (dark screen, music fading in) */
      await wait(LEAD_SEC * 1000);
      if (cancelled) return;

      /* ---- Phase 1 · Appearing ---- */
      setPhase("appearing");
      for (let i = 1; i <= 8; i++) {
        if (cancelled) return;
        setVisibleKeys(i);
        await wait(200);
      }
      await wait(1200);
      if (cancelled) return;

      /* flash the correct key green */
      const correct = Math.floor(Math.random() * 8);
      setCorrectKey(correct);
      setFlashGreen(correct);
      await wait(800);
      if (cancelled) return;
      setFlashGreen(null);
      await wait(1000);
      if (cancelled) return;

      /* ---- Phase 2 · Shuffling ---- */
      setPhase("shuffling");
      const schedule = buildSchedule();
      const orders = [1, 2, 3, 4, 5, 6, 7, 8];
      const slots = slotsRef.current;

      for (let si = 0; si < schedule.length; si++) {
        if (cancelled) return;
        const { pattern, delay, speed } = schedule[si];
        const perm = STEP_MAP[pattern];
        const newOrders = orders.map(o => perm[o - 1]);

        /* smooth 180° rotation at steps 10 & 19 */
        if (si + 1 === 10 || si + 1 === 19) {
          setKeyRotations(prev => prev.map(r => r + 180));
        }

        setTransitionSpeed(speed);
        setKeyPositions(newOrders.map(o => slots[o - 1]));
        for (let i = 0; i < 8; i++) orders[i] = newOrders[i];
        await wait((speed + delay) * 1000);
      }
      if (cancelled) return;

      /* ---- Phase 3 · Overlapping cascade into orbit ---- */
      setPhase("transitioning");
      const rect = containerRef.current!.getBoundingClientRect();
      const orbitPos = computeOrbitPositions(rect.width, rect.height, keySize, 0);
      const PER_KEY_DUR = 0.25;   // each key's flight time (seconds)
      const STAGGER     = 125;    // ms between launches (≈ half of flight)
      setTransitionSpeed(PER_KEY_DUR);

      for (let i = 0; i < 8; i++) {
        if (cancelled) return;
        /* launch key i — assign hue + 360° spin + move to orbit spot */
        setKeyHues(prev => { const n = [...prev]; n[i] = KEY_HUES[i]; return n; });
        setKeyRotations(prev => { const n = [...prev]; n[i] += 360; return n; });
        setKeyPositions(prev => { const n = [...prev]; n[i] = orbitPos[i]; return n; });
        /* next key fires when this one is ~halfway there */
        if (i < 7) await wait(STAGGER);
      }

      /* wait for the last key to finish its flight */
      await wait(PER_KEY_DUR * 1000);
      if (cancelled) return;

      setPhase("orbiting");
      setAuroraVariant("cool");
      fadeVolume(audio, 0, 6, cancelFade);
    })();

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, started]);

  /* ---- Orbit RAF ---- */
  useEffect(() => {
    if (phase !== "orbiting" && phase !== "done") return;
    let raf: number;
    let angle = 0;
    let last = performance.now();
    const tick = (now: number) => {
      angle += ((now - last) / 1000) * 0.6;
      last = now;
      setOrbitAngle(angle);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /* orbit position helper */
  const getOrbitPos = (idx: number, base: number) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const cx = r.width  / 2 - keySize / 2;
    const cy = r.height / 2 - keySize / 2;
    const a  = base + (idx * Math.PI * 2) / 8;
    const rx = Math.min(r.width, r.height) * 0.32;
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * rx * 0.65 };
  };

  /* click */
  const handleClick = (idx: number) => {
    if (phase !== "orbiting" || result) return;
    setClickedKey(idx);
    setResult(idx === correctKey ? "correct" : "wrong");
    setPhase("done");
    setAuroraVariant("hidden");
    if (audioRef.current) fadeVolume(audioRef.current, 0, 2, cancelFade);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cancelFade.current) { cancelFade.current(); cancelFade.current = null; }
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  /* ================ JSX ================ */
  const easing = "cubic-bezier(0.76, 0, 0.24, 1)";

  return (
    <AuroraBackground variant={auroraVariant} className={s.page}>
      <div className={s.container} ref={containerRef}>
        {Array.from({ length: 8 }, (_, i) => {
          const visible  = i < visibleKeys;
          const orbiting = phase === "orbiting" || phase === "done";
          const pos      = orbiting
            ? getOrbitPos(i, orbitAngle)
            : (keyPositions[i] ?? { x: 0, y: 0 });
          const hue      = keyHues[i];
          const flashing = flashGreen === i;
          const clicked  = clickedKey === i;
          const spd      = orbiting ? 0 : transitionSpeed;

          /* image filter */
          let filter: string | undefined;
          if (flashing) {
            filter =
              "hue-rotate(90deg) brightness(1.4) drop-shadow(0 0 20px rgba(39,255,26,0.7))";
          } else if (hue !== null) {
            filter = `hue-rotate(${hue}deg) drop-shadow(0 0 12px rgba(255,255,255,0.25))`;
          }

          return (
            <div
              key={i}
              className={[
                s.key,
                visible  && s.keyVisible,
                orbiting && s.keyClickable,
                clicked  && s.keyClicked,
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left:   pos.x,
                top:    pos.y,
                width:  keySize,
                height: keySize,
                transition: orbiting
                  ? "none"
                  : [
                      `left ${spd}s ${easing}`,
                      `top ${spd}s ${easing}`,
                      `transform ${spd}s ${easing}`,
                      `opacity 0.3s ease`,
                    ].join(", "),
                transform: `rotate(${keyRotations[i]}deg)`,
              }}
              onClick={() => handleClick(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/key.png"
                alt="Key"
                className={s.keyImg}
                style={{ filter }}
                draggable={false}
              />
              {clicked && result && (
                <div
                  className={`${s.resultBadge} ${
                    result === "correct" ? s.resultCorrect : s.resultWrong
                  }`}
                >
                  {result === "correct" ? "✓" : "✕"}
                </div>
              )}
            </div>
          );
        })}

        {/* result overlay */}
        {result && (
          <div className={s.resultOverlay}>
            <div
              className={`${s.resultText} ${
                result === "correct" ? s.resultTextCorrect : s.resultTextWrong
              }`}
            >
              {result === "correct" ? "Correct Key!" : "Wrong Key!"}
            </div>
            <p className={s.resultSub}>
              {result === "correct"
                ? "You found the right one."
                : "That wasn't the one."}
            </p>
            <button
              className={s.retryBtn}
              onClick={() => {
                setAuroraVariant("warm");
                window.location.reload();
              }}
            >
              Try Again
            </button>
            <a href={portfolioV2Path()} className={s.homeLink}>
              ← back to home
            </a>
          </div>
        )}

        {phase === "orbiting" && !result && (
          <div className={s.instructions}>Pick the correct key</div>
        )}

        {/* Click to start overlay */}
        {phase === "waiting" && (
          <div className={s.startOverlay} onClick={handleStart}>
            <div className={s.startText}>Click to Start</div>
            <p className={s.startSub}>audio required</p>
          </div>
        )}
      </div>

      {/* Volume meter */}
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
    </AuroraBackground>
  );
}
