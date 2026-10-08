import type { Metadata } from "next";

import { AboutMasthead } from "@/app/archive/portfolio-v2/_legacy/components/About/AboutMasthead";
import { AboutTransition } from "@/app/archive/portfolio-v2/_legacy/components/About/AboutTransition";
import { GenesisSection } from "@/app/archive/portfolio-v2/_legacy/components/About/GenesisSection";
import { MusicShelf } from "@/app/archive/portfolio-v2/_legacy/components/About/MusicShelf";
import { WhoAmISection } from "@/app/archive/portfolio-v2/_legacy/components/About/WhoAmISection";
import { SiteFooter } from "@/app/archive/portfolio-v2/_legacy/components/SiteFooter/SiteFooter";
import { noIndexRobots, siteName, sitePreviewImage } from "@/app/archive/portfolio-v2/_legacy/data/site";

export const metadata: Metadata = {
  description: "Learn more about Zayne Dockery: a UX/UI-focused developer interested in DevOps, application security, cars, design, and music.",
  openGraph: {
    description: "Learn more about Zayne Dockery: a UX/UI-focused developer interested in DevOps, application security, cars, design, and music.",
    images: [{ alt: "Portrait of Zayne Dockery", height: 630, url: sitePreviewImage, width: 1200 }],
    locale: "en_US",
    siteName,
    title: "About",
    type: "website",
    url: "/archive/portfolio-v2/about",
  },
  robots: noIndexRobots,
  title: "About",
  twitter: {
    card: "summary_large_image",
    creator: "@zaynedoc",
    description: "Learn more about Zayne Dockery: a UX/UI-focused developer interested in DevOps, application security, cars, design, and music.",
    images: [sitePreviewImage],
    title: "About",
  },
};

export default function AboutPage() {
  return (
    <main>
      <AboutMasthead />
      <WhoAmISection />
      <AboutTransition />
      <GenesisSection />
      <MusicShelf />
      <SiteFooter />
    </main>
  );
}
