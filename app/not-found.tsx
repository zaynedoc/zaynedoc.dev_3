import type { Metadata } from "next";
import { SiteNavigation } from "./components/site-navigation";

export const metadata: Metadata = {
  title: "404",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="desktop-canvas">
        <SiteNavigation />
        <section className="not-found-content" aria-labelledby="not-found-heading">
          <h1 id="not-found-heading">404</h1>
          <p>Sometimes you gotta close a door to open a window</p>
        </section>
      </div>
    </main>
  );
}
