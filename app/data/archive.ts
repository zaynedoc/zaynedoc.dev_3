import type { TimelineItem } from "./work";

export const archiveItems: TimelineItem[] = [
  {
    title: "Portfolio v2",
    url: "/archive/portfolio-v2",
    urlExternal: false,
    details: {
      carousel: {
        intervalMs: 4000,
        label: "Portfolio v2 screenshot placeholders",
        slides: [
          {
            alt: "Portfolio v2 landing page with lavender artwork and oversized name lettering",
            src: "/images/archive/portfolio-archive2_1.png",
          },
          {
            alt: "Portfolio v2 work page with experience and project sections",
            src: "/images/archive/portfolio-archive2_2.png",
          },
          {
            alt: "Portfolio v2 about page with personal interests and music sections",
            src: "/images/archive/portfolio-archive2_3.png",
          },
        ],
      },
      description:
        "The first iteration of my portfolio to be designed with Figma. Although it was my favorite design of all iterations, the Next.js implementation was poorly executed and very unoptimized.",
    },
    roles: [
      {
        label: "August 2026",
        detail: "Next.js, React, TypeScript, CSS Modules, Three.js",
      },
    ],
  },
];
