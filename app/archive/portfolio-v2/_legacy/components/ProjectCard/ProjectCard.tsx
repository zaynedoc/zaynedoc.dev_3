import { DetailPanel } from "@/app/archive/portfolio-v2/_legacy/components/DetailPanel/DetailPanel";
import type { ProjectItem } from "@/app/archive/portfolio-v2/_legacy/data/projects";
import { formatTimeline } from "@/app/archive/portfolio-v2/_legacy/data/portfolio-details";

import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  expanded: boolean;
  item: ProjectItem;
  onToggle: () => void;
  panelId: string;
};

export function ProjectCard({ expanded, item, onToggle, panelId }: ProjectCardProps) {
  const timeline = formatTimeline(item.timeline);

  return (
    <article className={`${styles.card} ${expanded ? styles.expanded : ""}`}>
      <button aria-controls={panelId} aria-expanded={expanded} className={styles.trigger} onClick={onToggle} type="button">
        <h3 className={styles.title}>{item.title} <span aria-hidden="true">↙</span></h3>
      </button>
      <p className={styles.descriptor}>
        {timeline ? <span className={styles.descriptorTimeline}>{timeline} <span aria-hidden="true">•</span> </span> : null}
        <a className={styles.descriptorLink} href={item.href} rel="noreferrer" target="_blank">
          {item.descriptor} <span aria-hidden="true">↗</span>
          <span className={styles.visuallyHidden}> (opens in a new tab)</span>
        </a>
      </p>
      <DetailPanel details={item} expanded={expanded} id={panelId} />
    </article>
  );
}
