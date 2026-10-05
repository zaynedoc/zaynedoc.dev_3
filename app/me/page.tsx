import { AlbumCollection } from "../components/album-collection";
import { FadeImage } from "../components/fade-image";
import { MosaicDecoration } from "../components/mosaic-decoration";
import { SiteNavigation } from "../components/site-navigation";
import { albums } from "../data/albums";
import { projects } from "../data/work";

export default function MePage() {
  const wmplWrapUrl = projects.find(({ title }) => title === "WMPL Wrap")?.url;

  if (!wmplWrapUrl) {
    throw new Error("WMPL Wrap must have a URL in the work dataset.");
  }

  return (
    <main className="interior-page" id="top">
      <div className="desktop-canvas">
        <SiteNavigation sticky />
        <div className="content-stack">
          <section className="accent-section" aria-labelledby="who-heading">
            <h1 id="who-heading">Who Am I?</h1>
            <div className="accent-section__body">
              <p>Self-proclaimed “buff wasian dev.”</p>
              <p>I specialize in UX/UI, DevOps, and AppSec.</p>
              <p>
                You’ll find me around the UCF area.
                <br className="responsive-copy-break" />{" "}
                I’m known to hang out at Knight Hacks often.
              </p>
            </div>
          </section>

          <section className="about-section" aria-labelledby="genesis-heading">
            <header className="accent-section">
              <h1 id="genesis-heading">My Genesis Coupe</h1>
              <div className="accent-section__body accent-section__body--continuous">
                <p>
                  Here’s some cool photos of my car,
                  <br className="responsive-copy-break" />{" "}
                  2014 Hyundai Genesis Coupe 2.0T Premium,
                  <br className="responsive-copy-break" />{" "}
                  or “Genny” for short lol.
                </p>
              </div>
            </header>
            <div className="car-gallery" aria-label="Photos of Zayne's Genesis Coupe">
              <div className="car-gallery__row">
                <FadeImage
                  alt="Silver Genesis Coupe at sunset"
                  className="car-gallery__sunset"
                  height={450}
                  loading="lazy"
                  sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1600px) 46vw, 600px"
                  src="/images/genesis-coupe-sunset.webp"
                  width={600}
                />
                <FadeImage
                  alt="Silver Genesis Coupe beneath storm clouds"
                  className="car-gallery__storm"
                  height={450}
                  loading="lazy"
                  sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1600px) 50vw, 675px"
                  src="/images/genesis-coupe-storm-clouds.webp"
                  width={675}
                />
              </div>
              <FadeImage
                alt="Silver Genesis Coupe in golden-hour light"
                className="car-gallery__golden-hour"
                height={402}
                loading="lazy"
                sizes="(max-width: 700px) calc(100vw - 40px), 600px"
                src="/images/genesis-coupe-golden-hour.webp"
                width={600}
              />
            </div>
          </section>

          <section className="about-section" aria-labelledby="albums-heading">
            <header className="accent-section">
              <h1 id="albums-heading">Collecting CD Albums</h1>
              <div className="accent-section__body">
                <p>A recent hobby I picked up was collecting CDs.</p>
                <p>
                  My collection’s most common genre is J-pop/rock,
                  <br className="responsive-copy-break" />{" "}
                  and most of my albums are made by Utaite “Eve.”
                </p>
                <p>
                  A resultant of this recent hobby of mine was the
                  <br className="responsive-copy-break" />{" "}
                  “Windows Media Player Legacy (WMPL) {" "}
                  <a
                    className="accent-section__inline-link"
                    href={wmplWrapUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Wrap
                  </a>”
                  <br className="responsive-copy-break" />{" "}
                  project, allowing me to track logistics of my
                  <br className="responsive-copy-break" />{" "}
                  most listened to CD albums!
                </p>
                <p>
                  The data presented  below is tied to actual
                  <br className="responsive-copy-break" />{" "}
                  metadata stored on my WMPL instance. I ran a
                  <br className="responsive-copy-break" />{" "}
                  Python script that updates the stats periodically.
                </p>
              </div>
            </header>

            <AlbumCollection albums={albums} />
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
