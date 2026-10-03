export type TimelineRole = {
  detail: string;
  label: string;
};

export type TimelineItem = {
  roles: TimelineRole[];
  title: string;
  url?: string;
};

export const experience: TimelineItem[] = [
  {
    title: "Figma",
    roles: [{ label: "Figma Campus Leader", detail: "Aug. 2026 – Present" }],
  },
  {
    title: "Bank of New York",
    roles: [
      { label: "Software Engineer Intern", detail: "Jul. 2026 – Present" },
    ],
  },
  {
    title: "Knight Design Interactive",
    roles: [{ label: "Web Developer", detail: "Aug. 2026 – Present" }],
  },
  {
    title: "Knight Hacks",
    roles: [
      { label: "Mentor", detail: "Aug. 2026 – Present" },
      { label: "Outreach Team", detail: "Jan. 2026 – Present" },
      { label: "Project Lead", detail: "Jan. – Apr. 2026" },
    ],
  },
  {
    title: "Moonstone Games",
    roles: [
      { label: "QA Tester", detail: "Oct. 2022 – Nov. 2024" },
      { label: "Contributor", detail: "May 2023" },
    ],
  },
];

export const projects: TimelineItem[] = [
  {
    title: "Fleurish",
    roles: [
      {
        label: "Knight Hacks' Bloom Knights 2026",
        detail: "React Native, Expo Go, Supabase, Postgres",
      },
    ],
  },
  {
    title: "Vigil SIEM",
    roles: [
      {
        label: "Knight Hacks’ Project Launch 2026",
        detail: "Next.js, TypeScript, Python, FastAPI, SQLite",
      },
    ],
  },
  {
    title: "Crisis-Net.tech",
    roles: [
      {
        label: "Winner at HackUSF 2026",
        detail: "Next.js, FastAPI, Google ADK, Gemini, Vercel",
      },
    ],
  },
  {
    title: "WMPL Wrap",
    roles: [
      {
        label: "Logistics tracker for Legacy WMP",
        detail: "C#, PowerShell, Azure (Artifact Signing)",
      },
    ],
  },
  {
    title: "Legacy Portfolio",
    roles: [
      { label: "Old portfolio website", detail: "ASP.NET Core, Three.js, Azure" },
    ],
  },
];
