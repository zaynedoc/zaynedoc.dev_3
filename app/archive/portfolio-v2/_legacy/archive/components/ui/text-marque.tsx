'use client';
import React, { useRef, useEffect, forwardRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion';
import { cn } from '@/app/archive/portfolio-v2/_legacy/archive/lib/utils';

/** Wraps `v` between `min` and `max` (replacement for @motionone/utils wrap). */
function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

interface TextMarqueProps {
  children: string;
  baseVelocity: number;
  className?: string;
  style?: React.CSSProperties;
  scrollDependent?: boolean;
  delay?: number;
}

const TextMarque = forwardRef<HTMLDivElement, TextMarqueProps>(({
  children,
  baseVelocity = -5,
  className,
  style,
  scrollDependent = false,
  delay = 0,
}, ref) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
    clamp: false,
  });

  // More copies needed for short text so the strip fills the viewport.
  const repeatCount = Math.max(10, Math.ceil(60 / children.length));

  // Wrap range = one copy slot = 100% / repeatCount
  const slotPct = 100 / repeatCount;
  const wrapMin = -(50);
  const wrapMax = -(50 + slotPct);
  const x = useTransform(baseX, (v) => `${wrap(wrapMax, wrapMin, v)}%`);

  const directionFactor = useRef<number>(1);
  const hasStarted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      hasStarted.current = true;
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useAnimationFrame((_t, delta) => {
    if (!hasStarted.current) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (scrollDependent) {
      if (velocityFactor.get() < 0) {
        directionFactor.current = -1;
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = 1;
      }
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div ref={ref} className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div
        className="flex whitespace-nowrap gap-10 flex-nowrap"
        style={{ x }}
      >
        {Array.from({ length: repeatCount }, (_, i) => (
          <span key={i} className={cn('block text-[8vw]', className)} style={style}>{children}</span>
        ))}
      </motion.div>
    </div>
  );
});

TextMarque.displayName = 'TextMarque';

export default TextMarque;
