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
    url: "https://www.figma.com/",
  },
  {
    title: "Bank of New York",
    roles: [
      { label: "Software Engineer Intern", detail: "Jul. 2026 – Present" },
    ],
    url: "https://www.bny.com/",
  },
  {
    title: "Knight Design Interactive",
    roles: [{ label: "Web Developer", detail: "Aug. 2026 – Present" }],
    url: "https://www.instagram.com/kdi.club/",
  },
  {
    title: "Knight Hacks",
    roles: [
      { label: "Mentor", detail: "Sep. 2026 – Present" },
      { label: "Outreach Team", detail: "Jan. 2026 – Present" },
      { label: "Project Lead", detail: "Jan. – Apr. 2026" },
    ],
    url: "https://club.knighthacks.org/",
  },
  {
    title: "Moonstone Games",
    roles: [
      { label: "QA Tester", detail: "Oct. 2022 – Nov. 2024" },
      { label: "Contributor", detail: "May 2023" },
    ],
    url: "https://www.linkedin.com/company/moonstonegames/",
  },
];

export const projects: TimelineItem[] = [
  {
    title: "Vigil SIEM",
    roles: [
      {
        label: "Knight Hacks’ Project Launch 2026",
        detail: "Next.js, TypeScript, Python, FastAPI, SQLite",
      },
    ],
    url: "https://github.com/project-vigil-knighthacks/vigil",
  },
  {
    title: "Crisis-Net.tech",
    roles: [
      {
        label: "Winner at HackUSF 2026",
        detail: "Next.js, FastAPI, Google ADK, Gemini, Vercel",
      },
    ],
    url: "https://github.com/hackusf-2026-crisis-net/crisis-net",
  },
  {
    title: "Fleurish",
    roles: [
      {
        label: "Knight Hacks' Bloom Knights 2026",
        detail: "React Native, Expo Go, Supabase, Postgres",
      },
    ],
    url: "https://github.com/Kevinli7673/Fleurish",
  },
  {
    title: "WMPL Wrap",
    roles: [
      {
        label: "Logistics tracker for Legacy WMP",
        detail: "C#, PowerShell, Azure (Artifact Signing)",
      },
    ],
    url: "https://github.com/zaynedoc/WMPL-Wrap",
  },
];
