"use client";
/* eslint-disable react-hooks/purity, react-hooks/immutability -- preserved 3D card animation loop */

import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/app/archive/portfolio-v2/_legacy/archive/lib/utils";

/* ── Context for mouse-enter state ── */
const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export function useMouseEnter() {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a CardContainer");
  }
  return context;
}

/* ── CardContainer — perspective wrapper ── */
export function CardContainer({
  children,
  className,
  containerClassName,
  idleTilt = false,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  idleTilt?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const isMouseEnteredRef = useRef(false);

  /* Lerp-based smooth tilt */
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const idlePhaseRef = useRef(Math.random() * Math.PI * 2);

  // Keep ref in sync with state
  useEffect(() => {
    isMouseEnteredRef.current = isMouseEntered;
  }, [isMouseEntered]);

  const animate = useCallback(() => {
    const LERP = 0.08;
    const cur = currentRef.current;
    const tgt = targetRef.current;

    // When idle-tilting and mouse is not inside, set oscillating target
    if (idleTilt && !isMouseEnteredRef.current) {
      const t = performance.now() / 1000;
      const phase = idlePhaseRef.current;
      tgt.x = Math.sin(t * 0.7 + phase) * 6;
      tgt.y = Math.cos(t * 0.5 + phase * 1.3) * 4;
    }

    cur.x += (tgt.x - cur.x) * LERP;
    cur.y += (tgt.y - cur.y) * LERP;

    if (containerRef.current) {
      containerRef.current.style.transform =
        `rotateY(${cur.x}deg) rotateX(${-cur.y}deg)`;
    }

    const settled =
      Math.abs(tgt.x - cur.x) < 0.01 && Math.abs(tgt.y - cur.y) < 0.01;

    // Keep looping if idle-tilt is on (target keeps changing)
    if (!settled || (idleTilt && !isMouseEnteredRef.current)) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cur.x = tgt.x;
      cur.y = tgt.y;
      if (containerRef.current) {
        containerRef.current.style.transform =
          `rotateY(${cur.x}deg) rotateX(${-cur.y}deg)`;
      }
      rafRef.current = null;
    }
  }, [idleTilt]);

  const startLoop = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  // Start idle-tilt loop on mount
  useEffect(() => {
    if (idleTilt) {
      startLoop();
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [idleTilt, startLoop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    targetRef.current = {
      x: (e.clientX - left - width / 2) / 25,
      y: (e.clientY - top - height / 2) / 25,
    };
    startLoop();
  }, [startLoop]);

  const handleMouseEnter = useCallback(() => {
    setIsMouseEntered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseEntered(false);
    targetRef.current = { x: 0, y: 0 };
    startLoop();
  }, [startLoop]);

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn("flex items-center justify-center", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <div
          ref={containerRef}
          className={cn("relative", className)}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
}

/* ── CardBody — preserves 3D for children ── */
export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}
    >
      {children}
    </div>
  );
}

/* ── CardItem — translates on Z-axis when hovered ── */
export function CardItem({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform =
        "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
    }
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <div
      ref={ref}
      className={cn("w-fit transition-transform duration-300 ease-out", className)}
    >
      {children}
    </div>
  );
}
