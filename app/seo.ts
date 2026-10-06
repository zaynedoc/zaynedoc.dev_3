import type { Metadata } from "next";

export const siteConfig = {
  name: "Zayne Dockery",
  siteName: "zaynedoc.dev",
  url: "https://zaynedoc.dev",
  defaultDescription:
    "Portfolio of Zayne Dockery, a developer, ambassador, and undergraduate focused on UX/UI, DevOps, and application security.",
  socialImage: {
    path: "/images/social-thumbnail.png",
    width: 1200,
    height: 630,
    alt: "Zayne Dockery — developer, ambassador, and undergraduate",
  },
  pages: {
    home: {
      path: "/",
      description:
        "Portfolio of Zayne Dockery, a developer, ambassador, and undergraduate focused on UX/UI, DevOps, and application security.",
    },
    roles: {
      path: "/roles",
      description:
        "Explore Zayne Dockery’s software engineering experience and community roles.",
    },
    works: {
      path: "/works",
      description:
        "Explore selected software, security, mobile, and web projects created by Zayne Dockery.",
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
      images: [
        {
          url: siteConfig.socialImage.path,
          width: siteConfig.socialImage.width,
          height: siteConfig.socialImage.height,
          alt: siteConfig.socialImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: pageConfig.description,
      images: [
        {
          url: siteConfig.socialImage.path,
          width: siteConfig.socialImage.width,
          height: siteConfig.socialImage.height,
          alt: siteConfig.socialImage.alt,
        },
      ],
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
