import { PageTransitionLink } from "@/app/archive/portfolio-v2/_legacy/components/PageReveal/PageTransitionLink";
import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";

import styles from "./Nintendo3DS.module.css";

export function Nintendo3DS() {
  return (
    <PageTransitionLink aria-label="Open Zayne's 3DS dashboard" className={styles.trigger} href={portfolioV2Path("/dashboard")}>
      <span aria-hidden="true" className={styles.star}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/star-ds.png" />
      </span>
      <span aria-hidden="true" className={`${styles.console} ${styles.closed}`}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/ds-closed.png" />
      </span>
      <span aria-hidden="true" className={`${styles.console} ${styles.open}`}>
        <ResponsivePublicImage alt="" decoding="async" loading="lazy" webpSrc="/ds-open.png" />
      </span>
    </PageTransitionLink>
  );
}
