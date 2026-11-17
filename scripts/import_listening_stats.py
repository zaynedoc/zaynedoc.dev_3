"""Generate portfolio album listening stats from WMPL Wrap snapshots.

Only the logger's active ``data/snapshots`` directory is read. Backup folders,
including generated test snapshots, are never searched or imported.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from mutagen import File as read_audio_file, MutagenError


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
ALBUM_SETTINGS_PATH = SITE_ROOT / "app" / "data" / "album-settings.ts"
ALBUM_SETTINGS_START = "    // BEGIN SORTED ALBUM SETTINGS"
ALBUM_SETTINGS_END = "    // END SORTED ALBUM SETTINGS"
SUPPORTED_COVER_EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png")


@dataclass(frozen=True)
class TrackTally:
    album: str
    artist: str
    contributing_artist: str
    title: str
    listens: int
    track_number: int | None
    disc_number: int | None
    duration_seconds: int | None
    play_count: int
    album_artist: str
    catalog_numbers: tuple[str, ...]


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


def optional_positive_int(value: Any) -> int | None:
    try:
        number = int(str(value).split("/", 1)[0])
    except (TypeError, ValueError):
        return None
    return number if number > 0 else None


def duration_seconds(value: Any) -> int | None:
    try:
        seconds = float(value)
    except (TypeError, ValueError):
        return None
    return round(seconds) if seconds >= 0 else None


def live_wmp_metadata() -> dict[str, dict[str, Any]]:
    """Read WMP display fields without changing the library or logger snapshots."""
    if sys.platform != "win32":
        return {}
    script = SITE_ROOT / "scripts" / "read_wmp_library.ps1"
    with tempfile.TemporaryDirectory(dir=script.parent) as temporary_directory:
        output = Path(temporary_directory) / "wmp-library.json"
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-File", str(script), str(output)],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0 or not output.is_file():
            print("Live WMP metadata unavailable; using snapshot fields. " + result.stderr.strip())
            return {}
        items = json.loads(output.read_text(encoding="utf-8-sig"))
    if not isinstance(items, list):
        return {}
    return {
        str(item["sourceUrl"]).casefold(): item
        for item in items
        if isinstance(item, dict) and item.get("sourceUrl")
    }


def catalog_numbers_for_file(
    source_url: Any, cache: dict[str, tuple[str, ...]]
) -> tuple[str, ...]:
    """Read Picard's CATALOGNUMBER tag from the local audio file, when available."""
    source = str(source_url or "").strip()
    if not source:
        return ()
    if source in cache:
        return cache[source]

    numbers: list[str] = []
    path = Path(source)
    if path.is_file():
        try:
            audio = read_audio_file(path)
            if audio is not None and audio.tags is not None:
                for key, frame in audio.tags.items():
                    tag_name = str(key).rsplit(":", 1)[-1].replace("_", "").replace(" ", "")
                    if tag_name.casefold() != "catalognumber":
                        continue
                    values = getattr(frame, "text", frame)
                    if not isinstance(values, (list, tuple)):
                        values = [values]
                    for value in values:
                        number = (value.decode("utf-8", errors="replace") if isinstance(value, bytes) else str(value)).strip()
                        if number:
                            numbers.append(number)
        except (MutagenError, OSError, ValueError):
            pass

    cache[source] = tuple(dict.fromkeys(numbers))
    return cache[source]


def inclusive_tallies(
    snapshots: list[tuple[Path, dict[str, Any]]],
    live_metadata: dict[str, dict[str, Any]] | None = None,
) -> list[TrackTally]:
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
    catalog_cache: dict[str, tuple[str, ...]] = {}
    for track_id, listens in totals.items():
        track = latest_tracks.get(track_id)
        if not track:
            continue
        live = (live_metadata or {}).get(str(track.get("SourceUrl", "")).casefold(), {})
        album = str(live.get("album") or track.get("Album", "")).strip()
        # WMP's Title is the display title, including edits made inside WMP.
        title = str(live.get("title") or track.get("Title", "")).strip()
        artist = str(live.get("artist") or track.get("Artist", "")).strip()
        if album and title:
            tallies.append(
                TrackTally(
                    album,
                    artist or "Unknown artist",
                    str(live.get("contributingArtist") or artist or "Unknown artist").strip(),
                    title,
                    listens,
                    optional_positive_int(live.get("trackNumber") or track.get("TrackNumber")),
                    optional_positive_int(live.get("discNumber") or track.get("DiscNumber")),
                    duration_seconds(live.get("duration") or track.get("Duration")),
                    max(0, int(live.get("playCount", track.get("PlayCount", 0)))),
                    str(live.get("albumArtist") or track.get("AlbumArtist") or "").strip(),
                    catalog_numbers_for_file(track.get("SourceUrl"), catalog_cache),
                )
            )
    return tallies


