"use client";
import { cn } from "@/app/archive/portfolio-v2/_legacy/archive/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  /** "warm" = red/orange, "cool" = light blue, "hidden" = black (no aurora) */
  variant?: "warm" | "cool" | "hidden";
}

/* shared structural classes for aurora layers */
const LAYER_BASE = [
  "[background-size:300%,_200%]",
  "[background-position:50%_50%,50%_50%]",
  "filter",
  "blur-[10px]",
  "pointer-events-none",
  "absolute",
  "-inset-[10px]",
  "will-change-transform",
  "after:content-['']",
  "after:absolute",
  "after:inset-0",
  "after:[background-size:200%,_100%]",
  "after:animate-aurora",
  "after:[background-attachment:fixed]",
  "after:mix-blend-difference",
].join(" ");

/* gradient definitions per variant */
const WARM_GRADIENT = [
  "[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]",
  "[--aurora:repeating-linear-gradient(100deg,var(--red-500)_10%,var(--orange-300)_15%,var(--red-300)_20%,var(--orange-200)_25%,var(--red-400)_30%)]",
  "[background-image:var(--dark-gradient),var(--aurora)]",
  "after:[background-image:var(--dark-gradient),var(--aurora)]",
].join(" ");

const COOL_GRADIENT = [
  "[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]",
  "[--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]",
  "[background-image:var(--dark-gradient),var(--aurora)]",
  "after:[background-image:var(--dark-gradient),var(--aurora)]",
].join(" ");

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  variant = "warm",
  ...props
}: AuroraBackgroundProps) => {
  const maskClass = showRadialGradient
    ? "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]"
    : "";

  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-black text-slate-950 transition-bg",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          {/* warm (red/orange) layer */}
          <div
            className={cn(
              LAYER_BASE,
              WARM_GRADIENT,
              maskClass,
              "transition-opacity duration-[2000ms] ease-in-out",
              variant === "warm" ? "opacity-50" : "opacity-0",
            )}
          />
          {/* cool (blue) layer */}
          <div
            className={cn(
              LAYER_BASE,
              COOL_GRADIENT,
              maskClass,
              "transition-opacity duration-[2000ms] ease-in-out",
              variant === "cool" ? "opacity-50" : "opacity-0",
            )}
          />
        </div>
        {children}
      </div>
    </main>
  );
};
