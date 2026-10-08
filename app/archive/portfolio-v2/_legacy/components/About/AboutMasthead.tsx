import { HeroBackground } from "@/app/archive/portfolio-v2/_legacy/components/PortfolioHero/HeroBackground";
import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";

import styles from "./AboutMasthead.module.css";

export function AboutMasthead() {
  return (
    <section className={styles.masthead} aria-label="About" data-cursor-tone="dark" data-theme-color="#cba5e5">
      <HeroBackground pauseWhenOffscreen />
      <div aria-hidden="true" className={styles.squares}>
        <ResponsivePublicImage alt="" webpSrc="/about-squares-1.png" />
      </div>
      <h1 className={styles.title}>ABOUT</h1>
    </section>
  );
}
