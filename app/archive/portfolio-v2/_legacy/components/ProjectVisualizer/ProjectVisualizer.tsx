"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import type { ProjectItem } from "@/app/archive/portfolio-v2/_legacy/data/projects";

import styles from "./ProjectVisualizer.module.css";

const IDLE_SHUFFLE_DELAY = 10_000;

type ProjectVisualizerProps = {
  projects: readonly ProjectItem[];
  selectedProject: ProjectItem | null;
};

export function ProjectVisualizer({ projects, selectedProject }: ProjectVisualizerProps) {
  const projectsWithMedia = useMemo(() => projects.filter((project) => project.media), [projects]);
  const [idleIndex, setIdleIndex] = useState(0);
  const visualizerRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const visualizer = visualizerRef.current;

    if (!visualizer || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "500px 0px" },
    );

    observer.observe(visualizer);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNearViewport || selectedProject || projectsWithMedia.length < 2) {
      return;
    }

    const initialShuffle = window.setTimeout(() => {
      setIdleIndex(Math.floor(Math.random() * projectsWithMedia.length));
    }, 0);
    const interval = window.setInterval(() => {
      setIdleIndex((currentIndex) => (currentIndex + 1) % projectsWithMedia.length);
    }, IDLE_SHUFFLE_DELAY);

    return () => {
      window.clearTimeout(initialShuffle);
      window.clearInterval(interval);
    };
  }, [isNearViewport, projectsWithMedia, selectedProject]);

  const activeProject = selectedProject ?? projectsWithMedia[idleIndex] ?? projects[0];
  const media = activeProject?.media;

  if (!activeProject) {
    return null;
  }

  return (
    <aside className={styles.visualizer} aria-label="Project visualizer" ref={visualizerRef}>
      <div className={styles.float}>
        <div className={styles.card}>
          {isNearViewport && media?.type === "video" ? (
            <video autoPlay className={styles.media} key={media.src} loop muted playsInline preload="metadata" src={media.src} />
          ) : isNearViewport && media?.type === "image" ? (
            <Image alt={media.alt ?? `${activeProject.title} project preview`} className={styles.media} fill sizes="(min-width: 64.0625rem) 30vw, 0px" src={media.src} />
          ) : media ? (
            <div aria-hidden="true" className={styles.mediaPlaceholder}>
              <span>Project visualizer</span>
              <strong>{activeProject.title}</strong>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>Project visualizer</span>
              <strong>{activeProject.title}</strong>
              <small>Add a PNG or MP4 in <code>/public/projects</code></small>
            </div>
          )}
          <div className={styles.label}>
            <span>{selectedProject ? "Selected project" : "Now showing"}</span>
            <strong>{activeProject.title}</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
