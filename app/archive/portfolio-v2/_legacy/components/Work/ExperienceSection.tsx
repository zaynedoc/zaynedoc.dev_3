"use client";

import { useState } from "react";

import { DecorativeLayer } from "@/app/archive/portfolio-v2/_legacy/components/DecorativeLayer/DecorativeLayer";
import { ExperienceCard } from "@/app/archive/portfolio-v2/_legacy/components/ExperienceCard/ExperienceCard";
import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";
import { SectionBackground } from "@/app/archive/portfolio-v2/_legacy/components/SectionBackground/SectionBackground";
import { experienceItems } from "@/app/archive/portfolio-v2/_legacy/data/experience";

import styles from "./ExperienceSection.module.css";

export function ExperienceSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.section} aria-labelledby="experience-heading" data-theme-color="#fcf9ff">
      <SectionBackground variant="experience" />

      <DecorativeLayer className={styles.stripes}>
        <ResponsivePublicImage alt="" webpSrc="/work-experience-stripes.webp" />
      </DecorativeLayer>

      <DecorativeLayer className={styles.curves}>
        <ResponsivePublicImage alt="" webpSrc="/work-experience-curves.webp" />
      </DecorativeLayer>

      <div className={styles.content}>
        <div className={styles.headingGroup}>
          <h2 className={styles.heading} id="experience-heading">Experience <span aria-hidden="true">↓</span></h2>
          <div className={styles.headingRule} aria-hidden="true" />
        </div>

        <div className={styles.entries}>
          {experienceItems.map((item, index) => (
            <ExperienceCard
              expanded={openIndex === index}
              item={item}
              key={item.organization}
              onToggle={() => setOpenIndex((currentIndex) => currentIndex === index ? null : index)}
              panelId={`experience-details-${index}`}
            />
          ))}
        </div>
      </div>

      <DecorativeLayer className={styles.stickers}>
        <div className={styles.figmaSticker}>
          <ResponsivePublicImage alt="" pngSrc="/logos/hdm/figma-sticker.png" webpSrc="/logos/ldm/figma-sticker.webp" />
        </div>
        <div className={styles.kdiSticker}>
          <ResponsivePublicImage alt="" pngSrc="/logos/hdm/kdi-sticker.png" webpSrc="/logos/ldm/kdi-sticker.webp" />
        </div>
        <div className={styles.khSticker}>
          <ResponsivePublicImage alt="" pngSrc="/logos/hdm/kh-sticker.png" webpSrc="/logos/ldm/kh-sticker.webp" />
        </div>
        <div className={styles.mgSticker}>
          <ResponsivePublicImage alt="" pngSrc="/logos/hdm/mg-sticker.png" webpSrc="/logos/ldm/mg-sticker.webp" />
        </div>
      </DecorativeLayer>
    </section>
  );
}
