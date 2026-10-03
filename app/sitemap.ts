import type { MetadataRoute } from "next";
import { siteConfig } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(siteConfig.pages).map(([page, config]) => ({
    url: new URL(config.path, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: page === "home" ? 1 : 0.8,
  }));
}
