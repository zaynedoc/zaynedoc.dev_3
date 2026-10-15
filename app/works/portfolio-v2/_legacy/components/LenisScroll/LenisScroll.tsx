"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function LenisScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;

    const syncLenis = () => {
      lenis?.destroy();
      lenis = undefined;

      if (!reducedMotion.matches) {
        lenis = new Lenis({
          anchors: true,
          autoRaf: true,
          duration: 1.05,
          smoothWheel: true,
        });
      }
    };

    syncLenis();
    reducedMotion.addEventListener("change", syncLenis);

    return () => {
      reducedMotion.removeEventListener("change", syncLenis);
      lenis?.destroy();
    };
  }, []);

  return null;
}
