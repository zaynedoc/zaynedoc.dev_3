"""Generate portfolio album listening stats from WMPL Wrap snapshots.

Only the logger's active ``data/snapshots`` directory is read. Backup folders,
including generated test snapshots, are never searched or imported.
"""

from __future__ import annotations

import argparse
import json
import os
from collections import defaultdict
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


def cumulative_tallies(latest_snapshot: dict[str, Any]) -> list[TrackTally]:
    tallies: list[TrackTally] = []
    for track in snapshot_tracks(latest_snapshot):
        listens = max(0, int(track.get("PlayCount", 0)))
        album = str(track.get("Album", "")).strip()
        title = str(track.get("Title", "")).strip()
        artist = str(track.get("Artist", "")).strip()
        if album and title and listens > 0:
            tallies.append(TrackTally(album, artist or "Unknown artist", title, listens))
    return tallies


def observed_tallies(snapshots: list[tuple[Path, dict[str, Any]]]) -> list[TrackTally]:
    """Mirror WMPL Wrap's all-time observed-delta mode when baselines are disabled."""
    if len(snapshots) < 2:
        return []

    totals: defaultdict[str, int] = defaultdict(int)
    latest_tracks: dict[str, dict[str, Any]] = {}
    previous_tracks = {
        str(track.get("Id", "")): track
        for track in snapshot_tracks(snapshots[0][1])
        if track.get("Id")
    }

    for _, snapshot in snapshots[1:]:
        current_tracks = {
            str(track.get("Id", "")): track
            for track in snapshot_tracks(snapshot)
            if track.get("Id")
        }
        for track_id, current in current_tracks.items():
            previous = previous_tracks.get(track_id)
            if previous is None:
                continue
            current_count = max(0, int(current.get("PlayCount", 0)))
            previous_count = max(0, int(previous.get("PlayCount", 0)))
            if current_count >= previous_count:
                totals[track_id] += current_count - previous_count
        previous_tracks = current_tracks
        latest_tracks = current_tracks

    tallies: list[TrackTally] = []
    for track_id, listens in totals.items():
        track = latest_tracks.get(track_id)
        if not track or listens <= 0:
            continue
        album = str(track.get("Album", "")).strip()
        title = str(track.get("Title", "")).strip()
        artist = str(track.get("Artist", "")).strip()
        if album and title:
            tallies.append(TrackTally(album, artist or "Unknown artist", title, listens))
    return tallies


def aggregate_albums(tallies: list[TrackTally]) -> list[dict[str, Any]]:
    by_album: defaultdict[str, list[TrackTally]] = defaultdict(list)
    for tally in tallies:
        by_album[tally.album].append(tally)

    albums: list[dict[str, Any]] = []
    for album, tracks in by_album.items():
        top_track = sorted(
            tracks,
            key=lambda track: (-track.listens, track.title.casefold(), track.artist.casefold()),
        )[0]
        albums.append(
            {
                "album": album,
                "totalListens": sum(track.listens for track in tracks),
                "mostListenedTrack": {
                    "title": top_track.title,
                    "artist": top_track.artist,
                    "listens": top_track.listens,
                },
            }
        )

    albums.sort(key=lambda album: (-album["totalListens"], album["album"].casefold()))
    return albums


def main() -> None:
    arguments = parse_arguments()
    logger_root = arguments.logger_root.expanduser().resolve()
    snapshot_directory = logger_root / "data" / "snapshots"
    settings_path = logger_root / "data" / "desktop-settings.json"
    snapshots = load_snapshots(snapshot_directory)

    settings = read_json(settings_path) if settings_path.is_file() else {}
    include_baseline = bool(settings.get("IncludeBaselineSnapshot", True))
    if include_baseline:
        tallies = cumulative_tallies(snapshots[-1][1])
        count_mode = "latest cumulative WMP play counts"
    else:
        tallies = observed_tallies(snapshots)
        count_mode = "positive deltas observed between active snapshots"

    latest_path, latest_snapshot = snapshots[-1]
    output = {
        "source": {
            "capturedAtUtc": latest_snapshot.get("CapturedAtUtc", ""),
            "countMode": count_mode,
            "snapshot": latest_path.name,
            "snapshotCount": len(snapshots),
        },
        "albums": aggregate_albums(tallies),
    }

    destination = arguments.output.expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    try:
        displayed_destination = destination.relative_to(SITE_ROOT)
    except ValueError:
        displayed_destination = destination.name
    print(
        f"Imported {len(output['albums'])} albums from {len(snapshots)} active snapshots "
        f"into {displayed_destination}"
    )


if __name__ == "__main__":
    main()
