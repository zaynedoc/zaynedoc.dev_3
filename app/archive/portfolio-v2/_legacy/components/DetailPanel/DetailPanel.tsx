import type { PortfolioDetails } from "@/app/archive/portfolio-v2/_legacy/data/portfolio-details";

import styles from "./DetailPanel.module.css";

type DetailPanelProps = {
  details: PortfolioDetails;
  expanded: boolean;
  id: string;
};

export function DetailPanel({ details, expanded, id }: DetailPanelProps) {
  return (
    <div className={`${styles.details} ${expanded ? styles.expanded : ""}`} id={id}>
      <div className={styles.detailsInner}>
        <div className={styles.glassCard}>
          <ul className={styles.highlights}>
            {details.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
          <ul className={styles.tags} aria-label="Tags">
            {details.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
