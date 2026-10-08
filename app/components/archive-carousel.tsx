"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./archive-carousel.module.css";

export type ArchiveCarouselSlide = {
  alt: string;
  src: string;
};

type ArchiveCarouselProps = {
  intervalMs?: number;
  label: string;
  slides: readonly ArchiveCarouselSlide[];
};

export function ArchiveCarousel({ intervalMs = 5000, label, slides }: ArchiveCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isPaused = interactionPaused || reducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches);

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-label={label}
      aria-roledescription="carousel"
      className={styles.carousel}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setInteractionPaused(false);
        }
      }}
      onFocusCapture={() => setInteractionPaused(true)}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      tabIndex={0}
    >
      <div className={styles.viewport}>
        {slides.map((slide, index) => (
          <figure
            aria-hidden={index !== activeIndex}
            className={`${styles.slide}${index === activeIndex ? ` ${styles.slideActive}` : ""}`}
            key={slide.src}
          >
            {/* TODO: Replace with a real portfolio-v2 screenshot, target size: 1600x900. */}
            <Image
              alt={index === activeIndex ? slide.alt : ""}
              className={styles.image}
              height={900}
              loading="lazy"
              src={slide.src}
              width={1600}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