def normalize_album_title(title: str) -> str:
    normalized = unicodedata.normalize("NFKC", title)
    return " ".join(normalized.split()).casefold()


def representative_artist(tracks: list[TrackTally]) -> str:
    artist_counts = Counter(track.album_artist or track.artist for track in tracks)
    if not artist_counts:
        return "Unknown artist"
    return sorted(
        artist_counts.items(),
        key=lambda item: (-item[1], item[0].casefold()),
    )[0][0]


def distinct_catalog_numbers(tracks: list[TrackTally]) -> list[str]:
    numbers: dict[str, str] = {}
    for track in tracks:
        for number in track.catalog_numbers:
            numbers.setdefault(number.casefold(), number)
    return sorted(numbers.values(), key=str.casefold)


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
                "catalogNumbers": distinct_catalog_numbers(tracks),
                "trackCount": len(tracks),
                "totalListens": sum(track.listens for track in tracks),
                "tracks": [
                    {
                        "title": track.title,
                        "artist": track.artist,
                        "contributingArtist": track.contributing_artist,
                        "listens": track.listens,
                        "trackNumber": track.track_number,
                        "discNumber": track.disc_number,
                        "durationSeconds": track.duration_seconds,
                        "playCount": track.play_count,
                    }
                    for track in ranked_tracks
                ],
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
        indexed.setdefault(normalize_asset_key(path.stem), path)
    return indexed


def normalize_asset_key(key: str) -> str:
    """Match ASCII artwork keys to accented local filenames."""
    decomposed = unicodedata.normalize("NFKD", key)
    return "".join(char for char in decomposed if not unicodedata.combining(char)).casefold()


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

        source = cover_files.get(normalize_asset_key(asset_key))
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


def skip_ts_string(source: str, index: int) -> int:
    quote = source[index]
    index += 1
    while index < len(source):
        if source[index] == "\\":
            index += 2
        elif source[index] == quote:
            return index + 1
        else:
            index += 1
    raise RuntimeError("Unterminated string in album settings")


def skip_ts_comment(source: str, index: int) -> int | None:
    if source.startswith("//", index):
        end = source.find("\n", index)
        return len(source) if end < 0 else end + 1
    if source.startswith("/*", index):
        end = source.find("*/", index + 2)
        if end < 0:
            raise RuntimeError("Unterminated comment in album settings")
        return end + 2
    return None


def skip_ts_spacing(source: str, index: int) -> int:
    while index < len(source):
        if source[index].isspace():
            index += 1
        elif (end := skip_ts_comment(source, index)) is not None:
            index = end
        else:
            break
    return index


def scan_ts_object(source: str, index: int) -> int:
    if source[index] != "{":
        raise RuntimeError("Expected an object in album settings")
    depth = 0
    while index < len(source):
        character = source[index]
        if character in ('"', "'", "`"):
            index = skip_ts_string(source, index)
        elif (end := skip_ts_comment(source, index)) is not None:
            index = end
        elif character == "{":
            depth += 1
            index += 1
        elif character == "}":
            depth -= 1
            index += 1
            if depth == 0:
                return index
        else:
            index += 1
    raise RuntimeError("Unclosed object in album settings")


