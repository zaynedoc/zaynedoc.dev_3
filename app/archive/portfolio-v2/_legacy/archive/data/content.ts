import { portfolioV2Path } from "../lib/archivePath";

export interface Project {
  name: string;
  startDate: string;
  endDate: string | null;
  description: string;
  techStack: string[];
  githubUrl: string;
  image: string;
}

export const projects: Project[] = [
  {
    name: "Crisis-Net",
    startDate: "Mar. 28, 2026",
    endDate: "Mar. 29, 2026",
    description:
      "[Winner @ HackUSF 2026] A multi-agentic web app for crisis management and communication, built with Next.js and Google ADK. The app features real-time updates, a user-friendly interface, and robust security measures to ensure reliable communication during emergencies.",
    techStack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Vercel", "Google ADK", "Gemini API"],
    githubUrl: "https://github.com/hackusf-2026-crisis-net/crisis-net",
    image: "crisis-net.jpg",
  },
  {
    name: "Vigil SIEM",
    startDate: "Feb. 15, 2026",
    endDate: "April 18, 2026",
    description:
      "An open-source, deployable SIEM with real-time threat detection, Sigma rule support, MITRE ATT&CK mapping, and an AI voice assistant that summarizes security posture and recommends remediation actions.",
    techStack: ["FastAPI", "SQLite", "Docker", "React", "TypeScript", "AI Integration"],
    githubUrl: "https://github.com/project-vigil-knighthacks/vigil",
    image: "vigil.png",
  },
  {
    name: "VASA's Website",
    startDate: "November 1, 2025",
    endDate: "February 1, 2026",
    description:
      "A website for the Philanthropy committee of VASA. Monetary payment system assisted by Stripe API. Used for fundraiser events to allow for seamless donations.",
    techStack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Stripe API"],
    githubUrl: "https://github.com/Vietnamese-American-Student-Association/VASA-Philanthropy",
    image: "vasa.png",
  },
  {
    name: "Impacthub",
    startDate: "Jan. 15, 2026",
    endDate: "Feb. 3, 2026",
    description:
      "A workout-tracking web app utilizing Next.js, Supabase BaaS, Stripe payments, and OpenAI API. The core of this project stemmed from personal desires to tailor a workout tracker to what I seemed important, as a lifter. Actively being worked on. An API-less demo is open, with some minor bugs.",
    techStack: ["Next.js", "TypeScript", "React", "Supabase", "Stripe API", "OpenAI API"],
    githubUrl: "https://github.com/zaynedoc/impacthub",
    image: "impacthub.png",
  },
  {
    name: "ZED-SIEM",
    startDate: "Jan. 3, 2026",
    endDate: "Jan. 20, 2026",
    description:
      "A custom-built Security Information and Event Management system featuring real-time threat detection, TOTP two-factor authentication, and live dashboard updates via SignalR, deployed on Azure Container Apps and integrated with my portfolio for automated security log ingestion.",
    techStack: ["ASP.NET Core", "Razor Pages", "C#", "SignalR", "Azure Container Apps", "Azure SQL Database", "Docker"],
    githubUrl: "https://github.com/zaynedoc/zed-siem",
    image: "zed-siem.png",
  },
  {
    name: "Legacy Portfolio",
    startDate: "Nov. 28, 2025",
    endDate: "Jan. 15, 2026",
    description:
      "An older iteration of my portfolio website built with ASP.NET Core, deployed on Azure and GitHub Actions.",
    techStack: ["ASP.NET Core", "Razor Pages", "C#", "Authentication", "Azure", "Azure SQL Database", "Entity Framework"],
    githubUrl: "https://github.com/zaynedoc/portfolio",
    image: "legacyportfolio.png",
  },
];

export interface SitePage {
  title: string;
  link: string;
  details: string;
  assetKey: string;
  startDate?: string;
  endDate?: string | null;
  techStack?: string[];
}

export const pages: SitePage[] = [
  {
    title: "Super Zayne Website",
    link: portfolioV2Path("/szg"),
    details: "Heavily inspired by Super Mario Galaxy's main menu visuals!",
    assetKey: "szg",
  },
  {
    title: "CDA Study Tools",
    link: portfolioV2Path("/study"),
    details:
      "A set of interactive tools for studying computer design/architecture, including a visualizer and simulator for the MARIE architecture.",
    assetKey: "study",
    startDate: "February 27, 2026",
    endDate: "March 1, 2026",
    techStack: ["TypeScript", "React", "CSS Modules", "Tailwind CSS", "Vercel", "Next.js"],
  },
  {
    title: "1118",
    link: portfolioV2Path("/1118"),
    details:
      "A Yume Nikki fangame developed with an in-browser level editor. The game features a large explorable world and secrets.",
    assetKey: "1118",
    startDate: "February 20, 2026",
    endDate: "February 28, 2026",
    techStack: ["TypeScript", "React", "Vercel", "API Routes", "Next.js"],
  },
  {
    title: "Limbo",
    link: portfolioV2Path("/limbo"),
    details: "The Geometry Dash Limbo key game recreated for the web.",
    assetKey: "limbo",
  },
  {
    title: "Wanted",
    link: portfolioV2Path("/wanted"),
    details: "The Super Mario 64 DS Wanted minigame ported into my website.",
    assetKey: "wanted",
  },
];

export interface Media {
  title: string;
  link: string;
  details: string;
  gif?: string;
  image?: string;
  video?: string;
}

export const media: Media[] = [
  {
    title: "Light eating a potato chip",
    link: "https://youtu.be/KC6T3_O2iWc",
    details:
      "I'm a huge fan of Death Note. I've rewatched it probably five times within the last year.",
    gif: "light.gif",
    video: "light.mp4",
  },
  {
    title: "bwep: my study playlist",
    link: "https://music.youtube.com/playlist?list=PLfHpR54hZWNrqsckLyUYEUXWijXHwrxrr",
    details:
      "My favorite study playlist that I've been using since 2023.",
    image: "bwep.png",
  },
  {
    title: "NASA by ATEEZ",
    link: "https://youtu.be/tVJBWoof09Q?list=RDtVJBWoof09Q&t=75",
    details: "I just like this song lol",
    gif: "nasa.gif",
    video: "nasa.mp4",
  },
  {
    title: "Don't Replay the Boredom",
    link: "https://www.youtube.com/watch?v=VLmlDtixbIY",
    details:
      "One of my favorite Geometry Dash maps that I created a few years ago.",
    gif: "dontreplaytheboredom.gif",
    video: "dontreplaytheboredom.mp4",
  },
  {
    title: "Do Me A Favour (feat. Kim Daniel) by The Orchard",
    link: "https://music.youtube.com/watch?v=QprIdN_v9cU&si=pK31afth6p3hNgoe",
    details: "A nice Korean indie song that I occasionally go back.",
    image: "previewcoincidence.jpg",
  },
  {
    title: "Day by The Poles",
    link: "https://music.youtube.com/watch?v=rSRmOZsjt60&si=E9d84R5ofQP7diJa",
    details: "Very niche indie song, the chorus has a really nice build up.",
    image: "day.jpg",
  }
];
