"use client";

import Image from "next/image";
import { useState } from "react";
import type { Album } from "../data/albums";

type AlbumCollectionProps = {
  albums: Album[];
};

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function AlbumCover({ album, slot }: { album: Album; slot: string }) {
  const isActive = slot === "active";
  const className = `album-cover album-cover--${slot}`;
  const cover = (
    <Image
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

  if (!album.url) {
    return <div className={className}>{cover}</div>;
  }

  return (
    <a
      aria-label={`Open ${album.title} by ${album.artist}`}
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
  const [activeIndex, setActiveIndex] = useState(Math.min(1, albums.length - 1));

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

      <article className="album-info">
        <p>Album Info.:</p>
        {activeAlbum.url ? (
          <a
            className="album-info__album-title album-info__album-link"
            href={activeAlbum.url}
            rel="noreferrer"
            target="_blank"
          >
            “{activeAlbum.title}” by {activeAlbum.artist}
          </a>
        ) : (
          <p className="album-info__album-title">
            “{activeAlbum.title}” by {activeAlbum.artist}
          </p>
        )}
        <p>
          ver.: [{activeAlbum.pressing.version}] ({activeAlbum.pressing.matrixCode})
        </p>
        <div className="album-info__tracks">
          <p>Favorite Tracks:</p>
          {activeAlbum.favoriteTracks.length > 0 ? (
            <ul>
              {activeAlbum.favoriteTracks.map((track) => {
                const label = (
                  <>
                    {track.title}
                    {track.featuring ? ` (feat. ${track.featuring})` : ""}
                  </>
                );

                return (
                  <li key={track.title}>
                    {track.url ? (
                      <a href={track.url} rel="noreferrer" target="_blank">
                        {label}
                      </a>
                    ) : (
                      label
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="album-info__empty">No favorite tracks added yet.</p>
          )}
        </div>
      </article>
    </div>
  );
}
