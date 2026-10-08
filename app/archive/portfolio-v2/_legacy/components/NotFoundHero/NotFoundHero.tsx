import { HeroBackground } from "@/app/archive/portfolio-v2/_legacy/components/PortfolioHero/HeroBackground";
import { HeroDecorations } from "@/app/archive/portfolio-v2/_legacy/components/PortfolioHero/HeroDecorations";

import styles from "./NotFoundHero.module.css";

export function NotFoundHero() {
  return (
    <section className={styles.hero} aria-labelledby="not-found-heading" data-cursor-tone="dark" data-theme-color="#cba5e5">
      <HeroBackground />
      <HeroDecorations isWork={false} />
      <div className={styles.content}>
        <h1 className={styles.heading} id="not-found-heading">404</h1>
        <p className={styles.message}>Paths open up everyday, but this one isn&apos;t here yet :)</p>
      </div>
    </section>
  );
}
