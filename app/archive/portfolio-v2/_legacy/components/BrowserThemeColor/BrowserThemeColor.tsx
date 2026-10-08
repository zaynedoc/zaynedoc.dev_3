"use client";

import { useEffect } from "react";

const HEADER_HEIGHT = 80;

export function BrowserThemeColor() {
  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>("meta[name='theme-color']")
      ?? document.head.appendChild(document.createElement("meta"));

    themeColor.name = "theme-color";

    const updateThemeColor = () => {
      const header = document.querySelector<HTMLElement>("header[data-theme-color]");
      const headerBounds = header?.getBoundingClientRect();
      const headerIsVisible = headerBounds !== undefined && headerBounds.bottom > 0;
      const sections = [...document.querySelectorAll<HTMLElement>("[data-theme-color]")];
      const activeSection = headerIsVisible
        ? header
        : sections.findLast((section) => {
        const bounds = section.getBoundingClientRect();

        return bounds.top <= HEADER_HEIGHT && bounds.bottom > HEADER_HEIGHT;
      }) ?? sections.find((section) => section !== header);
      const color = activeSection?.dataset.themeColor ?? "#cba5e5";

      themeColor.content = color;
      document.documentElement.style.setProperty("--browser-theme-color", color);
    };

    updateThemeColor();
    window.addEventListener("scroll", updateThemeColor, { passive: true });
    window.addEventListener("resize", updateThemeColor);

    return () => {
      window.removeEventListener("scroll", updateThemeColor);
      window.removeEventListener("resize", updateThemeColor);
    };
  }, []);

  return null;
}
