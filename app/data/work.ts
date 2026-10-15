export type TimelineRole = {
  detail: string;
  label: string;
};

export type TimelineItem = {
  action?: {
    disabled?: boolean;
    external?: boolean;
    href?: string;
    label: string;
    mobileDisabled?: boolean;
    mobileDisabledLabel?: string;
  };
  details?: {
    carousel?: {
      intervalMs?: number;
      label: string;
      slides: {
        alt: string;
        src: string;
      }[];
    };
    description: string;
    videoSrc?: string;
  };
  roles: TimelineRole[];
  title: string;
  url?: string;
  urlExternal?: boolean;
};

const ROLE_PLACEHOLDER_IMAGES = [
  "/images/roles/role-placeholder.svg",
] as const;

function createRoleDetails(
  roleName: string,
  images: readonly string[] = ROLE_PLACEHOLDER_IMAGES,
  description = `Placeholder description for ${roleName}. Add responsibilities, selected work, and outcomes here.`,
): NonNullable<TimelineItem["details"]> {
  return {
    carousel: {
      intervalMs: 4000,
      label: `${roleName} images`,
      slides: images.map((src, index) => ({
        alt: `${roleName} image ${index + 1}`,
        src,
      })),
    },
    description,
  };
}

export const experience: TimelineItem[] = [
  {
    title: "Figma",
    details: createRoleDetails("Figma Campus Leader", [
      "/images/roles/figma1.webp",
      "/images/roles/figma2.webp",
      "/images/roles/figma3.webp",
      "/images/roles/figma4.webp",
    ], "Organizing and hosting workshops, events, and hackathon sponsorship initiatives that help 400+ students learn Figma, sharpen design and prototyping skills, and collaborate on creative, portfolio-ready projects!"),
    roles: [{ label: "Figma Campus Leader", detail: "Aug. 2026 – Present" }],
    url: "https://www.figma.com/",
  },
  {
    title: "Bank of New York",
    details: createRoleDetails("Bank of New York Software Engineer Intern", [
      "/images/roles/bny1.webp",
      "/images/roles/bny2.webp",
    ], "uilding a full-stack banking technology solution, applying DevOps practices, infrastructure fundamentals, and database systems across a collaborative, semester-long project with industry mentors."),
    roles: [
      { label: "Software Engineer Intern", detail: "Jul. 2026 – Present" },
    ],
    url: "https://www.bny.com/",
  },
  {
    title: "Knight Design Interactive",
    details: createRoleDetails("Knight Design Interactive Web Developer", [
      "/images/roles/kdi1.webp",
    ], "Architecting and converting high-fidelity prototypes to responsive Next.js websites for the club website!"),
    roles: [{ label: "Web Developer", detail: "Aug. 2026 – Present" }],
    url: "https://www.instagram.com/kdi.club/",
  },
  {
    title: "Knight Hacks",
    details: createRoleDetails("Knight Hacks", [
      "/images/roles/knighthacks1.webp",
      "/images/roles/knighthacks2.webp",
      "/images/roles/knighthacks3.webp",
      "/images/roles/knighthacks4.webp",
    ], "Coordinating with Outreach Team members to organize promotional material for our student club, while offering guidance to mentees for web dev, Figma, and student involvement in extracurriculars!"),
    roles: [
      { label: "Mentor", detail: "Sep. 2026 – Present" },
      { label: "Outreach Team", detail: "Jan. 2026 – Present" },
      { label: "Project Lead", detail: "Jan. – Apr. 2026" },
    ],
    url: "https://club.knighthacks.org/",
  },
  {
    title: "Moonstone Games",
    details: createRoleDetails("Moonstone Games", [
      "/images/roles/moonstone1.webp",
      "/images/roles/moonstone2.webp",
      "/images/roles/moonstone3.webp",
    ], "Conducted bug testing during testing sessions; led to multiple positive improvements in gameplay experience, also developed numerous logo assets!"),
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
