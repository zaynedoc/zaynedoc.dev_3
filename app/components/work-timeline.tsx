"use client";

import { useState } from "react";
import Link from "next/link";
import type { TimelineItem } from "../data/work";
import { ArchiveCarousel } from "./archive-carousel";
import { FadeVideo } from "./fade-video";

type WorkTimelineProps = {
  initiallyExpanded?: boolean;
  items: TimelineItem[];
  projects?: boolean;
};

export function WorkTimeline({
  initiallyExpanded = false,
  items,
  projects: areProjects = false,
}: WorkTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () =>
      new Set(
        initiallyExpanded
          ? items.filter((item) => item.details).map((item) => item.title)
          : [],
      ),
  );

  const toggleItem = (title: string) => {
    setExpandedItems((currentItems) => {
      const nextItems = new Set(currentItems);

      if (nextItems.has(title)) {
        nextItems.delete(title);
      } else {
        nextItems.add(title);
      }

      return nextItems;
    });
  };

  return (
    <div className="timeline-list">
      {items.map((item, index) => {
        const detailsId = `timeline-details-${index}`;
        const isExpanded = expandedItems.has(item.title);
        const actionLinkClassName = `timeline-role__detail project-archive-link${item.action?.mobileDisabled ? " project-archive-link--desktop-only" : ""}`;

        return (
          <article
            className={`timeline-item${areProjects && isExpanded ? " timeline-item--expanded" : ""}`}
            key={item.title}
          >
            <div className="timeline-item__readables">
              <h2
                className={
                  areProjects
                    ? "timeline-item__title timeline-item__title--project"
                    : "timeline-item__title"
                }
              >
                {item.url && item.urlExternal === false ? (
                  <Link className="timeline-item__title-link" href={item.url}>
                    {item.title}
                  </Link>
                ) : item.url ? (
                  <a
                    className="timeline-item__title-link"
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h2>
              <div className="timeline-roles">
                {item.roles.map((role) => (
                  <div className="timeline-role" key={role.label}>
                    <p className="timeline-role__label">{role.label}</p>
                    <p className="timeline-role__detail">{role.detail}</p>
                  </div>
                ))}
              </div>
              {item.action ? (
                <>
                  {item.action.disabled || !item.action.href ? (
                    <button
                      aria-disabled="true"
                      className="timeline-role__detail project-archive-link"
                      disabled
                      type="button"
                    >
                      {item.action.label}
                    </button>
                  ) : item.action.external ? (
                    <a
                      className={actionLinkClassName}
                      href={item.action.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.action.label}
                    </a>
                  ) : (
                    <Link
                      className={actionLinkClassName}
                      href={item.action.href}
                    >
                      {item.action.label}
                    </Link>
                  )}
                  {item.action.mobileDisabled && !item.action.disabled && item.action.href ? (
                    <button
                      aria-disabled="true"
                      className="timeline-role__detail project-archive-link project-archive-link--mobile-only"
                      disabled
                      type="button"
                    >
                      {item.action.mobileDisabledLabel ?? "Desktop/tablet only"}
                    </button>
                  ) : null}
                </>
              ) : null}
              {areProjects && item.details ? (
                <button
                  aria-controls={detailsId}
                  aria-expanded={isExpanded}
                  className="timeline-role__detail project-read-more"
                  onClick={() => toggleItem(item.title)}
                  type="button"
                >
                  {isExpanded ? "Read less" : "Read more"}
                </button>
              ) : null}
            </div>
            {areProjects && item.details && isExpanded ? (
              <div className="project-details" id={detailsId}>
                {item.details.carousel ? (
                  <ArchiveCarousel
                    intervalMs={item.details.carousel.intervalMs}
                    label={item.details.carousel.label}
                    slides={item.details.carousel.slides}
                  />
                ) : item.details.videoSrc ? (
                  <FadeVideo
                    aria-label={`${item.title} project demonstration`}
                    autoPlay
                    className="project-details__video"
                    controls
                    loop
                    playsInline
                    preload="metadata"
                    src={item.details.videoSrc}
                  />
                ) : (
                  <div
                    className="timeline-role__detail project-details__video-placeholder"
                    role="status"
                  >
                    Video coming soon.
                  </div>
                )}
                <p className="timeline-role__detail project-details__description">
                  {item.details.description}
                </p>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
