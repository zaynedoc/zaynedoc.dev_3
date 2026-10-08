import { DetailPanel } from "@/app/archive/portfolio-v2/_legacy/components/DetailPanel/DetailPanel";
import type { ExperienceItem } from "@/app/archive/portfolio-v2/_legacy/data/experience";
import { formatTimeline } from "@/app/archive/portfolio-v2/_legacy/data/portfolio-details";

import styles from "./ExperienceCard.module.css";

type ExperienceCardProps = {
  expanded: boolean;
  item: ExperienceItem;
  onToggle: () => void;
  panelId: string;
};

export function ExperienceCard({ expanded, item, onToggle, panelId }: ExperienceCardProps) {
  const timeline = formatTimeline(item.timeline);

  return (
    <article className={`${styles.card} ${expanded ? styles.expanded : ""}`}>
      <button aria-controls={panelId} aria-expanded={expanded} className={styles.trigger} onClick={onToggle} type="button">
        <h3 className={styles.role}>{item.role} <span aria-hidden="true">↙</span></h3>
      </button>
      <p className={styles.organization}>
        {timeline ? <span className={styles.organizationTimeline}>{timeline} <span aria-hidden="true">•</span> </span> : null}
        <a className={styles.organizationLink} href={item.organizationUrl} rel="noreferrer" target="_blank">
          {item.organization} <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
      <DetailPanel details={item} expanded={expanded} id={panelId} />
    </article>
  );
}