def parse_album_settings_entries(source: str) -> dict[str, tuple[str, str]]:
    """Keep each hand-edited override intact while sorting top-level album keys."""
    entries: dict[str, tuple[str, str]] = {}
    index = 0
    while index < len(source):
        while index < len(source) and source[index].isspace():
            index += 1
        if index == len(source):
            break
        if source[index] != '"':
            raise RuntimeError("Unexpected content in sorted album settings; no changes made")
        start = index
        index = skip_ts_string(source, index)
        title = json.loads(source[start:index])
        index = skip_ts_spacing(source, index)
        if index >= len(source) or source[index] != ":":
            raise RuntimeError(f"Missing colon after album title {title!r}")
        index = skip_ts_spacing(source, index + 1)
        if index >= len(source) or source[index] != "{":
            raise RuntimeError(f"Missing override object for album {title!r}")
        index = scan_ts_object(source, index)
        while index < len(source) and source[index].isspace():
            index += 1
        if index >= len(source) or source[index] != ",":
            raise RuntimeError(f"Missing trailing comma for album {title!r}")
        index += 1
        entry = "\n".join(line.rstrip() for line in source[start:index].splitlines())
        normalized = normalize_album_title(title)
        if normalized in entries:
            raise RuntimeError(f"Duplicate album setting for {title!r}")
        entries[normalized] = (title, entry)
    return entries


def sync_album_settings(albums: list[dict[str, Any]]) -> list[str]:
    settings_path = ALBUM_SETTINGS_PATH.resolve()
    ensure_portfolio_path(settings_path)
    source = settings_path.read_text(encoding="utf-8")
    if source.count(ALBUM_SETTINGS_START) != 1 or source.count(ALBUM_SETTINGS_END) != 1:
        raise RuntimeError("Album settings sorting markers are missing or duplicated")
    albums_property = source.index("  albums: {", source.index("export const albumSettings"))
    albums_open = source.index("{", albums_property)
    albums_close = scan_ts_object(source, albums_open) - 1
    start_marker = source.index(ALBUM_SETTINGS_START)
    end_marker = source.index(ALBUM_SETTINGS_END)
    if not albums_open < start_marker < end_marker < albums_close:
        raise RuntimeError("Album settings sorting markers are outside the albums object")
    before_entries = source[albums_open + 1:start_marker]
    after_entries = source[end_marker + len(ALBUM_SETTINGS_END):albums_close]
    if (skip_ts_spacing(before_entries, 0) != len(before_entries)
            or skip_ts_spacing(after_entries, 0) != len(after_entries)):
        raise RuntimeError("Album settings exist outside the sorted section; no changes made")
    start = source.index(ALBUM_SETTINGS_START) + len(ALBUM_SETTINGS_START)
    end = source.index(ALBUM_SETTINGS_END, start)
    entries = parse_album_settings_entries(source[start:end])

    added: list[str] = []
    for album in albums:
        title = str(album["album"])
        normalized = normalize_album_title(title)
        if normalized not in entries:
            entries[normalized] = (title, f"{json.dumps(title, ensure_ascii=False)}: {{}},")
            added.append(title)

    sorted_entries = sorted(entries.values(), key=lambda entry: (normalize_album_title(entry[0]), entry[0]))
    replacement = "\n\n" + "\n\n".join(f"    {entry}" for _, entry in sorted_entries) + "\n\n"
    updated = source[:start] + replacement + source[end:]
    if updated != source:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="\n", dir=settings_path.parent,
            prefix=".album-settings-", suffix=".tmp", delete=False,
        ) as temporary:
            temporary.write(updated)
            temporary_path = Path(temporary.name)
        try:
            temporary_path.replace(settings_path)
        finally:
            temporary_path.unlink(missing_ok=True)
    return sorted(added, key=normalize_album_title)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="backslashreplace")
    arguments = parse_arguments()
    logger_root = arguments.logger_root.expanduser().resolve()
    snapshot_directory = logger_root / "data" / "snapshots"
    snapshots = load_snapshots(snapshot_directory)

    tallies = inclusive_tallies(snapshots, live_wmp_metadata())
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
    added_album_settings = sync_album_settings(albums)
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
    if added_album_settings:
        print("Added empty album settings: " + ", ".join(added_album_settings))
    if missing_artwork_mappings:
        print("Albums without artwork mappings: " + ", ".join(missing_artwork_mappings))
    if missing_cover_files:
        print("Artwork mappings without local files: " + ", ".join(missing_cover_files))


if __name__ == "__main__":
    main()
