"""Summarize WMPL Wrap snapshot intervals for the public library overview."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any
import unicodedata


PERIODS = {"week": 7, "month": 31, "year": 365, "all": None}
RANKING_LIMIT = 5


def _key(value: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", value).split()).casefold()


def _captured_at(snapshot: dict[str, Any]) -> datetime:
    return datetime.fromisoformat(str(snapshot["CapturedAtUtc"]).replace("Z", "+00:00"))


def _track_map(snapshot: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(track["Id"]): track
        for track in snapshot.get("Tracks", [])
        if isinstance(track, dict) and track.get("Id")
    }


def _count(track: dict[str, Any]) -> int:
    try:
        return max(0, int(track.get("PlayCount") or 0))
    except (TypeError, ValueError):
        return 0


def _duration(track: dict[str, Any], live: dict[str, Any]) -> float:
    try:
        seconds = float(live.get("duration") or track.get("Duration") or 0)
        return seconds if 0 <= seconds < 86400 else 0
    except (TypeError, ValueError):
        return 0


def _rank(groups: dict[str, dict[str, Any]], metric: str) -> list[dict[str, Any]]:
    return sorted(
        groups.values(),
        key=lambda row: (-row[metric], row["name"].casefold()),
    )[:RANKING_LIMIT]


def _summarize_period(
    snapshots: list[tuple[Any, dict[str, Any]]],
    latest_tracks: dict[str, dict[str, Any]],
    live_metadata: dict[str, dict[str, Any]],
    albums: list[dict[str, Any]],
    days: int | None,
) -> dict[str, Any]:
    first = _captured_at(snapshots[0][1])
    latest = _captured_at(snapshots[-1][1])
    cutoff = latest - timedelta(days=days) if days is not None else first
    counts: defaultdict[str, int] = defaultdict(int)

    if first >= cutoff:
        for track_id, track in _track_map(snapshots[0][1]).items():
            counts[track_id] += _count(track)

    for index in range(1, len(snapshots)):
        end = snapshots[index][1]
        if _captured_at(end) <= cutoff:
            continue
        previous = _track_map(snapshots[index - 1][1])
        for track_id, current in _track_map(end).items():
            old = previous.get(track_id)
            current_count = _count(current)
            if old is None:
                counts[track_id] += current_count
            elif current_count >= _count(old):
                counts[track_id] += current_count - _count(old)

    album_lookup = {_key(str(album["album"])): album for album in albums}
    artists: dict[str, dict[str, Any]] = {}
    album_groups: dict[str, dict[str, Any]] = {}
    tracks: dict[str, dict[str, Any]] = {}
    artist_cover_counts: defaultdict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    total_listens = 0
    total_seconds = 0.0

    # Wrap's reports rank items still present in the latest WMP library.
    for track_id, listens in counts.items():
        source = latest_tracks.get(track_id)
        if source is None or listens <= 0:
            continue
        live = live_metadata.get(str(source.get("SourceUrl") or "").casefold(), {})
        title = str(live.get("title") or source.get("Title") or "").strip()
        artist = str(live.get("artist") or source.get("Artist") or "Unknown artist").strip()
        album_title = str(live.get("album") or source.get("Album") or "Unknown album").strip()
        album = album_lookup.get(_key(album_title), {})
        cover = str(album.get("coverSrc") or "")
        seconds = _duration(source, live) * listens
        total_listens += listens
        total_seconds += seconds

        artist_key = _key(artist)
        artist_row = artists.setdefault(artist_key, {
            "name": artist, "listens": 0, "listeningSeconds": 0, "coverSrc": "",
        })
        artist_row["listens"] += listens
        artist_row["listeningSeconds"] += seconds
        artist_cover_counts[artist_key][album_title] += listens

        album_key = _key(album_title)
        album_row = album_groups.setdefault(album_key, {
            "name": album_title,
            "detail": str(album.get("artist") or artist),
            "listens": 0,
            "listeningSeconds": 0,
            "coverSrc": cover,
        })
        album_row["listens"] += listens
        album_row["listeningSeconds"] += seconds

        tracks[track_id] = {
            "name": title,
            "detail": artist,
            "listens": listens,
            "listeningSeconds": seconds,
            "coverSrc": cover,
        }

    for artist_key, artist_row in artists.items():
        covered = sorted(
            artist_cover_counts[artist_key].items(),
            key=lambda item: (-item[1], item[0].casefold()),
        )
        for album_title, _ in covered:
            cover = album_lookup.get(_key(album_title), {}).get("coverSrc")
            if cover:
                artist_row["coverSrc"] = cover
                break

    for group in (artists, album_groups, tracks):
        for row in group.values():
            row["listeningSeconds"] = round(row["listeningSeconds"])

    groups = {"artists": artists, "albums": album_groups, "tracks": tracks}
    return {
        "fromUtc": max(cutoff, first).isoformat(),
        "throughUtc": latest.isoformat(),
        "listens": total_listens,
        "listeningSeconds": round(total_seconds),
        "rankings": {
            metric: {name: _rank(group, metric) for name, group in groups.items()}
            for metric in ("listens", "listeningSeconds")
        },
    }


def generate_library_overview(
    snapshots: list[tuple[Any, dict[str, Any]]],
    live_metadata: dict[str, dict[str, Any]],
    albums: list[dict[str, Any]],
) -> dict[str, Any]:
    latest_tracks = _track_map(snapshots[-1][1])
    return {
        "source": {
            "capturedAtUtc": str(snapshots[-1][1]["CapturedAtUtc"]),
            "firstSnapshotAtUtc": str(snapshots[0][1]["CapturedAtUtc"]),
            "snapshotCount": len(snapshots),
            "countMode": "first-seen WMP counts plus positive deltas between active snapshots",
        },
        "periods": {
            name: _summarize_period(snapshots, latest_tracks, live_metadata, albums, days)
            for name, days in PERIODS.items()
        },
    }
