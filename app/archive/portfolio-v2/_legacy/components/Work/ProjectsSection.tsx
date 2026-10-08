"use client";

import { useState } from "react";

import { DecorativeLayer } from "@/app/archive/portfolio-v2/_legacy/components/DecorativeLayer/DecorativeLayer";
import { ProjectCard } from "@/app/archive/portfolio-v2/_legacy/components/ProjectCard/ProjectCard";
import { ProjectVisualizer } from "@/app/archive/portfolio-v2/_legacy/components/ProjectVisualizer/ProjectVisualizer";
import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";
import { SectionBackground } from "@/app/archive/portfolio-v2/_legacy/components/SectionBackground/SectionBackground";
import { projectItems } from "@/app/archive/portfolio-v2/_legacy/data/projects";

import styles from "./ProjectsSection.module.css";

export function ProjectsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.section} aria-labelledby="projects-heading" data-theme-color="#fcf9ff">
      <SectionBackground variant="projects" />

      <DecorativeLayer className={styles.stripes}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/work-project-stripes.webp" />
      </DecorativeLayer>

      <DecorativeLayer className={styles.curves}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/work-project-curves.webp" />
      </DecorativeLayer>

      <DecorativeLayer className={styles.squares}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/work-project-squares.webp" />
      </DecorativeLayer>

      <ProjectVisualizer
        projects={projectItems}
        selectedProject={openIndex === null ? null : projectItems[openIndex]}
      />

      <div className={styles.content}>
        <div className={styles.headingGroup}>
          <h2 className={styles.heading} id="projects-heading"><span aria-hidden="true">↓ </span>Projects</h2>
          <div className={styles.headingRule} aria-hidden="true" />
        </div>

        <div className={styles.entries}>
          {projectItems.map((item, index) => (
            <ProjectCard
              expanded={openIndex === index}
              item={item}
              key={item.title}
              onToggle={() => setOpenIndex((currentIndex) => currentIndex === index ? null : index)}
              panelId={`project-details-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
