import type { Metadata } from "next";
import "./globals.css";
import { noIndexRobots, siteConfig, structuredData } from "./seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.siteName,
  title: {
    default: siteConfig.pages.home.title,
    template: "%s | Zayne Dockery",
  },
  description: siteConfig.defaultDescription,
  keywords: [
    "Zayne Dockery",
    "software developer",
    "UX/UI",
    "DevOps",
    "application security",
    "portfolio",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  robots: noIndexRobots,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
