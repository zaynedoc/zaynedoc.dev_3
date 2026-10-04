import listeningData from "./listening-stats.generated.json";

export type MostListenedTrack = {
  artist: string;
  listens: number;
  title: string;
  url: string;
};

export type AlbumPressing = {
  matrixCode: string;
  version: "Regular" | "Limited" | "First Press";
};

export type Album = {
  artist: string;
  coverAlt: string;
  coverSrc: string;
  format: string;
  id: string;
  mostListenedTrack: MostListenedTrack | null;
  musicBrainzReleaseId: string;
  pressing: AlbumPressing;
  releaseDate: string;
  title: string;
  totalListens: number;
  trackCount: number;
  url: string;
};

type AlbumCatalogEntry = Omit<Album, "mostListenedTrack" | "totalListens" | "url"> & {
  /** Set this only when the WMP album tag differs from the displayed title. */
  listeningTitle?: string;
};

// Append another object here to add an album to the carousel.
// Album metadata was read from the tagged files in the local Music library.
const albumCatalog: AlbumCatalogEntry[] = [
  {
    id: "eve-sou-ao",
    title: "Ao",
    artist: "Eve × Sou",
    releaseDate: "2018-03-07",
    format: "Digital Media",
    trackCount: 13,
    musicBrainzReleaseId: "fe775318-36b4-43a2-bec4-c7202d423685",
    coverSrc: "/images/albums/eve-x-sou_ao.webp",
    coverAlt: "Ao album cover by Eve and Sou",
    pressing: { version: "First Press", matrixCode: "SNCL-10" },
  },
  {
    id: "tyler-the-creator-igor",
    title: "IGOR",
    artist: "Tyler, The Creator",
    releaseDate: "2019-08-23",
    format: "CD",
    trackCount: 12,
    musicBrainzReleaseId: "dafab458-d6dd-4150-89df-bbc9a335d1ad",
    coverSrc: "/images/albums/tyler-the-creator_igor.webp",
    coverAlt: "IGOR album cover by Tyler, The Creator",
    pressing: { version: "Regular", matrixCode: "19075965202" },
  },
  {
    id: "wave-to-earth-play-with-earth",
    title: "play with earth! 0.03",
    artist: "wave to earth",
    releaseDate: "2025-05-09",
    format: "CD",
    trackCount: 7,
    musicBrainzReleaseId: "5aa1a929-6d31-459b-b710-e61e852828a8",
    coverSrc: "/images/albums/wave-to-earth_play-with-earth.webp",
    coverAlt: "play with earth! 0.03 album cover by wave to earth",
    pressing: { version: "Regular", matrixCode: "19802901002" },
  },
  {
    id: "ado-kyogen",
    title: "狂言",
    artist: "Ado",
    releaseDate: "2022-01-26",
    format: "CD",
    trackCount: 14,
    musicBrainzReleaseId: "ed4e12b4-4106-4069-8e60-7e0abf6a2d77",
    coverSrc: "/images/albums/ado_kyogen.webp",
    coverAlt: "Kyogen album cover by Ado",
    pressing: { version: "Regular", matrixCode: "TYCT-60175" },
  },
  {
    id: "eve-kaizin",
    title: "廻人",
    artist: "Eve",
    releaseDate: "2022-03-16",
    format: "CD",
    trackCount: 14,
    musicBrainzReleaseId: "626680b2-63a3-4974-a2ab-8ea7810bf6b9",
    coverSrc: "/images/albums/eve_kaizin.webp",
    coverAlt: "Kaizin album cover by Eve",
    pressing: { version: "Regular", matrixCode: "TFCC-86828" },
  },
  {
    id: "eve-official-number",
    title: "OFFICIAL NUMBER",
    artist: "Eve",
    releaseDate: "2016-10-19",
    format: "CD",
    trackCount: 10,
    musicBrainzReleaseId: "845fe29b-404b-4370-80d0-c4b377684e17",
    coverSrc: "/images/albums/eve_official-number.webp",
    coverAlt: "OFFICIAL NUMBER album cover by Eve",
    pressing: { version: "Regular", matrixCode: "TEI-65" },
  },
  {
    id: "eve-otogi",
    title: "おとぎ",
    artist: "Eve",
    releaseDate: "2019-02-06",
    format: "CD",
    trackCount: 11,
    musicBrainzReleaseId: "28170aed-c919-46d1-81e9-9ad8bbcd73b7",
    coverSrc: "/images/albums/eve_otogi.webp",
    coverAlt: "Otogi album cover by Eve",
    pressing: { version: "Regular", matrixCode: "TFCC-86665" },
  },
  {
    id: "eve-round-robin",
    title: "Round Robin",
    artist: "Eve",
    releaseDate: "2015-08-16",
    format: "CD",
    trackCount: 10,
    musicBrainzReleaseId: "e1e6d72c-7c60-4018-a5bf-bc46cd00c5af",
    coverSrc: "/images/albums/eve_round-robin.webp",
    coverAlt: "Round Robin album cover by Eve",
    pressing: { version: "Regular", matrixCode: "EVE-0002" },
  },
  {
    id: "eve-wonder-word",
    title: "Wonder Word",
    artist: "Eve",
    releaseDate: "2014-08-17",
    format: "CD",
    trackCount: 7,
    musicBrainzReleaseId: "01ed8341-6562-4a94-af1a-f4a0e9950a20",
    coverSrc: "/images/albums/eve_wonder-word.webp",
    coverAlt: "Wonder Word album cover by Eve",
    pressing: { version: "Regular", matrixCode: "EVE-0001" },
  },
  {
    id: "inabakumori-weather-station",
    title: "ウェザーステーション",
    artist: "稲葉曇",
    releaseDate: "2022-03-23",
    format: "CD",
    trackCount: 11,
    musicBrainzReleaseId: "1d133f7d-62f3-463b-a631-34d332c29a11",
    coverSrc: "/images/albums/inabakumori_weather-station.webp",
    coverAlt: "Weather Station album cover by Inabakumori",
    pressing: { version: "Regular", matrixCode: "UXCL-276" },
  },
  {
    id: "the-weeknd-house-of-balloons",
    title: "House of Balloons",
    artist: "The Weeknd",
    releaseDate: "2012",
    format: "CD",
    trackCount: 10,
    musicBrainzReleaseId: "0391b278-6408-4909-8c0a-649d6f62dfb8",
    coverSrc: "/images/albums/the-weeknd_house-of-balloons.webp",
    coverAlt: "House of Balloons album cover by The Weeknd",
    pressing: { version: "Regular", matrixCode: "B0023686-02" },
  },
  {
    id: "twenty-one-pilots-blurryface",
    title: "Blurryface",
    artist: "twenty one pilots",
    releaseDate: "2015-05-28",
    format: "CD",
    trackCount: 14,
    musicBrainzReleaseId: "e5a790c9-7912-448c-9b17-29acce875463",
    coverSrc: "/images/albums/twenty-one-pilots_blurryface.webp",
    coverAlt: "Blurryface album cover by twenty one pilots",
    pressing: { version: "Regular", matrixCode: "549636-2" },
  },
  {
    id: "twenty-one-pilots-trench",
    title: "Trench",
    artist: "twenty one pilots",
    releaseDate: "2018-10-05",
    format: "CD",
    trackCount: 14,
    musicBrainzReleaseId: "dfc90d30-1530-40b6-9157-ddafeb2c8c89",
    coverSrc: "/images/albums/twenty-one-pilots_trench.webp",
    coverAlt: "Trench album cover by twenty one pilots",
    pressing: { version: "Regular", matrixCode: "574556‒2" },
  },
  {
    id: "twenty-one-pilots-vessel",
    title: "Vessel",
    artist: "twenty one pilots",
    releaseDate: "2013-01-08",
    format: "CD",
    trackCount: 12,
    musicBrainzReleaseId: "7ce9ed22-d0b9-43bc-b28b-f0fc83c54f94",
    coverSrc: "/images/albums/twenty-one-pilots_vessel.webp",
    coverAlt: "Vessel album cover by twenty one pilots",
    pressing: { version: "Regular", matrixCode: "531792-2" },
  },
  {
    id: "tyler-the-creator-wolf",
    title: "Wolf",
    artist: "Tyler, The Creator",
    releaseDate: "2013-04-02",
    format: "CD",
    trackCount: 18,
    musicBrainzReleaseId: "28b3139a-1905-4978-9004-9a170b1b64c6",
    coverSrc: "/images/albums/tyler-the-creator_wolf.webp",
    coverAlt: "Wolf album cover by Tyler, The Creator",
    pressing: { version: "Regular", matrixCode: "88765453842 DG1" },
  },
  {
    id: "zutomayo-hisohiso-banashi",
    title: "正しい偽りからの起床",
    artist: "ずっと真夜中でいいのに。",
    releaseDate: "2018-11-14",
    format: "CD",
    trackCount: 12,
    musicBrainzReleaseId: "7eba86c2-a23e-47af-b475-aa04556b0ac4",
    coverSrc: "/images/albums/zutomayo_hisohiso-banashi.webp",
    coverAlt: "Hisohiso Banashi album cover by Zutomayo",
    pressing: { version: "Regular", matrixCode: "UPCH-20497" },
  },
];

function normalizeAlbumTitle(title: string) {
  return title.normalize("NFKC").trim().toLocaleLowerCase("en");
}

function googleSearchUrl(title: string, artist: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${title} by ${artist}`)}`;
}

const listeningByAlbum = new Map(
  listeningData.albums.map((album) => [normalizeAlbumTitle(album.album), album]),
);

export const albums: Album[] = albumCatalog
  .map(({ listeningTitle, ...album }) => {
    const listening = listeningByAlbum.get(
      normalizeAlbumTitle(listeningTitle ?? album.title),
    );
    const topTrack = listening?.mostListenedTrack;

    return {
      ...album,
      mostListenedTrack: topTrack
        ? {
            ...topTrack,
            url: googleSearchUrl(topTrack.title, topTrack.artist),
          }
        : null,
      totalListens: listening?.totalListens ?? 0,
      url: googleSearchUrl(album.title, album.artist),
    };
  })
  .sort(
    (first, second) =>
      second.totalListens - first.totalListens ||
      first.title.localeCompare(second.title, undefined, { sensitivity: "base" }),
  );
