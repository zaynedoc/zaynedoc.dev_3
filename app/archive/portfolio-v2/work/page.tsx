import type { Metadata } from "next";

import { ExperienceSection } from "@/app/archive/portfolio-v2/_legacy/components/Work/ExperienceSection";
import { ProjectsSection } from "@/app/archive/portfolio-v2/_legacy/components/Work/ProjectsSection";
import { WorkMasthead } from "@/app/archive/portfolio-v2/_legacy/components/Work/WorkMasthead";
import { SiteFooter } from "@/app/archive/portfolio-v2/_legacy/components/SiteFooter/SiteFooter";
import { noIndexRobots, siteName, sitePreviewImage } from "@/app/archive/portfolio-v2/_legacy/data/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  description: "Experience and selected projects by Zayne Dockery, spanning UX/UI, software development, DevOps, and application security.",
  openGraph: {
    description: "Experience and selected projects by Zayne Dockery, spanning UX/UI, software development, DevOps, and application security.",
    images: [{ alt: "Portrait of Zayne Dockery", height: 630, url: sitePreviewImage, width: 1200 }],
    locale: "en_US",
    siteName,
    title: "Work",
    type: "website",
    url: "/archive/portfolio-v2/work",
  },
  robots: noIndexRobots,
  title: "Work",
  twitter: {
    card: "summary_large_image",
    creator: "@zaynedoc",
    description: "Experience and selected projects by Zayne Dockery, spanning UX/UI, software development, DevOps, and application security.",
    images: [sitePreviewImage],
    title: "Work",
  },
};

export default function WorkPage() {
  return (
    <main className={styles.page}>
      <WorkMasthead />
      <ExperienceSection />
      <WorkMasthead decorative />
      <ProjectsSection />
      <SiteFooter />
    </main>
  );
}
