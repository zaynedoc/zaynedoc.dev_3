import type { Metadata } from "next";
import { MosaicDecoration } from "../components/mosaic-decoration";
import { SiteNavigation } from "../components/site-navigation";
import { WorkTimeline } from "../components/work-timeline";
import { projects } from "../data/work";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata("works");

export default function WorksPage() {
  return (
    <main className="interior-page" id="top">
      <div className="desktop-canvas">
        <SiteNavigation sticky />
        <div className="content-stack">
          <section className="timeline-section" aria-labelledby="works-heading">
            <header className="content-section-heading">
              <h1 id="works-heading">Projects</h1>
              <p>My featured works and team creations</p>
            </header>
            <WorkTimeline initiallyExpanded items={projects} projects />
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
