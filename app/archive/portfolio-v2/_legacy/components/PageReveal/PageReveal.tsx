"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import styles from "./PageReveal.module.css";

export const PAGE_TRANSITION_EVENT = "page-reveal:navigate";

type TransitionPhase = "covering" | "revealing";

function getDuration(variableName: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  const duration = Number.parseFloat(value);

  return value.endsWith("s") && !value.endsWith("ms") ? duration * 1000 : duration;
}

export function PageReveal() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [phase, setPhase] = useState<TransitionPhase>("covering");

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setPhase("revealing"));

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    function handleNavigate(event: Event) {
      const navigate = (event as CustomEvent<() => void>).detail;

      if (typeof navigate !== "function") {
        return;
      }

      setPhase("covering");
      window.setTimeout(navigate, getDuration("--page-transition-cover-duration"));
    }

    window.addEventListener(PAGE_TRANSITION_EVENT, handleNavigate);

    return () => window.removeEventListener(PAGE_TRANSITION_EVENT, handleNavigate);
  }, []);

  useEffect(() => {
    if (pathname === previousPathname.current) {
      return;
    }

    previousPathname.current = pathname;
    const animationFrame = requestAnimationFrame(() => setPhase("revealing"));

    return () => cancelAnimationFrame(animationFrame);
  }, [pathname]);

  return <div aria-hidden="true" className={`${styles.reveal} ${styles[phase]}`} />;
}
