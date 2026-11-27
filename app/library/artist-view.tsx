"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { focusGridButton } from "./keyboard-navigation";
import type { Album, Track } from "./library-view";
import styles from "./library.module.css";

type ArtistGroup = { name: string; albums: Album[] };

const trackSort = (a: Track, b: Track) =>
  (a.discNumber ?? 1) - (b.discNumber ?? 1) ||
  (a.trackNumber ?? Number.MAX_SAFE_INTEGER) - (b.trackNumber ?? Number.MAX_SAFE_INTEGER) ||
  a.title.localeCompare(b.title);

function length(seconds?: number | null) {
  if (seconds == null) return "";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function selectTrackByKeyboard(event: KeyboardEvent<HTMLDivElement>, tracks: Track[], index: number, onSelectTrack: (track: Track) => void) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelectTrack(tracks[index]);
    return;
  }
  if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0
    : event.key === "End" ? tracks.length - 1
    : index + (event.key === "ArrowDown" ? 1 : -1);
  const option = event.currentTarget.closest('[role="listbox"]')?.querySelectorAll<HTMLElement>('[role="option"]')[next];
  option?.focus();
  if (tracks[next]) onSelectTrack(tracks[next]);
}

export function ArtistView({ artists, selectedArtist, onSelectArtist, onShowArtists }: {
  artists: ArtistGroup[];
  selectedArtist: string | null;
  onSelectArtist: (name: string) => void;
  onShowArtists: () => void;
}) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const selected = artists.find((artist) => artist.name === selectedArtist);

  if (!selected) return <>
    <div className={`${styles.columnHeader} ${styles.artistGalleryHeader}`}><span>Album artist</span><span>Count</span><span>Length</span></div>
    <div className={styles.artistGalleryScroll}>
      <div className={styles.artistGallery}>
        {artists.map((artist) => <button className={styles.artistCard} key={artist.name} onClick={() => onSelectArtist(artist.name)} onKeyDown={focusGridButton} type="button" aria-label={`${artist.name}, ${artist.albums.length} ${artist.albums.length === 1 ? "album" : "albums"}`}>
          <span className={styles.artistCoverStack}>
            {artist.albums.slice(0, 4).reverse().map((album, index, covers) => <Image
              alt=""
              className={`${styles.artistStackCover} ${styles[`artistStackCover${covers.length - index - 1}`]}`}
              key={album.album}
              src={album.coverSrc ?? "/images/albums/wmp_empty.png"}
              width={86}
              height={86}
              unoptimized
            />)}
          </span>
          <span className={styles.artistCardName}>{artist.name}</span>
        </button>)}
      </div>
    </div>
  </>;

  return <div className={styles.artistMobile}>
    <button className={styles.artistBack} onClick={onShowArtists} type="button"><span aria-hidden="true">‹</span> Artists</button>
    {selected.albums.map((album) => {
      const tracks = [...album.tracks].sort(trackSort);
      const activeTrack = selectedTrack && album.tracks.includes(selectedTrack) ? selectedTrack : null;
      return <section className={styles.artistMobileAlbum} key={album.album} aria-label={album.album}>
        <div className={styles.groupTitle}><span>{album.album}</span></div>
        <div className={styles.mobileAlbumSummary}>
          <Image alt={album.coverAlt ?? `${album.album} album cover`} src={album.coverSrc ?? "/images/albums/wmp_empty.png"} width={96} height={96} unoptimized />
          <div className={styles.mobileAlbumText}>
            <strong>{album.album}</strong><span>{album.artist}</span>
            <span>Catalog {album.catalogNumbers && album.catalogNumbers.length > 1 ? "Nos." : "No."}:</span>
            {(album.catalogNumbers?.length ? album.catalogNumbers : ["Unknown"]).map((number) => <span key={number}>{number}</span>)}
          </div>
        </div>
        {album.notes?.trim() && <div className={styles.artistMobileNotes}><strong>Notes:</strong><p>{album.notes}</p></div>}
        <div className={styles.mobileTrackHeader} aria-hidden="true"><span>#</span><span>Title</span><span>Length</span></div>
        <div className={styles.mobileTracks} role="listbox" aria-label={`Tracks on ${album.album}`}>
          {tracks.map((track, index) => <div
            aria-selected={activeTrack === track}
            className={`${styles.mobileTrackRow} ${activeTrack === track ? styles.mobileTrackSelected : ""}`}
            key={`${track.title}-${index}`}
            onClick={(event) => { setSelectedTrack(track); event.currentTarget.focus(); }}
            onKeyDown={(event) => selectTrackByKeyboard(event, tracks, index, setSelectedTrack)}
            role="option"
            tabIndex={activeTrack === track || (!activeTrack && index === 0) ? 0 : -1}
          >
            <span className={styles.mobileTrackNumber}>{track.trackNumber ?? index + 1}</span>
            <div className={styles.mobileTrackInfo}>
              <span className={styles.mobileTrackTitle}>{track.title}</span>
              <span className={styles.mobileTrackArtist}>{track.contributingArtist ?? track.artist}</span>
              {!!track.catalogNumbers?.length && <span className={styles.mobileTrackCatalog}>Catalog No.: {track.catalogNumbers.join("; ")}</span>}
            </div>
            <div className={styles.mobileTrackStats}><span>{length(track.durationSeconds)}</span><span>{track.playCount ?? track.listens} plays</span></div>
          </div>)}
        </div>
      </section>;
    })}
  </div>;
}
