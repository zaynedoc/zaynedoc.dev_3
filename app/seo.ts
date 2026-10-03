import type { Metadata } from "next";

export const siteConfig = {
  name: "Zayne Dockery",
  siteName: "zaynedoc.dev",
  url: "https://zaynedoc.dev",
  defaultDescription:
    "Portfolio of Zayne Dockery, a developer, ambassador, and undergraduate focused on UX/UI, DevOps, and application security.",
  pages: {
    home: {
      path: "/",
      description:
        "Portfolio of Zayne Dockery, a developer, ambassador, and undergraduate focused on UX/UI, DevOps, and application security.",
    },
    work: {
      path: "/work",
      description:
        "Explore Zayne Dockery’s software engineering experience, community roles, and selected development projects.",
    },
    me: {
      path: "/me",
      description:
        "Learn more about Zayne Dockery, his interests, Genesis Coupe, and CD album collection.",
    },
  },
  socialLinks: [
    "https://github.com/zaynedoc",
    "https://www.figma.com/@zaynedoc",
    "https://www.linkedin.com/in/zaynedoc/",
  ],
} as const;

export type PageName = keyof typeof siteConfig.pages;

export function pageTitle(page: PageName) {
  return `${siteConfig.name} (${page})`;
}

export function createPageMetadata(page: PageName): Metadata {
  const pageConfig = siteConfig.pages[page];
  const title = pageTitle(page);

  return {
    title: {
      absolute: title,
    },
    description: pageConfig.description,
    alternates: {
      canonical: pageConfig.path,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageConfig.path,
      siteName: siteConfig.siteName,
      title,
      description: pageConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: pageConfig.description,
    },
  };
}

export const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    sameAs: siteConfig.socialLinks,
    knowsAbout: [
      "Software development",
      "UX/UI design",
      "DevOps",
      "Application security",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: siteConfig.url,
    description: siteConfig.defaultDescription,
    inLanguage: "en-US",
  },
];
