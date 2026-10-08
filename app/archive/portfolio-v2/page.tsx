import type { Metadata } from "next";

import { PortfolioHero } from "@/app/archive/portfolio-v2/_legacy/components/PortfolioHero/PortfolioHero";
import { noIndexRobots, siteDescription, siteName, sitePreviewImage, siteTitle } from "@/app/archive/portfolio-v2/_legacy/data/site";
import { homeHeroConfig } from "@/app/archive/portfolio-v2/_legacy/data/hero";

export const metadata: Metadata = {
  description: siteDescription,
  openGraph: {
    description: siteDescription,
    images: [{ alt: "Portrait of Zayne Dockery", height: 630, url: sitePreviewImage, width: 1200 }],
    locale: "en_US",
    siteName,
    title: siteTitle,
    type: "website",
    url: "/archive/portfolio-v2",
  },
  robots: noIndexRobots,
  twitter: {
    card: "summary_large_image",
    creator: "@zaynedoc",
    description: siteDescription,
    images: [sitePreviewImage],
    title: siteTitle,
  },
};

export default function HomePage() {
  return (
    <main>
      <PortfolioHero config={homeHeroConfig} />
    </main>
  );
}
