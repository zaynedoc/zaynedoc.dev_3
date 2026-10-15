export type AlbumVisibility = "show" | "hide";

export type AlbumOverride = {
  /** Controls whether this album is included in the public carousel. */
  visibility?: AlbumVisibility;
  /** Optional presentation overrides for WMPL metadata. */
  id?: string;
  title?: string;
  artist?: string;
  coverSrc?: string;
  coverAlt?: string;
  releaseDate?: string;
  format?: string;
  trackCount?: number;
  musicBrainzReleaseId?: string;
  pressing?: {
    matrixCode: string;
    version: "Regular" | "Limited" | "First Press";
  };
};

type AlbumSettings = {
  /** Used for newly imported albums without curated metadata or an override. */
  defaultVisibility: AlbumVisibility;
  /** Keys are WMPL album titles. Matching ignores capitalization and spacing. */
  albums: Record<string, AlbumOverride>;
};

export const albumSettings: AlbumSettings = {
  // Change this to "hide" if new WMPL albums should require manual approval.
  defaultVisibility: "show",

  albums: {
    "Wolf": { visibility: "hide" },
    "Starboy": { visibility: "hide" },
    // Add only the albums you want to customize. Examples:
    // "Parousia": { visibility: "hide" },
    // "Quietus Ray": {
    //   visibility: "show",
    //   coverSrc: "/images/albums/quietus-ray.webp",
    //   coverAlt: "Quietus Ray album cover",
    // },
  },
};
