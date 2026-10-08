import { getMediaAssetByKey, getPageAssetByKey, getProjectAssetByName } from "./publicAssets";
import { portfolioV2Path } from "../lib/archivePath";

export type CoreSitePageKey = "home" | "about" | "dashboard";

export interface CoreSitePage {
  assetKey: CoreSitePageKey;
  title: string;
  link: string;
  details: string;
  accentColor: string;
}

export const coreSitePages: CoreSitePage[] = [
  {
    assetKey: "home",
    title: "Home",
    link: portfolioV2Path(),
    details: "The main landing page.",
    accentColor: "#64c8ff",
  },
  {
    assetKey: "about",
    title: "About",
    link: portfolioV2Path("/about"),
    details: "Learn more about me.",
    accentColor: "#a78bfa",
  },
  {
    assetKey: "dashboard",
    title: "Dashboard",
    link: portfolioV2Path("/dashboard"),
    details: "My projects and favorite media.",
    accentColor: "#34d399",
  },
];

type RecommendationAssetSource =
  | { type: "project"; key: string }
  | { type: "page"; key: string }
  | { type: "media"; key: string };

export interface StreamRecommendation {
  title: string;
  channel: string;
  views: string;
  time: string;
  gif: string | null;
  still: string | null;
  href: string;
}

interface StreamRecommendationSeed {
  title: string;
  channel: string;
  views: string;
  time: string;
  href: string;
  assetSource: RecommendationAssetSource;
}

const STREAM_RECOMMENDATION_SEEDS: StreamRecommendationSeed[] = [
  {
    title: "Vigil: Building a SIEM from Scratch",
    channel: "zaynedoc",
    views: "2.1K views",
    time: "3:42:17",
    href: "https://github.com/project-vigil-knighthacks/vigil",
    assetSource: { type: "project", key: "Vigil SIEM" },
  },
  {
    title: "Impacthub: Workout Tracker Full Build",
    channel: "zaynedoc",
    views: "874 views",
    time: "1:28:05",
    href: "https://github.com/zaynedoc/impacthub",
    assetSource: { type: "project", key: "Impacthub" },
  },
  {
    title: "1118: What Yume Nikki Wasn't (it's all TypeScript!?)",
    channel: "zaynedoc",
    views: "3.4K views",
    time: "5:11:33",
    href: portfolioV2Path("/1118"),
    assetSource: { type: "page", key: "1118" },
  },
  {
    title: "i made a threat detection webapp because i got paranoid",
    channel: "zaynedoc",
    views: "1.5K views",
    time: "2:05:42",
    href: "https://github.com/zaynedoc/zed-siem",
    assetSource: { type: "project", key: "ZED-SIEM" },
  },
  {
    title: "VASA's Website Redesign",
    channel: "zaynedoc",
    views: "612 views",
    time: "58:20",
    href: "https://www.vasaphilanthropy.org/",
    assetSource: { type: "project", key: "VASA's Website" },
  },
  {
    title: "[Playlist] calm luh playlist: bwep",
    channel: "Divexi",
    views: "7.1k views",
    time: "2:31:52",
    href: "https://music.youtube.com/playlist?list=PLfHpR54hZWNrqsckLyUYEUXWijXHwrxrr",
    assetSource: { type: "media", key: "bwep.png" },
  },
  {
    title: "The coolest Roblox game you haven't herad of",
    channel: "zaynedoc",
    views: "10.1K views",
    time: "47:12",
    href: "https://www.roblox.com/games/17610203181/Masters-Degree-of-Time",
    assetSource: { type: "project", key: "Master's Degree of Time" },
  },
  {
    title: "My Old Portfolio Design That I Scrapped A Month Later",
    channel: "zaynedoc",
    views: "4.7K views",
    time: "4:22:08",
    href: portfolioV2Path(),
    assetSource: { type: "project", key: "Legacy Portfolio" },
  },
];

function resolveRecommendationAssets(source: RecommendationAssetSource) {
  if (source.type === "project") return getProjectAssetByName(source.key);
  if (source.type === "page") return getPageAssetByKey(source.key);
  return getMediaAssetByKey(source.key);
}

export const streamRecommendations: StreamRecommendation[] = STREAM_RECOMMENDATION_SEEDS.map((seed) => {
  const assets = resolveRecommendationAssets(seed.assetSource);

  return {
    title: seed.title,
    channel: seed.channel,
    views: seed.views,
    time: seed.time,
    href: seed.href,
    gif: assets?.gif ?? null,
    still: assets?.still ?? null,
  };
});
