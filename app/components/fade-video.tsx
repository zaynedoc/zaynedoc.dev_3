"use client";

import { useState, type VideoHTMLAttributes } from "react";

export function FadeVideo({
  className,
  muted = true,
  onLoadedData,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement>) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <video
      {...props}
      className={[
        className,
        "reveal-media",
        isLoaded ? "reveal-media--loaded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      muted={muted}
      onLoadedData={(event) => {
        setIsLoaded(true);
        onLoadedData?.(event);
      }}
    />
  );
}
