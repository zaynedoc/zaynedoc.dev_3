"use client";

import { useState } from "react";
import type { Album } from "../data/albums";
import { FadeImage } from "./fade-image";

type AlbumCollectionProps = {
  albums: Album[];
};

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function formatListens(listens: number) {
  return `${listens.toLocaleString("en-US")} ${listens === 1 ? "listen" : "listens"}`;
}

function AlbumCover({ album, slot }: { album: Album; slot: string }) {
  const isActive = slot === "active";
  const className = `album-cover album-cover--${slot}`;
  const cover = (
    <FadeImage
      alt={album.coverAlt}
      className={isActive ? "album-covers__featured" : "album-covers__small"}
      height={isActive ? 250 : 200}
      loading="lazy"
      sizes={
        isActive
          ? "(max-width: 700px) calc(100vw - 136px), (max-width: 800px) 22vw, (max-width: 1100px) 25vw, 250px"
          : "(max-width: 700px) 1px, (max-width: 800px) 18vw, (max-width: 1100px) 20vw, 200px"
      }
      src={album.coverSrc}
      width={isActive ? 250 : 200}
    />
  );

  return (
    <a
      aria-label={`Search for ${album.title} by ${album.artist}`}
      className={className}
      href={album.url}
      rel="noreferrer"
      target="_blank"
    >
      {cover}
    </a>
  );
}

export function AlbumCollection({ albums }: AlbumCollectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (albums.length === 0) {
    return null;
  }

  const activeAlbum = albums[activeIndex];
  const visibleAlbums = [
    { album: albums[wrapIndex(activeIndex - 1, albums.length)], slot: "previous" },
    { album: activeAlbum, slot: "active" },
    { album: albums[wrapIndex(activeIndex + 1, albums.length)], slot: "next" },
  ];

  const selectPreviousAlbum = () => {
    setActiveIndex((index) => wrapIndex(index - 1, albums.length));
  };

  const selectNextAlbum = () => {
    setActiveIndex((index) => wrapIndex(index + 1, albums.length));
  };

  return (
    <div className="album-showcase" aria-label="Album collection">
      <div className="album-carousel">
        <button
          aria-label="Show previous album"
          className="album-carousel__control"
          onClick={selectPreviousAlbum}
          type="button"
        >
          [&lt;]
        </button>
        <div className="album-covers" aria-live="polite">
          {visibleAlbums.map(({ album, slot }) => (
            <AlbumCover album={album} key={`${slot}-${album.id}`} slot={slot} />
          ))}
        </div>
        <button
          aria-label="Show next album"
          className="album-carousel__control"
          onClick={selectNextAlbum}
          type="button"
        >
          [&gt;]
        </button>
      </div>

      <article className="album-info" aria-live="polite">        
        <div className="album-info__summary">
          <p>Album Info.:</p>
          <a
            className="album-info__album-title album-info__album-link"
            href={activeAlbum.url}
            rel="noreferrer"
            target="_blank"
          >
            “{activeAlbum.title}” by {activeAlbum.artist}
          </a>
          <p className="album-info__listen-count">
            {formatListens(activeAlbum.totalListens)} on this album
          </p>
        </div>
        <div className="album-info__top-track">
          <p>Favorite Track:</p>
          {activeAlbum.mostListenedTrack ? (
            <>
              <a
                className="album-info__track-link"
                href={activeAlbum.mostListenedTrack.url}
                rel="noreferrer"
                target="_blank"
              >
                “{activeAlbum.mostListenedTrack.title}” by{" "}
                {activeAlbum.mostListenedTrack.artist}
              </a>
              <p className="album-info__listen-count">
                {formatListens(activeAlbum.mostListenedTrack.listens)}
              </p>
            </>
          ) : (
            <p className="album-info__empty">No recorded listens yet.</p>
          )}
        </div>
      </article>
    </div>
  );
}
