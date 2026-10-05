"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function FadeImage({ alt, className, onLoad, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      className={[
        className,
        "reveal-media",
        isLoaded ? "reveal-media--loaded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onLoad={(event) => {
        setIsLoaded(true);
        onLoad?.(event);
      }}
    />
  );
}
