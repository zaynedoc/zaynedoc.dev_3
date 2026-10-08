"use client";
/* eslint-disable react-hooks/purity, react-hooks/set-state-in-effect -- preserved randomized intro and saved preferences */

import { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import s from "./szg.module.css";
import useSzgAudio from "./useSzgAudio";

const OrbitSky = dynamic(() => import("./OrbitSky"), { ssr: false });
const Comet = dynamic(() => import("./Comet"), { ssr: false });
const FloatingCar = dynamic(() => import("./FloatingCar"), { ssr: false });

import SaveFileSelect from "./SaveFileSelect";

import LemniscateCamera from "./LemniscateCamera";

/** FNF-style randomized three-line gate texts — one set picked per refresh */
const GATE_TEXTS: [string, string][] = [
  ["Warning: this might be loud", "But it\u2019s really cool"],
  ["Welcome to the cosmos", "Buckle up, star pilot"],
  ["Stars are loading\u2026", "Almost ready to shine"],
  ["Don\u2019t blink", "You might miss a supernova"],
  ["Zero gravity detected", "Hold on to something"],
  ["Entering orbit", "Please remain seated"],
  ["No passport required", "Just good taste"],
  ["Loading star bits\u2026", "Almost there\u2026"],
];

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

export default function SZGPage() {
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);
  const [showSelect, setShowSelect] = useState(false);
  const [bubblePop, setBubblePop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoThumbnails, setVideoThumbnailsState] = useState(true);
  const handleReady = useCallback(() => setLoaded(true), []);

  // Pick a random gate text set once per mount
  const [gateLine1, gateLine2] = useMemo(
    () => GATE_TEXTS[Math.floor(Math.random() * GATE_TEXTS.length)],
    []
  );

  // Audio
  const audio = useSzgAudio();
  const [gateState, setGateState] = useState<'loading' | 'gate' | 'started'>('loading');

  // Restore persisted preferences
  useEffect(() => {
    const stored = localStorage.getItem("szg-video-thumbs");
    if (stored !== null) setVideoThumbnailsState(stored === "true");
  }, []);

  // Phase 1: try autoplay intro when scene loads; if blocked, show gate
  useEffect(() => {
    if (!loaded || gateState !== 'loading') return;
    audio.startIntro().then(ok => setGateState(ok ? 'started' : 'gate'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Show save-file select after dismiss animation finishes
  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => setShowSelect(true), 1100);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Buffer: allow dismiss only after intro animations finish (~2.5s)
  useEffect(() => {
    if (gateState !== 'started') return;
    const timer = setTimeout(() => setCanDismiss(true), 2500);
    return () => clearTimeout(timer);
  }, [gateState]);

  // Phase 3: start selection music when carousel appears
  useEffect(() => {
    if (!showSelect) return;
    audio.startSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSelect]);

  // Gate interaction: user clicks/presses key to begin (unlocks browser audio)
  const handleGateInteraction = useCallback(() => {
    if (gateState !== 'gate') return;
    audio.startIntro();
    setGateState('started');
  }, [gateState, audio]);

  useEffect(() => {
    if (gateState !== 'gate') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      handleGateInteraction();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gateState, handleGateInteraction]);

  // Dismiss handler (shared by spacebar and tap)
  const triggerDismiss = useCallback(() => {
    if (!canDismiss || dismissed) return;
    setBubblePop(true);
    setDismissed(true);
    audio.triggerDismiss(); // Phase 2: glow SFX + fade out intro
  }, [canDismiss, dismissed, audio]);

  // Dismiss intro on spacebar
  useEffect(() => {
    if (!canDismiss || dismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        triggerDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canDismiss, dismissed, triggerDismiss]);

  return (
    <div className={s.container}>
      <Canvas
        className={s.canvas}
        camera={{ position: [0, 0, 0.01], fov: 75, near: 0.1, far: 5000 }}
        gl={{ antialias: true }}
      >
        {/* Scene background matches the dome's atmosphere base color so
            anti-aliased edges at the dome rim blend to teal, not black. */}
        <color attach="background" args={["#003958"]} />
        <Suspense fallback={null}>
          <OrbitSky onReady={handleReady} />
          <Comet />
          <FloatingCar />
        </Suspense>
        <LemniscateCamera amplitude={150} speed={-0.1} zoomed={dismissed} />
      </Canvas>

      {/* --- SMG Title Intro --- */}
      <div
        className={`${s.introWrap} ${gateState === "started" ? s.introPlay : ""} ${dismissed ? s.introDismissed : ""}`}
        onClick={triggerDismiss}
      >
        {/* Full-screen white flashbang */}
        <div className={s.flashbang} />
        {/* Logo + galaxy text fill */}
        <div className={s.logoWrap}>
          {/* Galaxy image scrolls behind the logo — visible through transparent "GALAXY" text */}
          <div className={s.galaxyFill}>
            <Image
              src="/smg-assets/orbit-sky/galaxy-bg.png"
              alt=""
              width={1200}
              height={600}
              priority
              className={s.galaxyImg}
              draggable={false}
            />
          </div>
          {/* Drop shadow overlay for GALAXY letters — sits above the galaxy fill */}
          <Image
            src="/smg-assets/orbit-sky/szg-shadow.png"
            alt=""
            width={600}
            height={300}
            priority
            className={s.galaxyShadow}
            draggable={false}
          />
          {/* Logo on top — everything opaque occludes the galaxy, transparent "GALAXY" reveals it */}
          <Image
            src="/smg-assets/orbit-sky/szg-logo.png"
            alt="Super Zayne Galaxy"
            width={600}
            height={300}
            priority
            className={s.logo}
            draggable={false}
          />
          {/* Static full logo — hidden until dismiss, then used for the whiteout effect */}
          <Image
            src="/smg-assets/orbit-sky/szg-logo-full.png"
            alt=""
            width={600}
            height={300}
            priority
            className={s.logoStatic}
            draggable={false}
          />
        </div>

        {/* Press Space / Tap prompt */}
        {canDismiss && !bubblePop && (
          <div className={s.pressSpace}>
            <span className={s.pressDesktop}>
              Press
              <img
                src="/smg-assets/orbit-sky/space-key.svg"
                alt="Space"
                className={s.pressSpaceIcon}
                draggable={false}
              />
            </span>
            <span className={s.pressMobile}>Tap to Start</span>
          </div>
        )}
        {bubblePop && (
          <div className={`${s.pressSpace} ${s.pressSpacePop}`}>
            <span className={s.pressDesktop}>
              Press
              <img
                src="/smg-assets/orbit-sky/space-key.svg"
                alt="Space"
                className={s.pressSpaceIcon}
                draggable={false}
              />
            </span>
            <span className={s.pressMobile}>Tap to Start</span>
          </div>
        )}
      </div>

      {/* Save file select (SMG-style) */}
      <SaveFileSelect
        visible={showSelect}
        onDetailEnter={audio.enterDetail}
        onDetailExit={audio.exitDetail}
        videoThumbnails={videoThumbnails}
      />

      {/* Black load overlay (existing) */}
      <div className={`${s.fadeOverlay} ${gateState === "started" ? s.fadeOut : ""}`} />

      {/* Interaction gate (required by browser autoplay policy) */}
      {gateState === 'gate' && (
        <div className={s.gatePrompt} onClick={handleGateInteraction}>
          <span className={`${s.gateLine} ${s.gateLine1}`}>{gateLine1}</span>
          <span className={`${s.gateLine} ${s.gateLine2}`}>{gateLine2}</span>
          <span className={`${s.gateLine} ${s.gateLine3}`}>
            <span className={s.pressDesktop}>Click or press space to initialize</span>
            <span className={s.pressMobile}>Tap to initialize</span>
          </span>
        </div>
      )}

      {/* Settings gear + panel */}
      {loaded && (
        <>
          <button
            className={s.settingsGear}
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            <GearIcon />
          </button>
          {showSettings && (
            <div className={s.settingsBackdrop} onClick={() => setShowSettings(false)}>
              <div className={s.settingsCard} onClick={(e) => e.stopPropagation()}>
                <h3 className={s.settingsTitle}>Settings</h3>
                <div className={s.settingsRow}>
                  <span className={s.settingsLabel}>
                    {audio.volume === 0 ? "♭" : "♫"} Volume
                  </span>
                  <div className={s.settingsSliderGroup}>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={audio.volume}
                      onChange={(e) => audio.setVolume(Number(e.target.value))}
                      className={s.volumeSlider}
                      aria-label="Master volume"
                    />
                    <span className={s.volumeValue}>{Math.round(audio.volume * 100)}%</span>
                  </div>
                </div>
                <div className={s.settingsRow}>
                  <span className={s.settingsLabel}>Video thumbnails</span>
                  <label className={s.toggle}>
                    <input
                      type="checkbox"
                      checked={videoThumbnails}
                      onChange={(e) => {
                        setVideoThumbnailsState(e.target.checked);
                        localStorage.setItem("szg-video-thumbs", String(e.target.checked));
                      }}
                      className={s.toggleInput}
                    />
                    <span className={s.toggleTrack}>
                      <span className={s.toggleThumb} />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <noscript>
        <div className={s.loading}>
          JavaScript is required for this 3D experience.
        </div>
      </noscript>
    </div>
  );
}
