export type TimelineRole = {
  detail: string;
  label: string;
};

export type TimelineItem = {
  details?: {
    description: string;
    videoSrc?: string;
  };
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
    details: {
      description:
        "An open-source, deployable SIEM with real-time threat detection, Sigma rule support, MITRE ATT&CK mapping, and an AI voice assistant that summarizes security posture and recommends remediation actions.",
      videoSrc: "/videos/projects/vigil.mp4",
    },
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
    details: {
      description:
        "A real-time disaster-response dashboard that serves National Weather Service alerts through a multi-agent system of Google ADK agents and a FastAPI backend. The project won HackUSF 2026’s Best Use of .Tech award.",
      videoSrc: "/videos/projects/crisis-net.mp4",
    },
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
    details: {
      description:
        "A team-built mobile experience created for Bloom Knights 2026. I collaborated through Agile Scrum and implemented donation flows using secure Venmo and Cash App payment links.",
      videoSrc: "/videos/projects/fleurish.mp4",
    },
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
    details: {
      description:
        "A local listening-history companion for Windows Media Player Legacy. It captures read-only library snapshots and turns cumulative play counts into reports for top songs, albums, artists, and recent listening changes.",
      videoSrc: "/videos/projects/wmpl-wrap.mp4",
    },
    roles: [
      {
        label: "Logistics tracker for WMP Legacy",
        detail: "C#, PowerShell, Azure (Artifact Signing), Discord RPC",
      },
    ],
    url: "https://github.com/zaynedoc/WMPL-Wrap",
  },
  {
    title: "ImpactHub",
    details: {
      description:
        "A workout-tracking web app shaped around the training information I value as a lifter, with focused logging and progress-tracking workflows.",
      videoSrc: "/videos/projects/impacthub.mp4",
    },
    roles: [
      {
        label: "A workout tracker WebApp",
        detail: "Next.js, TypeScript, Tailwind CSS, PostgreSQL",
      },
    ],
    url: "https://github.com/zaynedoc/impacthub",
  },
];
