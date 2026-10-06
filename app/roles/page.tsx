import type { Metadata } from "next";
import { MosaicDecoration } from "../components/mosaic-decoration";
import { SiteNavigation } from "../components/site-navigation";
import { WorkTimeline } from "../components/work-timeline";
import { experience } from "../data/work";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata("roles");

export default function RolesPage() {
  return (
    <main className="interior-page" id="top">
      <div className="desktop-canvas">
        <SiteNavigation sticky />
        <div className="content-stack">
          <section className="timeline-section" aria-labelledby="roles-heading">
            <header className="content-section-heading">
              <h1 id="roles-heading">Experience</h1>
              <p>My current and past roles</p>
            </header>
            <WorkTimeline items={experience} />
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
