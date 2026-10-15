"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./project-carousel.module.css";

export type ProjectCarouselSlide = {
  alt: string;
  src: string;
};

type ProjectCarouselProps = {
  intervalMs?: number;
  label: string;
  slides: readonly ProjectCarouselSlide[];
};

export function ProjectCarousel({ intervalMs = 5000, label, slides }: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusPaused, setFocusPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isPaused = focusPaused || reducedMotion;

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
          setFocusPaused(false);
        }
      }}
      onFocusCapture={() => setFocusPaused(true)}
      tabIndex={0}
    >
      <div className={styles.viewport}>
        {slides.map((slide, index) => (
          <figure
            aria-hidden={index !== activeIndex}
            className={`${styles.slide}${index === activeIndex ? ` ${styles.slideActive}` : ""}`}
            key={slide.src}
          >
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
