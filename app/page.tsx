import type { Metadata } from "next";
import { MosaicDecoration } from "./components/mosaic-decoration";
import { createPageMetadata } from "./seo";

export const metadata: Metadata = createPageMetadata("home");

const navigationLinks = [
  {
    href: "/roles",
    route: "/roles",
    description: "My current and past roles",
  },
  {
    href: "/works",
    route: "/works",
    description: "My featured projects and works",
  },
  {
    href: "/me",
    route: "/me",
    description: "Tell you more about me",
  },
  {
    href: "/archive",
    route: "/archive",
    description: "Previous website designs",
  },
];

const socialLinks = [
  { href: "https://github.com/zaynedoc", label: "GitHub" },
  { href: "https://www.figma.com/@zaynedoc", label: "Figma" },
  { href: "https://www.linkedin.com/in/zaynedoc/", label: "LinkedIn" },
];

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-canvas">
        <section className="hero" aria-labelledby="home-heading">
          <div className="hero-copy">
            <header className="section-heading">
              <h1 id="home-heading">
                Hey all, I’m <br className="home-mobile-break" />
                Zayne Dockery
              </h1>
              <p className="hero-roles">
                <span>Developer</span>
                <span>Ambassador</span>
                <span>Undergraduate</span>
              </p>
            </header>

            <nav className="route-links" aria-label="Primary navigation">
              {navigationLinks.map((link) => (
                <div className="route-link" key={link.route}>
                  <a className="route-link__route" href={link.href}>
                    {link.route}
                  </a>
                  <span className="route-link__description">
                    {link.description}
                  </span>
                </div>
              ))}
            </nav>

            <div className="social-links" aria-label="Social links">
              <span>My socials:</span>
              {socialLinks.map((link) => (
                <a
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      <MosaicDecoration className="home-mosaic" variant="home" />
    </main>
  );
}
