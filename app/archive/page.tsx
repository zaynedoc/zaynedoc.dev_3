import { MosaicDecoration } from "../components/mosaic-decoration";
import { SiteNavigation } from "../components/site-navigation";
import { WorkTimeline } from "../components/work-timeline";
import { archiveItems } from "../data/archive";

export default function ArchivePage() {
  return (
    <main className="interior-page" id="top">
      <div className="desktop-canvas">
        <SiteNavigation sticky />
        <div className="content-stack">
          <section className="timeline-section" aria-labelledby="archive-heading">
            <header className="content-section-heading">
              <h1 id="archive-heading">Archive</h1>
              <p>Previous portfolio builds and experiments, preserved in place</p>
            </header>
            <WorkTimeline initiallyExpanded items={archiveItems} projects />
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
