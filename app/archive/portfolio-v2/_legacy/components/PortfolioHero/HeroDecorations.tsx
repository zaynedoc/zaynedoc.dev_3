import { ResponsivePublicImage } from "@/app/archive/portfolio-v2/_legacy/components/ResponsivePublicImage/ResponsivePublicImage";

import styles from "./HeroDecorations.module.css";

type HeroDecorationsProps = {
  isWork: boolean;
};

export function HeroDecorations({ isWork }: HeroDecorationsProps) {
  return (
    <div className={`${styles.decorations} ${isWork ? styles.workDecorations : ""}`} aria-hidden="true">
      <div className={styles.squares}>
        <ResponsivePublicImage alt="" webpSrc="/main-squares.webp" />
      </div>
      <div className={styles.curves}>
        <ResponsivePublicImage alt="" webpSrc="/main-curves.webp" />
      </div>
    </div>
  );
}
