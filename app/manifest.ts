import type { MetadataRoute } from "next";
import { siteConfig } from "./seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.siteName,
    description: siteConfig.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#11182d",
    theme_color: "#11182d",
  };
}
