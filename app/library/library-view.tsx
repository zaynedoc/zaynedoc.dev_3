"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent as ReactDragEvent, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { focusGridButton } from "./keyboard-navigation";
import { LibraryOverview, type LibraryOverviewData } from "./library-overview";
import styles from "./library.module.css";

type Track = {
  title: string;
  artist: string;
  contributingArtist?: string;
  listens: number;
  trackNumber?: number | null;
  discNumber?: number | null;
  durationSeconds?: number | null;
  playCount?: number;
};

type Album = {
  album: string;
  artist: string;
  catalogNumbers?: string[];
  notes?: string;
  overviewFeatured?: boolean;
  trackCount: number;
  totalListens: number;
  coverSrc?: string;
  coverAlt?: string;
  tracks: Track[];
};

const albumSort = new Intl.Collator("en", { sensitivity: "base", numeric: true });

type ColumnId = "album" | "number" | "title" | "length" | "artist" | "playCount";
type SortKey = Exclude<ColumnId, "album">;
type SortDirection = "ascending" | "descending";
type ColumnWidths = Record<ColumnId, number>;

const columns: { id: ColumnId; label: string }[] = [
  { id: "album", label: "Album" },
  { id: "number", label: "#" },
  { id: "title", label: "Title" },
  { id: "length", label: "Length" },
  { id: "artist", label: "Contributing artist" },
  { id: "playCount", label: "Play count" },
];
const initialWidths: ColumnWidths = { album: 252, number: 100, title: 315, length: 70, artist: 150, playCount: 108 };
const minimumWidths: ColumnWidths = { album: 240, number: 54, title: 180, length: 68, artist: 150, playCount: 90 };

function naturalTrackOrder(a: Track, b: Track) {
  return (a.discNumber ?? 1) - (b.discNumber ?? 1) ||
    (a.trackNumber ?? Number.MAX_SAFE_INTEGER) - (b.trackNumber ?? Number.MAX_SAFE_INTEGER) ||
    albumSort.compare(a.title, b.title);
}

function compareOptionalNumbers(a: number | null | undefined, b: number | null | undefined, direction: SortDirection) {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  return (a - b) * (direction === "ascending" ? 1 : -1);
}

function albumHash(title: string) {
  return `album-${encodeURIComponent(title)}`;
}

function formatLength(seconds: number | null | undefined) {
  if (seconds == null) return "";
  const minutes = Math.floor(seconds / 60);
  const remaining = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function formatAlbumLength(seconds: number) {
  if (seconds >= 7200) return `${(seconds / 3600).toFixed(1)} hours`;
  return `${Math.round(seconds / 60)} minutes`;
}

type DropSide = "before" | "after";

function moveInOrder<T extends string>(order: T[], dragged: T, target: T, side: DropSide) {
  if (dragged === target || !order.includes(dragged) || !order.includes(target)) return order;
  const next = order.filter((item) => item !== dragged);
  next.splice(next.indexOf(target) + (side === "after" ? 1 : 0), 0, dragged);
  return next;
}

function MusicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M6 3.5 13 2v8.3M6 3.5v8.2" stroke="#336089" strokeWidth="1.1" />
      <path d="M6 11.7c0 1.1-1.3 1.9-2.4 1.9S2 13.2 2 12.4s1.1-1.5 2.4-1.5c.7 0 1.2.2 1.6.8ZM13 10.3c0 1.1-1.3 1.9-2.4 1.9S9 11.8 9 11s1.1-1.5 2.4-1.5c.7 0 1.2.2 1.6.8Z" fill="#5c9dcc" stroke="#336089" strokeWidth=".7" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 2.5h8l2.5 2.5v8.5h-10.5z" fill="#f7fbff" stroke="#7298b8" />
      <path d="M10.5 2.5V5h2.5M4.5 7.5h6M4.5 10h6" stroke="#7298b8" />
    </svg>
  );
}

function AlbumIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.2" fill="#e8edf4" stroke="#6f91ae" />
      <circle cx="8" cy="8" r="3.6" stroke="#aac6de" />
      <circle cx="8" cy="8" r="1.1" fill="#70a4ce" />
    </svg>
  );
}

function CatalogNumbers({ numbers = [] }: { numbers?: string[] }) {
  return (
    <div className={styles.catalogMetadata}>
      <span>Catalog {numbers.length > 1 ? "Nos." : "No."}:</span>
      {numbers.length > 0
        ? numbers.map((number) => <span key={number}>{number}</span>)
        : <span>Unknown</span>}
    </div>
  );
}

function AlbumNotes({ notes }: { notes: string }) {
  return (
    <section aria-label="Album notes" className={styles.albumNotes} lang="en">
      <h2>Notes:</h2>
      <p>{notes}</p>
    </section>
  );
}

export default function LibraryView({ albums, overview }: { albums: Album[]; overview: LibraryOverviewData }) {
  const sortedAlbums = useMemo(
    () => [...albums].sort((a, b) => albumSort.compare(a.album, b.album)),
    [albums],
  );
  const overviewAlbums = useMemo(() => [
    ...sortedAlbums.filter((album) => album.overviewFeatured),
    ...sortedAlbums.filter((album) => !album.overviewFeatured),
  ].slice(0, 6), [sortedAlbums]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [libraryPage, setLibraryPage] = useState<"overview" | "collection">("overview");
  const [search, setSearch] = useState("");
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [albumOrder, setAlbumOrder] = useState<string[]>([]);
  const [draggingAlbum, setDraggingAlbum] = useState<string | null>(null);
  const [dropCue, setDropCue] = useState<{ album: string; side: DropSide } | null>(null);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(initialWidths);
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(() => columns.map(({ id }) => id));
  const [draggingColumn, setDraggingColumn] = useState<ColumnId | null>(null);
  const [columnDropCue, setColumnDropCue] = useState<{ id: ColumnId; side: DropSide } | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "number", direction: "ascending" });
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const activeResize = useRef<{ id: ColumnId; pointerX: number; width: number } | null>(null);
  const dragTitle = useRef<string | null>(null);
  const dragColumnId = useRef<ColumnId | null>(null);
  const albumTreeRef = useRef<HTMLDivElement>(null);
  const albumGridRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const mobileBackRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 700px)");
    function closeNavigationOnDesktop() {
      if (!mobileViewport.matches) setMobileNavigationOpen(false);
    }
    mobileViewport.addEventListener("change", closeNavigationOnDesktop);
    return () => mobileViewport.removeEventListener("change", closeNavigationOnDesktop);
  }, []);

  useEffect(() => {
    function syncHash() {
      const matching = sortedAlbums.find((album) => `#${albumHash(album.album)}` === window.location.hash);
      setSelectedTitle(matching?.album ?? null);
      setSelectedTrack(null);
      setLibraryPage(window.location.hash === "#albums" || matching ? "collection" : "overview");
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [sortedAlbums]);

  const selected = sortedAlbums.find((album) => album.album === selectedTitle);
  const orderedAlbums = useMemo(() => {
    if (albumOrder.length === 0) return sortedAlbums;
    const positions = new Map(albumOrder.map((title, index) => [title, index]));
    return [...sortedAlbums].sort((a, b) =>
      (positions.get(a.album) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.album) ?? Number.MAX_SAFE_INTEGER) ||
      albumSort.compare(a.album, b.album),
    );
  }, [sortedAlbums, albumOrder]);
  const visibleAlbums = orderedAlbums.filter((album) =>
    `${album.album} ${album.artist}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  function reorderAlbum(dragged: string, target: string, side: DropSide) {
    setAlbumOrder(moveInOrder(orderedAlbums.map((album) => album.album), dragged, target, side));
  }

  function reorderColumn(dragged: ColumnId, target: ColumnId, side: DropSide) {
    setColumnOrder((order) => moveInOrder(order, dragged, target, side));
  }

  function finishColumnDrag() {
    dragColumnId.current = null;
    setDraggingColumn(null);
    setColumnDropCue(null);
  }

  function keyboardMoveColumn(event: ReactKeyboardEvent<HTMLDivElement>, id: ColumnId) {
    if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    if ((event.target as HTMLElement).getAttribute("role") === "separator") return;
    event.preventDefault();
    const index = columnOrder.indexOf(id);
    const backward = event.key === "ArrowLeft";
    const adjacent = columnOrder[index + (backward ? -1 : 1)];
    if (adjacent) reorderColumn(id, adjacent, backward ? "before" : "after");
  }

  function dropSide(event: ReactDragEvent<HTMLButtonElement>): DropSide {
    const bounds = event.currentTarget.getBoundingClientRect();
    const vertical = window.matchMedia("(max-width: 480px)").matches;
    return (vertical ? event.clientY > bounds.top + bounds.height / 2 : event.clientX > bounds.left + bounds.width / 2)
      ? "after" : "before";
  }

  function finishAlbumDrag() {
    dragTitle.current = null;
    setDraggingAlbum(null);
    setDropCue(null);
  }

  function keyboardMoveAlbum(event: ReactKeyboardEvent<HTMLButtonElement>, album: Album) {
    if (!event.altKey || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const index = visibleAlbums.findIndex((item) => item.album === album.album);
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const adjacent = visibleAlbums[index + (backward ? -1 : 1)];
    if (adjacent) reorderAlbum(album.album, adjacent.album, backward ? "before" : "after");
  }

  function keyboardNavigateMusic(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0
      : event.key === "End" ? sortedAlbums.length - 1
      : index + (event.key === "ArrowUp" ? -1 : 1);
    const album = sortedAlbums[next];
    if (!album) return;
    albumTreeRef.current?.querySelectorAll("button")[next]?.focus();
    selectAlbum(album);
  }

  function keyboardSelectTrack(event: ReactKeyboardEvent<HTMLDivElement>, orderedTracks: Track[], index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedTrack(orderedTracks[index]);
      return;
    }
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0
      : event.key === "End" ? orderedTracks.length - 1
      : index + (event.key === "ArrowUp" ? -1 : 1);
    if (next < 0 || next >= orderedTracks.length) return;
    setSelectedTrack(orderedTracks[next]);
    event.currentTarget.closest('[role="listbox"]')?.querySelectorAll<HTMLElement>('[role="option"]')[next]?.focus();
  }

  function selectAlbum(album: Album, focusContent = false) {
    const shouldFocusContent = focusContent || mobileNavigationOpen;
    window.location.hash = albumHash(album.album);
    setSelectedTitle(album.album);
    setSelectedTrack(null);
    setLibraryPage("collection");
    setMobileNavigationOpen(false);
    if (shouldFocusContent) {
      window.requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 700px)").matches) mobileBackRef.current?.focus();
        else (detailScrollRef.current?.querySelector<HTMLElement>('[role="option"]') ?? detailScrollRef.current)?.focus();
      });
    }
  }

  function showAlbums(focusCollection = false) {
    window.location.hash = "albums";
    setSelectedTitle(null);
    setSelectedTrack(null);
    setLibraryPage("collection");
    setMobileNavigationOpen(false);
    if (focusCollection) window.requestAnimationFrame(() => albumGridRef.current?.querySelector("button")?.focus());
  }

  function showOverview() {
    window.location.hash = "overview";
    setSelectedTitle(null);
    setLibraryPage("overview");
    setMobileNavigationOpen(false);
  }

  function changeSort(key: SortKey) {
    setSort((previous) => ({
      key,
      direction: previous.key === key && previous.direction === "ascending" ? "descending" : "ascending",
    }));
  }

  function resizeColumn(id: ColumnId, width: number) {
    setColumnWidths((previous) => ({ ...previous, [id]: Math.max(minimumWidths[id], Math.round(width)) }));
  }

  function startResize(event: ReactPointerEvent<HTMLSpanElement>, id: ColumnId) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activeResize.current = { id, pointerX: event.clientX, width: columnWidths[id] };
  }

  function moveResize(event: ReactPointerEvent<HTMLSpanElement>) {
    const resize = activeResize.current;
    if (resize) resizeColumn(resize.id, resize.width + event.clientX - resize.pointerX);
  }

  function endResize(event: ReactPointerEvent<HTMLSpanElement>) {
    activeResize.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const tracks = selected ? [...selected.tracks].sort(naturalTrackOrder) : [];
  const activeTrack = selectedTrack && selected?.tracks.includes(selectedTrack) ? selectedTrack : null;
  const fallbackTrackNumbers = new Map(tracks.map((track, index) => [track, index + 1]));
  const desktopTracks = [...tracks].sort((a, b) => {
    if (sort.key === "number") {
      const order = naturalTrackOrder(a, b);
      return sort.direction === "ascending" ? order : -order;
    }
    let order = 0;
    if (sort.key === "title") order = albumSort.compare(a.title, b.title);
    if (sort.key === "length") order = compareOptionalNumbers(a.durationSeconds, b.durationSeconds, sort.direction);
    if (sort.key === "artist") order = albumSort.compare(a.contributingArtist ?? a.artist, b.contributingArtist ?? b.artist);
    if (sort.key === "playCount") order = (a.playCount ?? a.listens) - (b.playCount ?? b.listens);
    if (sort.key === "length") return order || naturalTrackOrder(a, b);
    return order * (sort.direction === "ascending" ? 1 : -1) || naturalTrackOrder(a, b);
  });
  const tableStyle = {
    "--album-width": `${columnWidths.album}px`,
    "--album-offset": `${columnOrder.slice(0, columnOrder.indexOf("album")).reduce((total, id) => total + columnWidths[id], 0)}px`,
    "--detail-columns": columnOrder.map((id) => `${columnWidths[id]}px`).join(" "),
    "--table-width": `${Object.values(columnWidths).reduce((total, width) => total + width, 0)}px`,
  } as CSSProperties;
  const hasMultipleDiscs = tracks.some((track) => (track.discNumber ?? 1) > 1);

  return (
    <main className={styles.window}>
      <div className={styles.toolbar}>
        <div className={styles.menus}>
          <span className={styles.desktopOrganize} aria-hidden="true">Organize <i /></span>
          <button
            aria-controls="library-sidebar"
            aria-expanded={mobileNavigationOpen}
            className={styles.mobileNavigate}
            onClick={() => setMobileNavigationOpen((open) => !open)}
            type="button"
          >
            Navigate <i />
          </button>
          <span className={styles.desktopMenu} aria-hidden="true">Stream <i /></span>
          <span className={styles.desktopMenu} aria-hidden="true">Create playlist <i /></span>
        </div>
        <div className={styles.tools}>
          <span className={styles.viewIcon} aria-hidden="true">▦</span>
          <span className={styles.viewCaret} aria-hidden="true">▾</span>
          <label className={styles.searchBox}>
            <span className={styles.srOnly}>Search albums</span>
            <input value={search} onChange={(event) => { setSearch(event.target.value); if (event.target.value) showAlbums(); }} placeholder="Search" type="search" />
            <span className={styles.magnify} aria-hidden="true" />
          </label>
          <span className={styles.helpIcon} aria-hidden="true">?</span>
        </div>
      </div>

      <div className={styles.body}>
        {mobileNavigationOpen && (
          <button
            aria-label="Close navigation"
            className={styles.mobileScrim}
            onClick={() => setMobileNavigationOpen(false)}
            type="button"
          />
        )}
        <aside
          className={`${styles.sidebar} ${mobileNavigationOpen ? styles.sidebarOpen : ""}`}
          id="library-sidebar"
          aria-label="Library navigation"
        >
          <div className={styles.pagesTree}>
            <span className={styles.chevronOpen} aria-hidden="true" />
            <span className={styles.treeIcon}><PagesIcon /></span>
            <span>Pages</span>
          </div>
          <div className={styles.pageTree}>
            <button className={`${styles.treeAlbum} ${!selected && libraryPage === "overview" ? styles.treeSelected : ""}`} onClick={showOverview} type="button">
              <span className={styles.treeIcon}><PagesIcon /></span><span className={styles.treeLabel}>Overview</span>
            </button>
            <Link className={styles.treeAlbum} href="/">
              <span className={styles.treeIcon}><PagesIcon /></span><span className={styles.treeLabel}>Portfolio</span>
            </Link>
          </div>
          <button className={`${styles.musicTree} ${!selected && libraryPage === "collection" ? styles.treeSelected : ""}`} onClick={() => showAlbums()} onKeyDown={(event) => keyboardNavigateMusic(event, -1)} type="button">
            <span className={styles.chevronOpen} aria-hidden="true" />
            <span className={styles.treeIcon}><MusicIcon /></span>
            <span>Music</span>
          </button>
          <div className={styles.albumTree} ref={albumTreeRef}>
              {sortedAlbums.map((album, index) => (
                <button
                  aria-current={selectedTitle === album.album ? "page" : undefined}
                  className={`${styles.treeAlbum} ${selectedTitle === album.album ? styles.treeSelected : ""}`}
                  key={album.album}
                  onClick={() => selectAlbum(album)}
                  onKeyDown={(event) => keyboardNavigateMusic(event, index)}
                  tabIndex={selectedTitle === album.album || (!selectedTitle && index === 0) ? 0 : -1}
                  title={album.album}
                  type="button"
                >
                  <span className={styles.treeIcon}><AlbumIcon /></span>
                  <span className={styles.treeLabel}>{album.album}</span>
                </button>
              ))}
          </div>
        </aside>

        <section className={styles.content} aria-label={selected ? selected.album : libraryPage === "overview" ? "Library overview" : "Albums"}>
          {selected ? (
            <>
              <div className={styles.detailScroll} ref={detailScrollRef} tabIndex={-1}>
                <div className={styles.detailTable} style={tableStyle}>
                  <div className={`${styles.columnHeader} ${styles.detailHeader}`}>
                    {columnOrder.map((id) => {
                      const label = columns.find((column) => column.id === id)!.label;
                      return (
                        <div
                        aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                        className={`${styles.detailHeaderCell} ${draggingColumn === id ? styles.columnDragging : ""} ${columnDropCue?.id === id ? columnDropCue.side === "before" ? styles.columnDropBefore : styles.columnDropAfter : ""}`}
                        draggable
                        key={id}
                        onDragEnd={finishColumnDrag}
                        onDragOver={(event) => {
                          if (!dragColumnId.current || dragColumnId.current === id) return;
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          const bounds = event.currentTarget.getBoundingClientRect();
                          const side = event.clientX > bounds.left + bounds.width / 2 ? "after" : "before";
                          if (columnDropCue?.id !== id || columnDropCue.side !== side) setColumnDropCue({ id, side });
                        }}
                        onDragStart={(event) => {
                          if (activeResize.current || (event.target as HTMLElement).closest('[role="separator"]')) {
                            event.preventDefault();
                            return;
                          }
                          dragColumnId.current = id;
                          setDraggingColumn(id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", id);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const dragged = dragColumnId.current;
                          if (dragged) {
                            const bounds = event.currentTarget.getBoundingClientRect();
                            reorderColumn(dragged, id, event.clientX > bounds.left + bounds.width / 2 ? "after" : "before");
                          }
                          finishColumnDrag();
                        }}
                        onKeyDown={(event) => keyboardMoveColumn(event, id)}
                        tabIndex={id === "album" ? 0 : undefined}
                      >
                        {id === "album" ? (
                          <span className={styles.staticHeaderLabel}>{label}</span>
                        ) : (
                          <button
                            aria-label={`Sort by ${label}${sort.key === id ? `, currently ${sort.direction}` : ""}`}
                            className={styles.sortButton}
                            onClick={() => changeSort(id)}
                            type="button"
                          >
                            {label}
                            {sort.key === id && <span aria-hidden="true" className={styles.sortArrow}>{sort.direction === "ascending" ? "▲" : "▼"}</span>}
                          </button>
                        )}
                        <span
                          aria-label={`Resize ${label} column`}
                          aria-orientation="vertical"
                          aria-valuemin={minimumWidths[id]}
                          aria-valuenow={columnWidths[id]}
                          className={styles.resizeHandle}
                          onKeyDown={(event) => {
                            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                            event.preventDefault();
                            resizeColumn(id, columnWidths[id] + (event.key === "ArrowRight" ? 10 : -10));
                          }}
                          onPointerCancel={endResize}
                          onPointerDown={(event) => startResize(event, id)}
                          onPointerMove={moveResize}
                          onPointerUp={endResize}
                          role="separator"
                          tabIndex={0}
                        />
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.groupTitle}><span>{selected.album}</span></div>
                  <div className={styles.trackGrid}>
                    <div className={styles.albumCell}>
                      <div className={styles.albumIdentity}>
                        <Image alt={selected.coverAlt ?? `${selected.album} album cover`} src={selected.coverSrc ?? "/images/albums/wmp_empty.png"} width={110} height={110} unoptimized />
                        <div className={styles.albumIdentityText}><strong>{selected.album}</strong><br /><strong>{selected.artist}</strong><CatalogNumbers numbers={selected.catalogNumbers} /></div>
                      </div>
                      {selected.notes?.trim() && <AlbumNotes notes={selected.notes} />}
                    </div>
                    <div aria-label={`Tracks on ${selected.album}`} className={styles.trackRows} role="listbox">
                      {desktopTracks.map((track, index) => (
                        <div
                          aria-selected={activeTrack === track}
                          className={`${styles.trackRow} ${activeTrack === track ? styles.trackRowSelected : ""}`}
                          key={`${track.title}-${index}`}
                          onClick={(event) => { setSelectedTrack(track); event.currentTarget.focus(); }}
                          onKeyDown={(event) => keyboardSelectTrack(event, desktopTracks, index)}
                          role="option"
                          tabIndex={activeTrack === track || (!activeTrack && index === 0) ? 0 : -1}
                        >
                          {columnOrder.map((id) => {
                            const value = id === "number" ? track.trackNumber ?? fallbackTrackNumbers.get(track)
                              : id === "title" ? track.title
                              : id === "length" ? formatLength(track.durationSeconds)
                              : id === "artist" ? track.contributingArtist ?? track.artist
                              : id === "playCount" ? track.playCount ?? track.listens
                              : null;
                            return <span key={id} title={id === "title" || id === "artist" ? String(value ?? "") : undefined}>{value}</span>;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.mobileDetail}>
                <button className={styles.mobileBack} onClick={() => showAlbums(true)} onKeyDown={(event) => {
                  if (event.key !== "ArrowDown" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || tracks.length === 0) return;
                  event.preventDefault();
                  setSelectedTrack(tracks[0]);
                  event.currentTarget.parentElement?.querySelector<HTMLElement>('[role="option"]')?.focus();
                }} ref={mobileBackRef} type="button">
                  <span aria-hidden="true">‹</span> Albums
                </button>
                <div className={styles.mobileAlbumSummary}>
                  <Image
                    alt={selected.coverAlt ?? `${selected.album} album cover`}
                    src={selected.coverSrc ?? "/images/albums/wmp_empty.png"}
                    width={96}
                    height={96}
                    unoptimized
                  />
                  <div className={styles.mobileAlbumText}>
                    <strong>{selected.album}</strong>
                    <span>{selected.artist}</span>
                    <CatalogNumbers numbers={selected.catalogNumbers} />
                    <span className={styles.mobileAlbumMuted}>
                      {selected.trackCount} songs · {formatAlbumLength(selected.tracks.reduce((total, track) => total + (track.durationSeconds ?? 0), 0))}
                    </span>
                  </div>
                </div>
                {selected.notes?.trim() && <AlbumNotes notes={selected.notes} />}
                <div className={styles.mobileTrackHeader} aria-hidden="true">
                  <span>#</span><span>Title</span><span>Length</span>
                </div>
                <div aria-label={`Tracks on ${selected.album}`} className={styles.mobileTracks} role="listbox">
                  {tracks.map((track, index) => {
                    const disc = track.discNumber ?? 1;
                    const beginsDisc = index === 0 || (tracks[index - 1].discNumber ?? 1) !== disc;
                    const playCount = track.playCount ?? track.listens;
                    return (
                      <div key={`${track.title}-${index}`} role="presentation">
                        {hasMultipleDiscs && beginsDisc && <div className={styles.mobileDisc}>Disc {disc}</div>}
                        <div
                          aria-selected={activeTrack === track}
                          className={`${styles.mobileTrackRow} ${activeTrack === track ? styles.mobileTrackSelected : ""}`}
                          onClick={(event) => { setSelectedTrack(track); event.currentTarget.focus(); }}
                          onKeyDown={(event) => keyboardSelectTrack(event, tracks, index)}
                          role="option"
                          tabIndex={activeTrack === track || (!activeTrack && index === 0) ? 0 : -1}
                        >
                          <span className={styles.mobileTrackNumber}>{track.trackNumber ?? index + 1}</span>
                          <div className={styles.mobileTrackInfo}>
                            <span className={styles.mobileTrackTitle}>{track.title}</span>
                            <span className={styles.mobileTrackArtist}>{track.contributingArtist ?? track.artist}</span>
                          </div>
                          <div className={styles.mobileTrackStats}>
                            <span>{formatLength(track.durationSeconds)}</span>
                            <span>{playCount} {playCount === 1 ? "play" : "plays"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : libraryPage === "overview" ? (
            <LibraryOverview
              albums={overviewAlbums}
              data={overview}
              onOpenAlbum={(title) => {
                const album = sortedAlbums.find((item) => item.album === title);
                if (album) selectAlbum(album, true);
              }}
              onOpenCollection={() => showAlbums(true)}
            />
          ) : (
            <>
              <div className={`${styles.columnHeader} ${styles.overviewHeader}`} aria-hidden="true">
                <span>Album</span><span>Album Artist</span><span>Count</span><span>Total Listens</span>
              </div>
              <div className={styles.albumGridScroll}>
                <div className={styles.albumGrid} ref={albumGridRef}>
                  {visibleAlbums.map((album) => (
                    <button
                      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown"
                      className={`${styles.albumCard} ${draggingAlbum === album.album ? styles.albumDragging : ""} ${dropCue?.album === album.album ? dropCue.side === "before" ? styles.albumDropBefore : styles.albumDropAfter : ""}`}
                      draggable
                      key={album.album}
                      onClick={() => selectAlbum(album, true)}
                      onDragEnd={finishAlbumDrag}
                      onDragOver={(event) => {
                        if (!dragTitle.current || dragTitle.current === album.album) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        const side = dropSide(event);
                        if (dropCue?.album !== album.album || dropCue.side !== side) setDropCue({ album: album.album, side });
                      }}
                      onDragStart={(event) => {
                        dragTitle.current = album.album;
                        setDraggingAlbum(album.album);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", album.album);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (dragTitle.current) reorderAlbum(dragTitle.current, album.album, dropSide(event));
                        finishAlbumDrag();
                      }}
                      onKeyDown={(event) => {
                        keyboardMoveAlbum(event, album);
                        focusGridButton(event);
                      }}
                      type="button"
                    >
                      <Image alt="" className={styles.gridCover} draggable={false} src={album.coverSrc ?? "/images/albums/wmp_empty.png"} width={86} height={86} unoptimized />
                      <span className={styles.albumInfo}>
                        <span className={styles.albumName}>{album.album}</span>
                        <span className={styles.albumMuted}>{album.artist}</span>
                        <span className={styles.albumMuted}>{album.trackCount} songs</span>
                        <span className={styles.albumMuted}>{album.totalListens} listens</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
