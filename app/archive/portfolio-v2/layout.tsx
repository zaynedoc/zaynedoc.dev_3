import type { Metadata } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";

import { BrowserThemeColor } from "./_legacy/components/BrowserThemeColor/BrowserThemeColor";
import { InvertedCursor } from "./_legacy/components/InvertedCursor/InvertedCursor";
import { LenisScroll } from "./_legacy/components/LenisScroll/LenisScroll";
import { PageReveal } from "./_legacy/components/PageReveal/PageReveal";
import { SiteHeader } from "./_legacy/components/SiteHeader/SiteHeader";
import styles from "./portfolio-v2.module.css";

const zalandoSemiExpanded = localFont({
  src: "./_legacy/font/ZalandoSans-SemiExpanded.ttf",
  variable: "--font-zalando-semi-expanded",
});

const zalandoExpanded = localFont({
  src: [
    {
      path: "./_legacy/font/ZalandoSans-Expanded.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "./_legacy/font/ZalandoSans-ExpandedItalic.ttf",
      style: "italic",
      weight: "400",
    },
  ],
  variable: "--font-zalando-expanded",
});

const zalandoExpandedExtraBold = localFont({
  src: "./_legacy/font/ZalandoSansExpanded-ExtraBold.ttf",
  variable: "--font-zalando-expanded-extra-bold",
  weight: "800",
});

export const metadata: Metadata = {
  description: "The preserved second version of zaynedoc.dev, including its original interactive product pages.",
  robots: {
    follow: false,
    googleBot: {
      follow: false,
      index: false,
      noarchive: true,
    },
    index: false,
    nocache: true,
  },
  title: {
    default: "Portfolio v2 archive",
    template: "%s | Portfolio v2 archive",
  },
};

export default function PortfolioV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${styles.shell} ${zalandoSemiExpanded.variable} ${zalandoExpanded.variable} ${zalandoExpandedExtraBold.variable}`}
    >
      <PageReveal />
      <SiteHeader />
      {children}
      <BrowserThemeColor />
      <InvertedCursor />
      <LenisScroll />
    </div>
  );
}
