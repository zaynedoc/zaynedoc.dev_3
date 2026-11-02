export type AlbumVisibility = "show" | "hide";

export type AlbumOverride = {
  /** Controls whether this album is included in the public carousel. */
  visibility?: AlbumVisibility;
  /**
   * Displays this track as the favorite when its title matches imported WMPL
   * data. Matching ignores capitalization, Unicode width, and extra spacing.
   */
  favoriteTrackTitle?: string;
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
  defaultVisibility: AlbumVisibility;
  albums: Record<string, AlbumOverride>;
};

export const albumSettings: AlbumSettings = {
  defaultVisibility: "show",

  albums: {
    /* EXAMPLE OVERRIDE ENTRY

    "Parousia": {
      visibility: "{show ? hide}",
      favoriteTrackTitle: "Ascension to Heaven"
      coverSrc: "/images/albums/quietus-ray.webp",
      coverAlt: "Parousia album cover",
    },

    */

    // HIDDEN

    "Wolf": { 
      visibility: "hide" 
    },

    "Starboy": { 
      visibility: "hide" 
    },

    "House of Balloons": { 
      visibility: "hide"
    },

    "Christmas": {
      visibility: "hide"
    },

    // TRACK OVERRIDES

    "Minecraft - Volume Alpha": { 
      favoriteTrackTitle: "Clark"
    },

    "Minecraft Volume Beta": {
      favoriteTrackTitle: "Dreiton"
    },

    "Vessel": { 
      favoriteTrackTitle: "Ode to Sleep"
    },

    "THE WORLD EP. FIN: WILL": { 
      favoriteTrackTitle: "미친 폼 (Crazy Form)"
    },

    "文化": { 
      favoriteTrackTitle: "Kaishingeki (会心劇)"
    },

    "廻人": { 
      favoriteTrackTitle: "Taikutsuwo Saienshinaide (退屈を再演しないで)"
    },

    "Ao": { 
      favoriteTrackTitle: "TEIKOKU SHOUJO"
    },

    "Wonder Word": { 
      favoriteTrackTitle: "Yoru wo koero (夜を超えろ)"
    },

    "The Chaos Chapter: FIGHT OR ESCAPE": { 
      favoriteTrackTitle: "Frost"
    },

    "狂言": { 
      favoriteTrackTitle: "Kagakushu (過学習)"
    },

    "OFFICIAL NUMBER": { 
      favoriteTrackTitle: "Perfect seimei (パーフェクト生命)"
    },

    "Round Robin": { 
      favoriteTrackTitle: "Hantaishasen (反対車線)"
    },

    "Smile": { 
      favoriteTrackTitle: "Inochi No Tabekata (いのちの食べ方)"
    },

    "Blurryface": { 
      favoriteTrackTitle: "The Judge"
    },

    "Trench": { 
      favoriteTrackTitle: "Morph"
    },

    "IGOR": { 
      favoriteTrackTitle: "BOYFRIEND"
    },

    "play with earth! 0.03": { 
      favoriteTrackTitle: "slow dive"
    },

    "Parousia": { 
      favoriteTrackTitle: "Ascension to Heaven"
    },

    "Quietus Ray": {
      favoriteTrackTitle: "Bad Elixir"
    },

    "World Fragments": {
      favoriteTrackTitle: "ANiMA"
    },

    "ウェザーステーション": {
      favoriteTrackTitle: "Postshelter (ポストシェルター)"
    },
  },
};
