import type { PortfolioDetails } from "./portfolio-details";

export type ProjectMedia = {
  alt?: string;
  src: string;
  type: "image" | "video";
};

export type ProjectItem = {
  descriptor: string;
  href: string;
  media?: ProjectMedia;
  title: string;
} & PortfolioDetails;

export const projectItems: readonly ProjectItem[] = [
  {
    descriptor: "Hackathon (BloomHacks)",
    href: "https://github.com/Kevinli7673/Fleurish",
    // Set to { type: "video", src: "/projects/fleurish.mp4" } or a PNG when ready.
    media: { type: "video", src: "/projects/mp4/fleurish.mp4" },
    title: "Fleurish",
    timeline: { start: "2026" },
    highlights: [
      "Worked with a team of 7 software engineers to collaborate on website development through Agile Scrum",
      "Implemented donation integration through secure payment link generation using Venmo/Cashapp API",
    ],
    tags: ["Hackathon", "Frontend", "Product"],
  },
  {
    descriptor: "Organization Project",
    href: "https://github.com/Knights-Design-Interactive/KDI-Website",
    media: { type: "image", src: "/projects/png/kdi-website.png" },
    title: "KDI’s Website",
    timeline: { start: "2026", end: "Present" },
    highlights: [
      "Currently in development!",
    ],
    tags: ["Web Development", "Frontend", "Organization"],
  },
  {
    descriptor: "Hackathon (Project Launch ’26)",
    href: "https://github.com/project-vigil-knighthacks/vigil",
    media: { type: "video", src: "/projects/mp4/vigil.mp4" },
    title: "Vigil SIEM",
    timeline: { start: "2026" },
    highlights: [
      "Led a team of 6 software developers with Jira ticketing-system and Agile methodology",
      "Architected a local SIEM (Security Information & Event Management) dashboard platform, processing real-time events from integrated applications via API-authenticated endpoints",
    ],
    tags: ["Hackathon", "Security", "MCP"],
  },
  {
    descriptor: "Hackathon (HackUSF ’26)",
    href: "https://github.com/hackusf-2026-crisis-net/crisis-net",
    media: { type: "video", src: "/projects/mp4/crisis-net.mp4" },
    title: "Crisis-Net.tech",
    timeline: { start: "2026" },
    highlights: [
      "HackUSF 2026 winner out of 85 projects for best use of .Tech, team of 4 software developers",
      "Built a real-time disaster response dashboard serving NWS alerts across 14+ API endpoints by orchestrating a multi-agentic system of 5 Google ADK agents on a FastAPI backend",
    ],
    tags: ["Hackathon", "Frontend", "Impact"],
  },
];
