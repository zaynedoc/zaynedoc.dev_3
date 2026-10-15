import type { MetadataRoute } from "next";
import { siteConfig } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const primaryPages: MetadataRoute.Sitemap = Object.entries(siteConfig.pages).map(([page, config]) => ({
    url: new URL(config.path, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: page === "home" ? 1 : 0.8,
  }));

  return [
    ...primaryPages,
    {
      url: new URL("/works/portfolio-v2", siteConfig.url).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
