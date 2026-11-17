import type { Metadata } from "next";
import { albumSettings } from "../data/album-settings";
import listeningData from "../data/listening-stats.generated.json";
import { noIndexRobots } from "../seo";
import LibraryView from "./library-view";

export const metadata: Metadata = {
  title: "Music Library",
  robots: noIndexRobots,
};

function normalizeAlbumTitle(title: string) {
  return title.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export default function LibraryPage() {
  const notesByAlbum = new Map(
    Object.entries(albumSettings.albums)
      .filter(([, settings]) => settings.notes?.trim())
      .map(([title, settings]) => [normalizeAlbumTitle(title), settings.notes]),
  );
  const albums = listeningData.albums.map((album) => ({
    ...album,
    notes: notesByAlbum.get(normalizeAlbumTitle(album.album)),
  }));

  return <LibraryView albums={albums} />;
}
