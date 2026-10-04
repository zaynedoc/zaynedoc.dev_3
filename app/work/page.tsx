"use client";

import { useState } from "react";
import { MosaicDecoration } from "../components/mosaic-decoration";
import { SiteNavigation } from "../components/site-navigation";
import { experience, projects, type TimelineItem } from "../data/work";

function Timeline({ items, projects: areProjects = false }: { items: TimelineItem[]; projects?: boolean }) {
  return (
    <div className="timeline-list">
      {items.map((item) => (
        <article className="timeline-item" key={item.title}>
          <h2 className={areProjects ? "timeline-item__title timeline-item__title--project" : "timeline-item__title"}>
            {item.url ? (
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
        </article>
      ))}
    </div>
  );
}

export default function WorkPage() {
  const [experienceExpanded, setExperienceExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  return (
    <main className="interior-page" id="top">
      <div className="desktop-canvas">
        <SiteNavigation />
        <div className="content-stack">
          <section className="timeline-section" aria-labelledby="experience-heading">
            <header className="content-section-heading">
              <h1 id="experience-heading">
                <button
                  aria-controls="experience-timeline"
                  aria-expanded={experienceExpanded}
                  className="collapse-toggle"
                  onClick={() => setExperienceExpanded((expanded) => !expanded)}
                  type="button"
                >
                  [{experienceExpanded ? "–" : "+"}] Experience
                </button>
              </h1>
              <p>My current and past roles</p>
            </header>
            <div hidden={!experienceExpanded} id="experience-timeline">
              <Timeline items={experience} />
            </div>
          </section>

          <section className="timeline-section" aria-labelledby="projects-heading">
            <header className="content-section-heading">
              <h1 id="projects-heading">
                <button
                  aria-controls="projects-timeline"
                  aria-expanded={projectsExpanded}
                  className="collapse-toggle"
                  onClick={() => setProjectsExpanded((expanded) => !expanded)}
                  type="button"
                >
                  [{projectsExpanded ? "–" : "+"}] Projects
                </button>
              </h1>
              <p>My featured works and team creations</p>
            </header>
            <div hidden={!projectsExpanded} id="projects-timeline">
              <Timeline items={projects} projects />
            </div>
          </section>

          <a className="back-to-top" href="#top">
            Back to top
          </a>
        </div>

        <MosaicDecoration className="footer-mosaic" variant="footer" />
      </div>
    </main>
  );
}
