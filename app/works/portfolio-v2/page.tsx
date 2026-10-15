import type { Metadata } from "next";

import { PortfolioHero } from "@/app/works/portfolio-v2/_legacy/components/PortfolioHero/PortfolioHero";
import { indexableRobots, siteDescription, siteName, sitePreviewImage, siteTitle } from "@/app/works/portfolio-v2/_legacy/data/site";
import { homeHeroConfig } from "@/app/works/portfolio-v2/_legacy/data/hero";

export const metadata: Metadata = {
  description: siteDescription,
  openGraph: {
    description: siteDescription,
    images: [{ alt: "Portrait of Zayne Dockery", height: 630, url: sitePreviewImage, width: 1200 }],
    locale: "en_US",
    siteName,
    title: siteTitle,
    type: "website",
    url: "/works/portfolio-v2",
  },
  robots: indexableRobots,
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
