"use client";
/* eslint-disable react-hooks/set-state-in-effect -- preserved saved-volume initialization */

import { useRef, useCallback, useEffect, useState } from "react";

const BASE = "/smg-assets/mp3";
const FADE_MS = 800; // crossfade duration
const FADE_STEP = 20; // ms per tick

/**
 * Central audio manager for the SZG page.
 *
 * Phases:
 *  1. Intro: intro-reveal → intro-loop (infinite)
 *  2. Dismiss: glow SFX, intro-loop fades out
 *  3. Selection: selection.mp3 loops
 *  4. Detail: crossfade selection ↔ details (percussion overlay)
 */
export default function useSzgAudio() {
  const [volume, setVolumeState] = useState(0.5);
  const volumeRef = useRef(0.5);

  // Restore persisted volume on mount
  useEffect(() => {
    const stored = parseFloat(localStorage.getItem("szg-volume") ?? "");
    if (!isNaN(stored)) {
      volumeRef.current = stored;
      setVolumeState(stored);
    }
  }, []);

  // Audio element refs
  const introRevealRef = useRef<HTMLAudioElement | null>(null);
  const introLoopRef = useRef<HTMLAudioElement | null>(null);
  const glowRef = useRef<HTMLAudioElement | null>(null);
  const selectionRef = useRef<HTMLAudioElement | null>(null);
  const detailsRef = useRef<HTMLAudioElement | null>(null);

  // Fade interval refs
  const fadeIntervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  // Track current logical volumes (0-1) per track for fading
  const selVolRef = useRef(0);
  const detVolRef = useRef(0);

  /* ---- Helpers ---- */

  const clearFades = useCallback(() => {
    fadeIntervalsRef.current.forEach(clearInterval);
    fadeIntervalsRef.current = [];
  }, []);

  /** Lazily create an <audio> element. */
  const getAudio = useCallback(
    (
      ref: React.MutableRefObject<HTMLAudioElement | null>,
      src: string,
      loop = false,
    ) => {
      if (!ref.current) {
        ref.current = new Audio(src);
        ref.current.volume = 0;
      }
      ref.current.loop = loop;
      return ref.current;
    },
    [],
  );

  /** Fade an audio element's volume from current to target over FADE_MS. */
  const fade = useCallback(
    (
      audio: HTMLAudioElement,
      from: number,
      to: number,
      onDone?: () => void,
    ) => {
      const steps = FADE_MS / FADE_STEP;
      const delta = (to - from) / steps;
      let step = 0;
      const id = setInterval(() => {
        step++;
        const raw = from + delta * step;
        const clamped = Math.max(0, Math.min(1, raw));
        audio.volume = clamped * volumeRef.current;
        if (step >= steps) {
          clearInterval(id);
          audio.volume = Math.max(0, Math.min(1, to * volumeRef.current));
          onDone?.();
        }
      }, FADE_STEP);
      fadeIntervalsRef.current.push(id);
      return id;
    },
    [],
  );

  /* ---- Phase 1: Intro ---- */

  const startIntro = useCallback((): Promise<boolean> => {
    const reveal = getAudio(introRevealRef, `${BASE}/intro-reveal.mp3`);
    reveal.volume = volumeRef.current;
    reveal.currentTime = 0;

    const loop = getAudio(introLoopRef, `${BASE}/intro-loop.mp3`, true);

    reveal.onended = () => {
      loop.volume = volumeRef.current;
      loop.currentTime = 0;
      loop.play().catch(() => {});
    };

    const p = reveal.play();
    return p ? p.then(() => true).catch(() => false) : Promise.resolve(true);
  }, [getAudio]);

  /* ---- Phase 2: Dismiss (glow) ---- */

  const triggerDismiss = useCallback(() => {
    // Play glow SFX
    const glow = getAudio(glowRef, `${BASE}/glow.mp3`);
    glow.volume = volumeRef.current;
    glow.currentTime = 0;
    glow.play().catch(() => {});

    // Fade out intro-loop
    const loop = introLoopRef.current;
    if (loop && !loop.paused) {
      const startVol = loop.volume / volumeRef.current || 1;
      fade(loop, startVol, 0, () => {
        loop.pause();
      });
    }

    // Also stop intro-reveal if still playing
    const reveal = introRevealRef.current;
    if (reveal && !reveal.paused) {
      fade(reveal, reveal.volume / volumeRef.current || 1, 0, () => {
        reveal.pause();
      });
    }
  }, [getAudio, fade]);

  /* ---- Phase 3: Selection loop ---- */

  const startSelection = useCallback(() => {
    const sel = getAudio(selectionRef, `${BASE}/selection.mp3`, true);
    sel.currentTime = 0;
    sel.volume = volumeRef.current;
    selVolRef.current = 1;

    // Pre-load details in sync, but muted
    const det = getAudio(detailsRef, `${BASE}/details.mp3`, true);
    det.currentTime = 0;
    det.volume = 0;
    detVolRef.current = 0;

    sel.play().catch(() => {});
    det.play().catch(() => {});
  }, [getAudio]);

  /* ---- Phase 4: Detail crossfade ---- */

  const enterDetail = useCallback(() => {
    clearFades();
    const sel = selectionRef.current;
    const det = detailsRef.current;
    if (!sel || !det) return;

    // Crossfade: selection out, details in
    fade(sel, selVolRef.current, 0);
    selVolRef.current = 0;
    fade(det, detVolRef.current, 1);
    detVolRef.current = 1;
  }, [fade, clearFades]);

  const exitDetail = useCallback(() => {
    clearFades();
    const sel = selectionRef.current;
    const det = detailsRef.current;
    if (!sel || !det) return;

    // Crossfade: details out, selection in
    fade(det, detVolRef.current, 0);
    detVolRef.current = 0;
    fade(sel, selVolRef.current, 1);
    selVolRef.current = 1;
  }, [fade, clearFades]);

  /* ---- Master volume ---- */

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    localStorage.setItem("szg-volume", String(clamped));

    // Apply to all active audio elements
    [introRevealRef, introLoopRef, glowRef].forEach((ref) => {
      if (ref.current && !ref.current.paused) {
        ref.current.volume = clamped;
      }
    });
    if (selectionRef.current && !selectionRef.current.paused) {
      selectionRef.current.volume = selVolRef.current * clamped;
    }
    if (detailsRef.current && !detailsRef.current.paused) {
      detailsRef.current.volume = detVolRef.current * clamped;
    }
  }, []);

  /* ---- Cleanup on unmount ---- */

  useEffect(() => {
    return () => {
      clearFades();
      [introRevealRef, introLoopRef, glowRef, selectionRef, detailsRef].forEach(
        (ref) => {
          if (ref.current) {
            ref.current.pause();
            ref.current = null;
          }
        },
      );
    };
  }, [clearFades]);

  return {
    volume,
    setVolume,
    startIntro,
    triggerDismiss,
    startSelection,
    enterDetail,
    exitDetail,
  };
}
