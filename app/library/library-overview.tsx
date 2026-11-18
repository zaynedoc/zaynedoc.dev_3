"use client";

import Image from "next/image";
import { useState } from "react";
import { ProjectCarousel } from "../components/project-carousel";
import { libraryPhotos } from "../data/library-photos";
import { focusGridButton } from "./keyboard-navigation";
import styles from "./library.module.css";

type AlbumPreview = {
  album: string;
  artist: string;
  coverSrc?: string;
  totalListens: number;
};

type RankingMetric = "listens" | "listeningSeconds";
type Subject = "artists" | "albums" | "tracks";
type Period = "week" | "month" | "year" | "all";
type RankingRow = {
  name: string;
  detail?: string;
  coverSrc: string;
  listens: number;
  listeningSeconds: number;
};
type PeriodSnapshot = {
  fromUtc: string;
  throughUtc: string;
  listens: number;
  listeningSeconds: number;
  rankings: Record<RankingMetric, Record<Subject, RankingRow[]>>;
};

export type LibraryOverviewData = {
  source: { capturedAtUtc: string; firstSnapshotAtUtc: string; snapshotCount: number };
  periods: Record<Period, PeriodSnapshot>;
};

const periods: { key: Period; label: string }[] = [
  { key: "week", label: "Past week" },
  { key: "month", label: "Past month" },
  { key: "year", label: "Past year" },
  { key: "all", label: "All time" },
];
const subjects: { key: Subject; label: string }[] = [
  { key: "artists", label: "Top artists" },
  { key: "albums", label: "Top albums" },
  { key: "tracks", label: "Top tracks" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
  timeZoneName: "short",
});

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours.toLocaleString("en-US")} hr ${minutes} min` : `${minutes} min`;
}

function formatValue(row: RankingRow, metric: RankingMetric) {
  return metric === "listens"
    ? `${row.listens.toLocaleString("en-US")} listens`
    : formatDuration(row.listeningSeconds);
}

export function LibraryOverview({
  albums,
  data,
  onOpenAlbum,
  onOpenCollection,
}: {
  albums: AlbumPreview[];
  data: LibraryOverviewData;
  onOpenAlbum: (albumTitle: string) => void;
  onOpenCollection: () => void;
}) {
  const [period, setPeriod] = useState<Period>("week");
  const [metric, setMetric] = useState<RankingMetric>("listens");
  const selected = data.periods[period];
  const firstAlbums = albums.slice(0, 6);

  return (
    <div className={styles.landingScroll}>
      <div className={styles.landingPage}>
        <section className={styles.landingIntro} aria-labelledby="library-welcome">
          <div className={styles.landingCopy}>
            {/*<span className={styles.landingEyebrow}>Music / Overview</span>*/}
            <h1 id="library-welcome">Welcome to my music library</h1>
            <p>
              Browse the CDs I&apos;ve personally collected and my listening history recorded in my Windows Media Player Legacy instance.
              <br /><br />
              My <strong>WMPL Wrap</strong> project compares read-only library snapshots to show the logistics of what CDs I listen to the most.
            </p>
            <a className={styles.landingLink} href="https://github.com/zaynedoc/WMPL-Wrap" rel="noopener noreferrer" target="_blank">
              WMPL Wrap on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className={styles.landingVisual}>
            {libraryPhotos.length > 0 ? (
              <ProjectCarousel aspectRatio="4 / 3" keyboardNavigation label="Photos of Zayne Dockery's CD collection" slides={libraryPhotos} />
            ) : (
              <div className={styles.coverMosaic} aria-label="Album artwork from the collection">
                {albums.slice(0, 4).map((album) => (
                  <Image
                    alt={`${album.album} cover`}
                    height={180}
                    key={album.album}
                    src={album.coverSrc ?? "/images/albums/wmp_empty.png"}
                    unoptimized
                    width={180}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <div className={styles.landingDivider} aria-hidden="true" />

        <section className={styles.landingSection} aria-labelledby="collection-preview-title">
          <div className={styles.landingSectionHeading}>
            <div>
              <span className={styles.landingEyebrow}>Collection</span>
              <h2 id="collection-preview-title">View all albums</h2>
            </div>
            <button className={styles.landingAction} onClick={onOpenCollection} type="button">View full collection <span aria-hidden="true">→</span></button>
          </div>
          <div className={styles.collectionPreview}>
            {firstAlbums.map((album) => (
              <button className={styles.previewAlbum} key={album.album} onClick={() => onOpenAlbum(album.album)} onKeyDown={focusGridButton} type="button">
                <Image alt="" height={110} src={album.coverSrc ?? "/images/albums/wmp_empty.png"} unoptimized width={110} />
                <span className={styles.previewTitle}>{album.album}</span>
                <span className={styles.previewArtist}>{album.artist}</span>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.landingDivider} aria-hidden="true" />

        <section className={styles.landingSection} aria-labelledby="listening-snapshot-title">
          <div className={styles.landingSectionHeading}>
            <div>
              <span className={styles.landingEyebrow}>WMPL Wrap</span>
              <h2 id="listening-snapshot-title">Listening snapshot</h2>
              <p className={styles.snapshotTimestamp}>
                {data.source.snapshotCount} snapshots · latest {timeFormatter.format(new Date(data.source.capturedAtUtc))}
              </p>
            </div>
            <label className={styles.metricSelect}>
              <span>Rank by</span>
              <select onChange={(event) => setMetric(event.target.value as RankingMetric)} value={metric}>
                <option value="listens">Listening count</option>
                <option value="listeningSeconds">Listening time</option>
              </select>
            </label>
          </div>
          <div aria-label="Listening period" className={styles.periodTabs} role="group">
            {periods.map((item) => (
              <button
                aria-pressed={period === item.key}
                className={period === item.key ? styles.periodActive : ""}
                key={item.key}
                onClick={() => setPeriod(item.key)}
                onKeyDown={(event) => {
                  const next = focusGridButton(event);
                  if (next !== null) setPeriod(periods[next].key);
                }}
                type="button"
              >{item.label}</button>
            ))}
          </div>
          <p className={styles.snapshotRange}>
            Data from {dateFormatter.format(new Date(selected.fromUtc))} to {dateFormatter.format(new Date(selected.throughUtc))}
          </p>
          <div className={styles.snapshotTotals}>
            <div><span>Total listens</span><strong>{selected.listens.toLocaleString("en-US")}</strong></div>
            <div><span>Total listening time</span><strong>{formatDuration(selected.listeningSeconds)}</strong></div>
          </div>
          <div className={styles.rankingGrid}>
            {subjects.map((subject) => (
              <section className={styles.rankingPanel} key={subject.key} aria-label={subject.label}>
                <h3>{subject.label}</h3>
                <ol>
                  {selected.rankings[metric][subject.key].length > 0 ? selected.rankings[metric][subject.key].map((row, index) => (
                    <li key={`${subject.key}-${row.name}-${index}`}>
                      <span className={styles.rankingPosition}>{index + 1}</span>
                      <Image alt="" height={40} src={row.coverSrc || "/images/albums/wmp_empty.png"} unoptimized width={40} />
                      <span className={styles.rankingIdentity}>
                        <strong title={row.name}>{row.name}</strong>
                        {row.detail && <small title={row.detail}>{row.detail}</small>}
                      </span>
                      <span className={styles.rankingValue}>
                        {formatValue(row, metric)}
                        <small>{formatValue(row, metric === "listens" ? "listeningSeconds" : "listens")}</small>
                      </span>
                    </li>
                  )) : <li className={styles.rankingEmpty}>No listens in this period.</li>}
                </ol>
              </section>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
