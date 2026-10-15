"""Generate portfolio album listening stats from WMPL Wrap snapshots.

Only the logger's active ``data/snapshots`` directory is read. Backup folders,
including generated test snapshots, are never searched or imported.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any


SITE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LOGGER_ROOT = Path(
    os.environ.get(
        "WMPL_LOGGER_ROOT",
        SITE_ROOT.parents[1] / "media-player" / "Legacy-WMP-Logger",
    )
)
DEFAULT_OUTPUT = SITE_ROOT / "app" / "data" / "listening-stats.generated.json"
DEFAULT_COVER_ART_DIRECTORY = Path(
    os.environ.get(
        "WMPL_COVER_ART_ROOT",
        Path.home() / "Music" / "_coverarts",
    )
)
IMPORTED_COVER_DIRECTORY = (
    SITE_ROOT / "public" / "images" / "albums" / "wmpl-imported"
)
SUPPORTED_COVER_EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png")


@dataclass(frozen=True)
class TrackTally:
    album: str
    artist: str
    title: str
    listens: int


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import real WMPL Wrap listening totals into the portfolio dataset."
    )
    parser.add_argument(
        "--logger-root",
        type=Path,
        default=DEFAULT_LOGGER_ROOT,
        help="Path to the Legacy-WMP-Logger repository.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Generated JSON destination inside this website repository.",
    )
    parser.add_argument(
        "--cover-art-dir",
        type=Path,
        default=DEFAULT_COVER_ART_DIRECTORY,
        help="Directory containing cover files named after Discord asset keys.",
    )
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"Could not read JSON from {path}: {error}") from error

    if not isinstance(value, dict):
        raise RuntimeError(f"Expected a JSON object in {path}")
    return value


def load_snapshots(snapshot_directory: Path) -> list[tuple[Path, dict[str, Any]]]:
    if snapshot_directory.name.casefold() != "snapshots":
        raise RuntimeError("Refusing to read anything except an active 'snapshots' directory")
    if not snapshot_directory.is_dir():
        raise RuntimeError(f"Snapshot directory does not exist: {snapshot_directory}")

    snapshots = [(path, read_json(path)) for path in snapshot_directory.glob("*.json")]
    snapshots.sort(key=lambda item: str(item[1].get("CapturedAtUtc", item[0].name)))
    if not snapshots:
        raise RuntimeError(f"No active snapshots found in {snapshot_directory}")
    return snapshots


def snapshot_tracks(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    tracks = snapshot.get("Tracks")
    if not isinstance(tracks, list):
        raise RuntimeError("A snapshot is missing its Tracks array")
    return [track for track in tracks if isinstance(track, dict)]


def inclusive_tallies(snapshots: list[tuple[Path, dict[str, Any]]]) -> list[TrackTally]:
    """Include every current track and its first-seen count plus positive deltas."""
    totals: defaultdict[str, int] = defaultdict(int)
    latest_tracks: dict[str, dict[str, Any]] = {}
    previous_tracks: dict[str, dict[str, Any]] = {}

    for _, snapshot in snapshots:
        current_tracks = {
            str(track.get("Id", "")): track
            for track in snapshot_tracks(snapshot)
            if track.get("Id")
        }
        for track_id, current in current_tracks.items():
            previous = previous_tracks.get(track_id)
            current_count = max(0, int(current.get("PlayCount", 0)))
            if previous is None:
                totals[track_id] += current_count
                continue
            previous_count = max(0, int(previous.get("PlayCount", 0)))
            if current_count >= previous_count:
                totals[track_id] += current_count - previous_count
        previous_tracks = current_tracks
        latest_tracks = current_tracks

    tallies: list[TrackTally] = []
    for track_id, listens in totals.items():
        track = latest_tracks.get(track_id)
        if not track:
            continue
        album = str(track.get("Album", "")).strip()
        title = str(track.get("Title", "")).strip()
        artist = str(track.get("Artist", "")).strip()
        if album and title:
            tallies.append(TrackTally(album, artist or "Unknown artist", title, listens))
    return tallies


def normalize_album_title(title: str) -> str:
    normalized = unicodedata.normalize("NFKC", title)
    return " ".join(normalized.split()).casefold()


def representative_artist(tracks: list[TrackTally]) -> str:
    artist_counts = Counter(track.artist for track in tracks if track.artist)
    if not artist_counts:
        return "Unknown artist"
    return sorted(
        artist_counts.items(),
        key=lambda item: (-item[1], item[0].casefold()),
    )[0][0]


def aggregate_albums(tallies: list[TrackTally]) -> list[dict[str, Any]]:
    by_album: defaultdict[str, list[TrackTally]] = defaultdict(list)
    for tally in tallies:
        by_album[normalize_album_title(tally.album)].append(tally)

    albums: list[dict[str, Any]] = []
    for tracks in by_album.values():
        album = tracks[0].album
        ranked_tracks = sorted(
            tracks,
            key=lambda track: (-track.listens, track.title.casefold(), track.artist.casefold()),
        )
        top_track = ranked_tracks[0] if ranked_tracks[0].listens > 0 else None
        albums.append(
            {
                "album": album,
                "artist": representative_artist(tracks),
                "trackCount": len(tracks),
                "totalListens": sum(track.listens for track in tracks),
                "mostListenedTrack": (
                    {
                        "title": top_track.title,
                        "artist": top_track.artist,
                        "listens": top_track.listens,
                    }
                    if top_track
                    else None
                ),
            }
        )

    albums.sort(key=lambda album: (-album["totalListens"], album["album"].casefold()))
    return albums


def ensure_portfolio_path(destination: Path) -> None:
    try:
        destination.relative_to(SITE_ROOT)
    except ValueError as error:
        raise RuntimeError(
            "Refusing to write outside the portfolio repository: "
            f"{destination}"
        ) from error


def load_album_art_mappings(settings_path: Path) -> dict[str, str]:
    if not settings_path.is_file():
        print(f"Album artwork settings were not found: {settings_path}")
        return {}

    settings = read_json(settings_path)
    discord = settings.get("DiscordRpc")
    if not isinstance(discord, dict):
        return {}

    mappings = discord.get("AlbumArtMappings")
    if not isinstance(mappings, list):
        mappings = discord.get("Mappings")
    if not isinstance(mappings, list):
        return {}

    by_album: dict[str, str] = {}
    for mapping in mappings:
        if not isinstance(mapping, dict):
            continue
        album_title = str(mapping.get("AlbumTitle", "")).strip()
        asset_key = str(mapping.get("AssetKey", "")).strip()
        if album_title and asset_key:
            by_album[normalize_album_title(album_title)] = asset_key
    return by_album


def index_cover_art(cover_art_directory: Path) -> dict[str, Path]:
    if not cover_art_directory.is_dir():
        print(f"Album artwork directory was not found: {cover_art_directory}")
        return {}

    indexed: dict[str, Path] = {}
    files = sorted(
        (
            path
            for path in cover_art_directory.iterdir()
            if path.is_file()
            and path.suffix.casefold() in SUPPORTED_COVER_EXTENSIONS
        ),
        key=lambda path: (
            SUPPORTED_COVER_EXTENSIONS.index(path.suffix.casefold()),
            path.name.casefold(),
        ),
    )
    for path in files:
        indexed.setdefault(path.stem.casefold(), path)
    return indexed


def import_album_covers(
    albums: list[dict[str, Any]],
    mappings: dict[str, str],
    cover_art_directory: Path,
) -> tuple[int, list[str], list[str]]:
    cover_files = index_cover_art(cover_art_directory)
    if not mappings:
        return 0, [album["album"] for album in albums], []

    destination_directory = IMPORTED_COVER_DIRECTORY.resolve()
    ensure_portfolio_path(destination_directory)
    destination_directory.mkdir(parents=True, exist_ok=True)

    imported_count = 0
    missing_mappings: list[str] = []
    missing_files: list[str] = []
    for album in albums:
        album_title = str(album["album"])
        asset_key = mappings.get(normalize_album_title(album_title))
        if not asset_key:
            missing_mappings.append(album_title)
            continue

        source = cover_files.get(asset_key.casefold())
        if source is None:
            missing_files.append(f"{album_title} ({asset_key})")
            continue

        source = source.resolve()
        try:
            source.relative_to(cover_art_directory)
        except ValueError:
            missing_files.append(f"{album_title} ({asset_key})")
            continue

        destination = (destination_directory / source.name).resolve()
        ensure_portfolio_path(destination)
        shutil.copy2(source, destination)
        public_path = destination.relative_to(SITE_ROOT / "public").as_posix()
        album["coverSrc"] = f"/{public_path}"
        album["coverAlt"] = f"{album_title} album cover"
        imported_count += 1

    return imported_count, missing_mappings, missing_files


def previous_album_titles(destination: Path) -> set[str]:
    if not destination.is_file():
        return set()

    previous = read_json(destination)
    albums = previous.get("albums")
    if not isinstance(albums, list):
        return set()

    return {
        normalize_album_title(str(album.get("album", "")))
        for album in albums
        if isinstance(album, dict) and album.get("album")
    }


def main() -> None:
    arguments = parse_arguments()
    logger_root = arguments.logger_root.expanduser().resolve()
    snapshot_directory = logger_root / "data" / "snapshots"
    snapshots = load_snapshots(snapshot_directory)

    tallies = inclusive_tallies(snapshots)
    albums = aggregate_albums(tallies)
    cover_art_directory = arguments.cover_art_dir.expanduser().resolve()
    artwork_mappings = load_album_art_mappings(
        logger_root / "data" / "desktop-settings.json"
    )
    imported_cover_count, missing_artwork_mappings, missing_cover_files = (
        import_album_covers(albums, artwork_mappings, cover_art_directory)
    )
    count_mode = "first-seen WMP counts plus positive deltas between active snapshots"

    latest_path, latest_snapshot = snapshots[-1]
    output = {
        "source": {
            "capturedAtUtc": latest_snapshot.get("CapturedAtUtc", ""),
            "countMode": count_mode,
            "includeFirstSeenCounts": True,
            "snapshot": latest_path.name,
            "snapshotCount": len(snapshots),
        },
        "albums": albums,
    }

    destination = arguments.output.expanduser().resolve()
    ensure_portfolio_path(destination)
    previous_titles = previous_album_titles(destination)
    newly_discovered = [
        album["album"]
        for album in albums
        if normalize_album_title(album["album"]) not in previous_titles
    ]
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    displayed_destination = destination.relative_to(SITE_ROOT)
    print(
        f"Imported {len(output['albums'])} albums from {len(snapshots)} active snapshots "
        f"into {displayed_destination}"
    )
    print(
        f"Imported {imported_cover_count} album covers into "
        f"{IMPORTED_COVER_DIRECTORY.relative_to(SITE_ROOT)}"
    )
    if newly_discovered:
        print("Newly discovered albums: " + ", ".join(newly_discovered))
    if missing_artwork_mappings:
        print("Albums without artwork mappings: " + ", ".join(missing_artwork_mappings))
    if missing_cover_files:
        print("Artwork mappings without local files: " + ", ".join(missing_cover_files))


if __name__ == "__main__":
    main()
