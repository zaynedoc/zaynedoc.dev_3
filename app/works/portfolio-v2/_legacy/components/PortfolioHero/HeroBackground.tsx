"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./HeroBackground.module.css";

type HeroBackgroundProps = {
  /** Keeps the existing animated ellipse treatment enabled by default. */
  animated?: boolean;
  /** Keeps the cursor-driven dot fade enabled by default. */
  interactiveDots?: boolean;
  /**
   * Opt-in performance mode for long pages: stop animation and pointer work
   * while this background is outside the viewport.
   */
  pauseWhenOffscreen?: boolean;
};

export function HeroBackground({
  animated = true,
  interactiveDots = true,
  pauseWhenOffscreen = false,
}: HeroBackgroundProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const background = backgroundRef.current;

    if (!pauseWhenOffscreen || !background || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "128px 0px" },
    );

    observer.observe(background);

    return () => observer.disconnect();
  }, [pauseWhenOffscreen]);

  const isActive = !pauseWhenOffscreen || isVisible;

  useEffect(() => {
    const canvas = dotsRef.current;

    if (!canvas) {
      return;
    }

    const cursor = { x: -1000, y: -1000 };
    let frame: number | null = null;
    let cursorIsInside = false;

    const drawDots = () => {
      const bounds = canvas.getBoundingClientRect();
      const context = canvas.getContext("2d");

      if (!context || bounds.width === 0 || bounds.height === 0) {
        frame = null;
        return;
      }

      const pixelRatio = window.devicePixelRatio || 1;
      const width = Math.round(bounds.width * pixelRatio);
      const height = Math.round(bounds.height * pixelRatio);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const styles = window.getComputedStyle(canvas);
      const step = Number.parseFloat(styles.getPropertyValue("--hero-dot-step")) || 24;
      const dotDiameter = Number.parseFloat(styles.getPropertyValue("--hero-dot-size")) || 2;
      const fadeRadius = 300;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      for (let y = 0; y <= bounds.height; y += step) {
        for (let x = 0; x <= bounds.width; x += step) {
          const distance = Math.hypot(x - cursor.x, y - cursor.y);
          const falloff = Math.min(1, distance / fadeRadius);
          const alpha = 0.2 * (0.05 + (0.95 * falloff * falloff));

          context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          context.beginPath();
          context.arc(x, y, dotDiameter / 2, 0, Math.PI * 2);
          context.fill();
        }
      }

      frame = null;
    };

    const requestDraw = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(drawDots);
      }
    };

    const updateCursor = (event: PointerEvent) => {
      const background = backgroundRef.current;

      if (!background || event.pointerType !== "mouse") {
        return;
      }

      const bounds = background.getBoundingClientRect();
      const isInsideHero = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom;

      if (!isInsideHero) {
        // Outside of the visible About hero, a single reset is enough. The
        // former behaviour redrew every off-screen canvas on every mousemove.
        if (pauseWhenOffscreen && !cursorIsInside) {
          return;
        }

        cursorIsInside = false;
        cursor.x = -1000;
        cursor.y = -1000;
        requestDraw();
        return;
      }

      cursorIsInside = true;
      cursor.x = event.clientX - bounds.left;
      cursor.y = event.clientY - bounds.top;
      requestDraw();
    };

    const resizeObserver = new ResizeObserver(requestDraw);

    resizeObserver.observe(canvas);
    if (interactiveDots && isActive) {
      window.addEventListener("pointermove", updateCursor, { passive: true });
    }

    // Keep legacy backgrounds identical. About's opt-in mode lets the
    // ResizeObserver handle canvas dimensions without another global listener.
    if (!pauseWhenOffscreen) {
      window.addEventListener("resize", requestDraw);
    }
    requestDraw();

    return () => {
      resizeObserver.disconnect();
      if (interactiveDots && isActive) {
        window.removeEventListener("pointermove", updateCursor);
      }

      if (!pauseWhenOffscreen) {
        window.removeEventListener("resize", requestDraw);
      }

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [interactiveDots, isActive, pauseWhenOffscreen]);

  return (
    <div
      aria-hidden="true"
      className={`${styles.background}${animated ? "" : ` ${styles.static}`}${pauseWhenOffscreen && !isVisible ? ` ${styles.paused}` : ""}`}
      ref={backgroundRef}
    >
      <div className={`${styles.blob} ${styles.blobOne}`} />
      <div className={`${styles.blob} ${styles.blobTwo}`} />
      <div className={`${styles.blob} ${styles.blobThree}`} />
      <div className={`${styles.blob} ${styles.blobFour}`} />
      <div className={`${styles.blob} ${styles.blobFive}`} />
      <canvas className={styles.dots} ref={dotsRef} />
    </div>
  );
}
