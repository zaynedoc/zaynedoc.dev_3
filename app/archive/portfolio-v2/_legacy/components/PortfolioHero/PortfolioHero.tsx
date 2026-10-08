import type { HeroConfig } from "@/app/archive/portfolio-v2/_legacy/data/hero";

import { HeroBackground } from "./HeroBackground";
import { HeroDecorations } from "./HeroDecorations";
import { HeroRoles } from "./HeroRoles";
import { HeroTitle } from "./HeroTitle";
import { SocialLinks } from "./SocialLinks";
import styles from "./PortfolioHero.module.css";

type PortfolioHeroProps = {
  config: HeroConfig;
};

export function PortfolioHero({ config }: PortfolioHeroProps) {
  const isWork = config.contentLayout === "work";

  return (
    <section className={styles.hero} aria-label="Portfolio hero" data-cursor-tone="dark" data-theme-color="#cba5e5">
      <HeroBackground />
      <HeroDecorations isWork={isWork} />
      <div className={`${styles.content} ${isWork ? styles.workContent : styles.homeContent}`}>
        <HeroTitle contentLayout={config.contentLayout} name={config.name} />
        {isWork && config.roles ? (
          <div className={styles.workDetails}>
            <div className={styles.workRoles}>
              <HeroRoles text={config.roles.text} texture={config.roles.texture} />
            </div>
            {/* Retains the former social row's footprint, without exposing links on Work. */}
            <div aria-hidden="true" className={styles.workSocialSpacer} />
          </div>
        ) : (
          <SocialLinks links={config.socialLinks} />
        )}
      </div>
      {isWork ? <span aria-hidden="true" className={styles.scrollCue}>↓</span> : null}
    </section>
  );
}
