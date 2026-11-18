"use client";

import Image from "next/image";
import { useEffect, useState, type KeyboardEvent } from "react";

import styles from "./project-carousel.module.css";

export type ProjectCarouselSlide = {
  alt: string;
  src: string;
};

type ProjectCarouselProps = {
  aspectRatio?: string;
  intervalMs?: number;
  keyboardNavigation?: boolean;
  label: string;
  slides: readonly ProjectCarouselSlide[];
};

export function ProjectCarousel({ aspectRatio, intervalMs = 5000, keyboardNavigation = false, label, slides }: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusPaused, setFocusPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isPaused = focusPaused || reducedMotion;

  function navigateSlides(event: KeyboardEvent<HTMLElement>) {
    if (!keyboardNavigation || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || slides.length < 2) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setActiveIndex((current) => event.key === "Home" ? 0
      : event.key === "End" ? slides.length - 1
      : (current + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + slides.length) % slides.length);
  }

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
      onKeyDown={navigateSlides}
      tabIndex={0}
    >
      <div className={styles.viewport} style={aspectRatio ? { aspectRatio } : undefined}>
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
