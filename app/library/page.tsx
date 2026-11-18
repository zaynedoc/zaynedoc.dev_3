import type { Metadata } from "next";
import { albumSettings } from "../data/album-settings";
import libraryOg from "../data/library-og.generated.json";
import overviewData from "../data/library-overview.generated.json";
import listeningData from "../data/listening-stats.generated.json";
import { noIndexRobots, siteConfig } from "../seo";
import LibraryView from "./library-view";

const title = "Music Library | Zayne Dockery";
const albumCount = listeningData.albums.length;
const description = `Browse ${albumCount} albums in Zayne Dockery's physical music collection, with track listings and listening counts.`;
const image = {
  url: `/images/library-og.png?v=${libraryOg.version}`,
  width: 1200,
  height: 630,
  alt: libraryOg.alt,
};

export const metadata: Metadata = {
  title: "Music Library",
  description,
  robots: noIndexRobots,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/library",
    siteName: siteConfig.siteName,
    title,
    description,
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

function normalizeAlbumTitle(title: string) {
  return title.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export default function LibraryPage() {
  const settingsByAlbum = new Map(
    Object.entries(albumSettings.albums).map(([title, settings]) => [normalizeAlbumTitle(title), settings]),
  );
  const albums = listeningData.albums.map((album) => {
    const settings = settingsByAlbum.get(normalizeAlbumTitle(album.album));
    return {
      ...album,
      notes: settings?.notes?.trim() ? settings.notes : undefined,
      overviewFeatured: settings?.overviewFeatured === true,
    };
  });

  return <LibraryView albums={albums} overview={overviewData} />;
}
