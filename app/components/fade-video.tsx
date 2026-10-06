"use client";

import {
  useEffect,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react";

export function FadeVideo({
  className,
  muted = true,
  onLoadedData,
  preload = "metadata",
  src,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

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
      preload={shouldLoad ? preload : "none"}
      ref={videoRef}
      src={shouldLoad ? src : undefined}
    />
  );
}
