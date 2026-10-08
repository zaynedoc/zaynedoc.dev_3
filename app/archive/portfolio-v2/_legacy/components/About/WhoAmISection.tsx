import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";
import { SectionBackground } from "@/app/archive/portfolio-v2/_legacy/components/SectionBackground/SectionBackground";

import styles from "./WhoAmISection.module.css";

export function WhoAmISection() {
  return (
    <section className={styles.section} aria-labelledby="who-am-i-heading" data-theme-color="#fcf9ff">
      <SectionBackground variant="experience" />
      <div aria-hidden="true" className={styles.stars}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/stars1.png" />
      </div>

      <div className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.headingGroup}>
            <h2 id="who-am-i-heading">Who Am I? <span aria-hidden="true">↓</span></h2>
            <div aria-hidden="true" />
          </div>
          <div className={styles.description}>
            <p>Self-proclaimed “buff wasian dev.”</p>
            <p>I specialize in UX/UI, DevOps, and AppSec.</p>
            <p>You’ll find me around the UCF area.<br />I’m known to hang out at Knight Hacks and Knights Design Interactive.</p>
          </div>
        </div>

        <div className={styles.portrait}>
          <ResponsivePublicImage alt="Zayne standing in St. Augustine" decoding="async" loading="lazy" webpSrc="/staugustine.jpg" />
        </div>
      </div>
    </section>
  );
}
