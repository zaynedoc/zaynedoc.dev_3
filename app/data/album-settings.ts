export type AlbumVisibility = "show" | "hide";

export type AlbumOverride = {
  /** Controls whether this album is included in the public carousel. */
  visibility?: AlbumVisibility;
  /** Feature this album among the six covers on the /library overview. */
  overviewFeatured?: boolean;
  /** Optional note shown only in this album's /library detail view. */
  notes?: string;
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
    // Edit values inside each entry; data:listening adds and sorts album titles.
    // Set overviewFeatured on up to six albums. Empty slots use alphabetical albums.
    // BEGIN SORTED ALBUM SETTINGS

    "Agartha": {
      
    },

    "Ao": {
      overviewFeatured: true,
      favoriteTrackTitle: "TEIKOKU SHOUJO"
    },

    "Blurryface": {
      favoriteTrackTitle: "The Judge"
    },

    "Christmas": {
      visibility: "hide"
    },

    "COLORFUL": {
      overviewFeatured: true,
    },

    "DELTARUNE Chapter 1 OST": {

    },

    "Deltarune: Chapter 2 Soundtrack": {

    },

    "House of Balloons": {
      visibility: "hide"
    },

    "IGOR": {
      favoriteTrackTitle: "BOYFRIEND"
    },

    "Kiki's Delivery Service Soundtrack Music Collection": {},

    "Laputa: Castle in the Sky Soundtrack -The Mystery of the Levitation Stone-": {},

    "Minecraft - Volume Alpha": {
      favoriteTrackTitle: "Clark"
    },

    "Minecraft Volume Beta": {
      favoriteTrackTitle: "Dreiton",
      notes: "Man I love Dreiton, I can't describe how unearthly that track is.\n\nI give this album a solid 9.8/10, though I feel as if much of that rating comes from nostalgia bias."
    },

    "My Neighbor Totoro (Original Soundtrack)": {},

    "Nausicaä of the Valley of the Wind Soundtrack": {},

    "OFFICIAL NUMBER": {
      favoriteTrackTitle: "Perfect seimei (パーフェクト生命)"
    },

    "Parousia": {
      overviewFeatured: true,
      favoriteTrackTitle: "Ascension to Heaven",
      notes: "I'm not the biggest proponent of EDM, but this album is just somethin else bro, a mix of piano and insane dubstep is something unheard of, especially for 2011. Unfortunately, the version I have is the 2015 re-release of this album, but still incredibly happy that I bought this for only $15 on Suruga-ya when people scalp this album for over >$100 on Ebay lol.\n\nFavorites from this album are 'Ascension to Heaven,' 'Parousia,' and 'Freedom Dive.' I actually stemmed my online pseudonym from 2017 from this album. About 9.6/10, I like jazz."
    },

    "play with earth! 0.03": {
      favoriteTrackTitle: "slow dive"
    },

    "Porco Rosso Soundtrack": {},

    "Quietus Ray": {
      favoriteTrackTitle: "Bad Elixir"
    },

    "Round Robin": {
      favoriteTrackTitle: "Hantaishasen (反対車線)"
    },

    "SHUFFLE": {},

    "Smile": {
      favoriteTrackTitle: "Inochi No Tabekata (いのちの食べ方)"
    },

    "Solution": {
      notes: "Owning this album is kinda funny for me, because I've long heard all the songs on this album from just following Sou's music career since around 2022. So, when I bought this album recently (Oct. 2026), hearing all my favorites in a single collective was really refreshing. Also, this specific version has an unreleased cover of God-ish, amazing song.\n\nFavorites on this album are 'Spark Bug,' 'Jouyatou,' and 'Sakura Breeze.' Overall, 9/10."
    },

    "Starboy": {
      visibility: "hide"
    },

    "The Chaos Chapter: FIGHT OR ESCAPE": {
      favoriteTrackTitle: "Frost"
    },

    "The Legend of Zelda Breath of the Wild Original Soundtrack (ゼルダの伝説 ブレス オブ ザ ワイルド オリジナルサウンドトラック)": {
      overviewFeatured: true,
      notes: "This has consistently been one of my favorite games of all time, if we exclude Geometry Dash lol. I fully believe that the soundtrack plays a huge role in this game, along with much of the game's sound design. Genuinely a modern-day masterpiece.\n\nI give a personal rating of about 9.6/10. Favorite track: prolly Zora's Domain. I used to listen to many of the town theme songs back in high school as background noise.",
    },

    "The Ocean Waves (海がきこえる)": {
      overviewFeatured: true,
      notes: "Generally pretty normal Japanese animated film soundtrack. I've consistently heard that not too many people like this movie compared to other Studio Ghibli films, but I personally love it for not being too fantasy-focused, even if it lacks the insane animation component. I fully recommend everyone watches this movie at least once if they like slice of life films/stories.\n\nFavorite track: easily has to be 'First Impression,' it's literally the theme I think of when I think about this movie lol.",
    },

    "THE WORLD EP. FIN: WILL": {
      favoriteTrackTitle: "미친 폼 (Crazy Form)"
    },

    "Trench": {
      favoriteTrackTitle: "Morph"
    },

    "Under Blue": {},

    "UNDERTALE": {},

    "Vessel": {
      favoriteTrackTitle: "Ode to Sleep"
    },

    "Wolf": {
      visibility: "hide"
    },

    "Wonder Word": {
      favoriteTrackTitle: "Yoru wo koero (夜を超えろ)",
      notes: "Definitely one of my more rarer-ish albums. For the longest time, I never really listened to Eve's earlier works, but this definitely helped bridge me into it, especially since I was already a fan of his other works, like 'Round Robin' and 'OFFICIAL NUMBER,' which I also have in my collection.\n\nThanks to this album, I have set my eyes on collecting a lot of his more even nicher albums (like hopefully 'einie' one day), and some albums from when he was still a part of Riot of Color.\n\nOverall, this album is pretty good, solid 8.5/10, very vocaloidy. Favorite tracks have to be either 'Yoru wo koero' or 'Senukouhanabi.'"
    },

    "World Fragments": {
      favoriteTrackTitle: "ANiMA"
    },

    "おとぎ": {},

    "アンチサイクロン": {
      overviewFeatured: true,
      notes: "Of all the albums in my collection, this one definitely cost the most when buying second-hand, even from Suruga-ya. I can see why though, inabakumori's debut album plus really good song selection.\n\nFavorite tracks include 'Secret Music', 'Lost Umbrella,' and 'Pascal Beats.' Definitely nostalgia bias since I listened to this album a lot in highschool, but a solid 9.2/10.\n\nFun fact: I got this album into my collection exactly 6 years after the initial release date, 11/17/2019 > 11/17/2026"
    },

    "ウェザーステーション": {
      favoriteTrackTitle: "Postshelter (ポストシェルター)"
    },

    "廻人": {
      favoriteTrackTitle: "Taikutsuwo Saienshinaide (退屈を再演しないで)"
    },

    "文化": {
      favoriteTrackTitle: "Kaishingeki (会心劇)"
    },

    "正しい偽りからの起床": {},

    "残夢": {},

    "狂言": {
      favoriteTrackTitle: "Kagakushu (過学習)"
    },

    "蒼": {
      overviewFeatured: true,
      notes: "One of my most favorite albums of all time, and probably my most prized album within my collection, personally (even though I bought it for $20 lol). Genuinely a 10/10 Utaite album, specifically the limited edition version, which has a few extra cover songs.\n\nFavorite tracks:'チョコレートタウン' and '帝国少女' above all, but there's practically no skips in this entire EP."
    },

    // END SORTED ALBUM SETTINGS
  },
};
