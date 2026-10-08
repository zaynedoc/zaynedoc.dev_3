import { Nintendo3DS } from "@/app/archive/portfolio-v2/_legacy/components/About/Nintendo3DS";
import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";
import { SectionBackground } from "@/app/archive/portfolio-v2/_legacy/components/SectionBackground/SectionBackground";

import styles from "./GenesisSection.module.css";

export function GenesisSection() {
  return (
    <section className={styles.section} aria-labelledby="genesis-heading" data-theme-color="#fcf9ff">
      <SectionBackground variant="projects" />
      <div aria-hidden="true" className={styles.squaresTop}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/about-squares-1.png" />
      </div>
      <div aria-hidden="true" className={styles.squaresBottom}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/about-squares-2.png" />
      </div>

      <div className={styles.content}>
        <div className={styles.gallery}>
          <div className={styles.mainCar}>
            <ResponsivePublicImage alt="Zayne's Hyundai Genesis at night" decoding="async" loading="lazy" webpSrc="/car1.jpg" />
          </div>
          <div className={styles.secondaryCars}>
            <div>
              <ResponsivePublicImage alt="Zayne's Hyundai Genesis near UCF" decoding="async" loading="lazy" webpSrc="/car2.jpg" />
            </div>
            <div>
              <ResponsivePublicImage alt="Zayne's Hyundai Genesis during the day" decoding="async" loading="lazy" webpSrc="/car3.jpg" />
            </div>
          </div>
        </div>

        <div className={styles.copy}>
          <div className={styles.headingGroup}>
            <h2 id="genesis-heading"><span aria-hidden="true">↓ </span>My Genesis</h2>
            <div aria-hidden="true" />
          </div>
          <div className={styles.description}>
            <p>Here’s some cool photos of my car.</p>
            <p>I love going for small drives around the Orlando/Melbourne area of Florida whenever I have the time.</p>
            <p>My car is a 2014 Hyundai Genesis Coupe 2.0T Premium, I’ve owned it since mid-2024.</p>
            <p>Auto transmission by the way, I’ve yet to learn how to drive stick 😭</p>
          </div>
          <div className={styles.dsDesktop}>
            <Nintendo3DS />
          </div>
        </div>
      </div>
    </section>
  );
}
