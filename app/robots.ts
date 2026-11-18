import type { MetadataRoute } from "next";
import { siteConfig } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Twitterbot", "facebookexternalhit", "Facebot", "LinkedInBot", "Slackbot-LinkExpanding", "Discordbot"],
        allow: ["/", "/library"],
        disallow: ["/resume", "/Zayne_Dockery_Resume.pdf"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/resume", "/library", "/Zayne_Dockery_Resume.pdf"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
