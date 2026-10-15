export interface PublicAssetSet {
  still?: string;
  gif?: string;
  video?: string;
  szgVideo?: string;
}

export interface SocialAssetSet extends PublicAssetSet {
  icon?: string;
}

const PROJECT_ASSETS_BY_IMAGE: Record<string, PublicAssetSet> = {
  "crisis-net.jpg": {
    still: "/images/crisis-net.jpg",
    gif: "/images/gifs/projects/crisis-net.gif",
    video: "/videos/projects/crisis-net.mp4",
  },
  "vigil.png": {
    still: "/images/projects/vigil.png",
    gif: "/images/gifs/projects/vigil.gif",
    video: "/videos/projects/vigil.mp4",
  },
  "impacthub.png": {
    still: "/images/projects/impacthub.png",
    gif: "/images/gifs/projects/impacthub.gif",
    video: "/videos/projects/impacthub.mp4",
  },
  "zed-siem.png": {
    still: "/images/projects/zed-siem.png",
    gif: "/images/gifs/projects/zed-siem.gif",
    video: "/videos/projects/zed-siem.mp4",
  },
  "vasa.png": {
    still: "/images/projects/vasa.png",
    gif: "/images/gifs/projects/vasa.gif",
    video: "/videos/projects/vasa.mp4",
  },
  "legacyportfolio.png": {
    still: "/images/projects/legacyportfolio.png",
    gif: "/images/gifs/projects/legacyportfolio.gif",
    video: "/videos/projects/legacyPortfolio.mp4",
  },
  "roblox.png": {
    still: "/images/projects/roblox.png",
    gif: "/images/gifs/projects/robloxGame.gif",
    video: "/videos/projects/robloxGame.mp4",
  },
};

const PROJECT_IMAGE_BY_NAME: Record<string, string> = {
  "Crisis-Net": "crisis-net.jpg",
  "Vigil SIEM": "vigil.png",
  "Vigil: Open-Source SIEM": "vigil.png",
  "Impacthub": "impacthub.png",
  "ZED-SIEM": "zed-siem.png",
  "VASA's Website": "vasa.png",
  "VASA Philanthropy Website": "vasa.png",
  "Legacy Portfolio": "legacyportfolio.png",
  "Master's Degree of Time": "roblox.png",
};

const SITE_ASSETS_BY_KEY: Record<string, PublicAssetSet> = {
  home: {
    still: "/images/home.png",
    video: "/smg-assets/mp4/home.mp4",
  },
  about: {
    still: "/images/about.png",
    video: "/smg-assets/mp4/about.mp4",
  },
  dashboard: {
    still: "/images/dashboard.png",
    video: "/smg-assets/mp4/dashboard.mp4",
  },
};

const PAGE_ASSETS_BY_KEY: Record<string, PublicAssetSet> = {
  photos: {
    still: "/images/photos.png",
    gif: "/images/gifs/media/photos.gif",
    video: "/videos/media/photos.mp4",
    szgVideo: "/smg-assets/mp4/photos.mp4",
  },
  szg: {
    still: "/og/szg.jpg",
    gif: "/images/gifs/media/szg.gif",
    video: "/videos/media/szg.mp4",
  },
  study: {
    still: "/images/study.png",
    gif: "/images/gifs/projects/study.gif",
    video: "/videos/projects/study.mp4",
    szgVideo: "/smg-assets/mp4/study.mp4",
  },
  1118: {
    still: "/images/1118.png",
    gif: "/images/gifs/projects/1118.gif",
    video: "/videos/projects/1118.mp4",
    szgVideo: "/smg-assets/mp4/1118.mp4",
  },
  limbo: {
    still: "/images/limbo.png",
    video: "/smg-assets/mp4/limbo.mp4",
  },
  wanted: {
    still: "/images/wanted.png",
    video: "/smg-assets/mp4/wanted.mp4",
  },
  stream: {
    still: "/images/stream.png",
    video: "/smg-assets/mp4/stream.mp4",
  },
  workouts: {
    still: "/images/workouts.png",
    video: "/smg-assets/mp4/workouts.mp4",
  },
  pro: {
    still: "/images/pro.png",
    video: "/smg-assets/mp4/pro.mp4",
  },
};

const SOCIAL_ASSETS_BY_IMAGE: Record<string, SocialAssetSet> = {
  "github.png": {
    still: "/images/media/github.png",
    icon: "/images/icons/githubIcon.png",
  },
  "linkedin.png": {
    still: "/images/media/linkedin.png",
    icon: "/images/icons/linkedinIcon.png",
  },
  "instagram.png": {
    still: "/images/media/instagram.png",
    icon: "/images/icons/instagramIcon.png",
  },
  "roblox.png": {
    still: "/images/media/roblox.png",
    icon: "/images/icons/robloxIcon.png",
  },
};

const MEDIA_ASSETS_BY_KEY: Record<string, PublicAssetSet> = {
  "light.gif": {
    gif: "/images/gifs/media/light.gif",
    video: "/videos/media/light.mp4",
  },
  "nasa.gif": {
    gif: "/images/gifs/media/nasa.gif",
    video: "/videos/media/nasa.mp4",
  },
  "dontreplaytheboredom.gif": {
    gif: "/images/gifs/media/dontreplaytheboredom.gif",
    video: "/videos/media/dontreplaytheboredom.mp4",
  },
  "darkheart.gif": {
    gif: "/images/gifs/media/darkheart.gif",
    video: "/videos/media/darkheart.mp4",
  },
  "bwep.png": {
    still: "/images/media/bwep.png",
  },
  "previewcoincidence.jpg": {
    still: "/images/previewcoincidence.jpg",
  },
  "day.jpg": {
    still: "/images/day.jpg",
  },
};

export function getProjectAssetByImage(image: string): PublicAssetSet | undefined {
  return PROJECT_ASSETS_BY_IMAGE[image];
}

export function getProjectAssetByName(name: string): PublicAssetSet | undefined {
  const image = PROJECT_IMAGE_BY_NAME[name];
  return image ? PROJECT_ASSETS_BY_IMAGE[image] : undefined;
}

export function getSiteAssetByKey(key: string): PublicAssetSet | undefined {
  return SITE_ASSETS_BY_KEY[key];
}

export function getPageAssetByKey(key: string): PublicAssetSet | undefined {
  return PAGE_ASSETS_BY_KEY[key];
}

export function getSocialAssetByImage(image: string): SocialAssetSet | undefined {
  return SOCIAL_ASSETS_BY_IMAGE[image];
}

export function getMediaAssetByKey(key: string): PublicAssetSet | undefined {
  return MEDIA_ASSETS_BY_KEY[key];
}
