"use client";

import { useState } from "react";

import { HeroBackground } from "@/app/archive/portfolio-v2/_legacy/components/PortfolioHero/HeroBackground";
import { favoriteSongs } from "@/app/archive/portfolio-v2/_legacy/data/music";

import styles from "./MusicShelf.module.css";

export function MusicShelf() {
  const [activeIndex, setActiveIndex] = useState(0);
  const song = favoriteSongs[activeIndex];
  const playerSource = `https://www.youtube-nocookie.com/embed/${song.youtubeId}?controls=1&playsinline=1&rel=0&start=${song.highlightStart}`;

  function moveSelection(direction: 1 | -1) {
    setActiveIndex((currentIndex) => (currentIndex + direction + favoriteSongs.length) % favoriteSongs.length);
  }

  return (
    <section className={styles.section} aria-label="Favorite songs" data-cursor-tone="dark" data-theme-color="#cba5e5">
      <HeroBackground animated={false} pauseWhenOffscreen />
      <div className={styles.content}>
        <div className={styles.controls} aria-label="Choose a favorite song">
          <button aria-label="Previous song" onClick={() => moveSelection(-1)} type="button">↑</button>
          <button aria-label="Next song" onClick={() => moveSelection(1)} type="button">↓</button>
        </div>
        <div className={styles.artwork} key={playerSource}>
          <iframe
            allow="encrypted-media; picture-in-picture"
            className={styles.player}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={playerSource}
            title={`${song.title} highlight`}
          />
        </div>
        <div className={styles.songCopy}>
          <p className={styles.eyebrow}>Favorite Songs</p>
          <p className={styles.eyebrow}><br /></p>
          <p className={styles.title}>“{song.title}”</p>
          <p className={styles.byline}>by {song.artist}</p>
        </div>
      </div>
    </section>
  );
}
