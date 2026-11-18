"""Draw the library's WMPL-style social image from imported album data."""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import tempfile
import unicodedata
from functools import lru_cache
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageOps


SITE_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = SITE_ROOT / "public"
IMAGE_PATH = PUBLIC_ROOT / "images" / "library-og.png"
MANIFEST_PATH = SITE_ROOT / "app" / "data" / "library-og.generated.json"
WIDTH, HEIGHT = 1200, 630
CARD_WIDTH = 282
COVER_SIZE = 204
MAX_ALBUMS = 3


def _artist_parts(artist: str) -> set[str]:
    normalized = unicodedata.normalize("NFKC", artist).casefold()
    parts = re.split(
        r"\s*(?:×|&|;|,|\bfeat\.?\b|\bfeaturing\b|\bwith\b)\s*|\s+[xX]\s+",
        normalized,
    )
    return {part.strip(" .") for part in parts if part.strip(" .")}


def _cover_path(album: dict[str, Any]) -> Path | None:
    source = str(album.get("coverSrc") or "")
    if not source.startswith("/images/") or source.endswith("/wmp_empty.png"):
        return None
    path = (PUBLIC_ROOT / source.lstrip("/")).resolve()
    if not path.is_relative_to(PUBLIC_ROOT.resolve()) or not path.is_file():
        return None
    return path


def select_featured_albums(albums: list[dict[str, Any]]) -> list[tuple[dict[str, Any], Path]]:
    """Choose the most-listened covered albums, once per contributing artist."""
    ranked = sorted(
        albums,
        key=lambda album: (-int(album.get("totalListens") or 0), str(album.get("album") or "").casefold()),
    )
    featured: list[tuple[dict[str, Any], Path]] = []
    seen_artists: set[str] = set()
    for album in ranked:
        cover = _cover_path(album)
        artist_parts = _artist_parts(str(album.get("artist") or "Unknown artist"))
        if cover is None or not artist_parts or not seen_artists.isdisjoint(artist_parts):
            continue
        featured.append((album, cover))
        seen_artists.update(artist_parts)
        if len(featured) == MAX_ALBUMS:
            break
    return featured


@lru_cache(maxsize=None)
def _font(size: int, *, bold: bool = False, cjk: bool = False) -> ImageFont.FreeTypeFont:
    windows_fonts = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
    candidates = (
        [windows_fonts / ("YuGothB.ttc" if bold else "YuGothR.ttc"), "NotoSansCJK-Regular.ttc"]
        if cjk else
        [windows_fonts / ("seguisb.ttf" if bold else "segoeui.ttf"), "DejaVuSans.ttf"]
    )
    for candidate in candidates:
        try:
            return ImageFont.truetype(str(candidate), size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def _has_cjk(text: str) -> bool:
    return any(
        unicodedata.name(character, "").startswith(("CJK", "HIRAGANA", "KATAKANA"))
        for character in text
    )


def _text_font(text: str, size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    return _font(size, bold=bold, cjk=_has_cjk(text))


def _fit_line(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> str:
    if draw.textlength(text, font=font) <= width:
        return text
    ending = "…"
    while text and draw.textlength(text.rstrip() + ending, font=font) > width:
        text = text[:-1]
    return text.rstrip() + ending


def _two_lines(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    text = " ".join(text.split())
    if draw.textlength(text, font=font) <= width:
        return [text]
    cut = 0
    for index in range(1, len(text) + 1):
        if draw.textlength(text[:index], font=font) > width:
            break
        cut = index
    space = text.rfind(" ", 0, cut + 1)
    if space > 0:
        cut = space
    first = text[:cut].rstrip()
    remaining = text[cut:].strip()
    return [first, _fit_line(draw, remaining, font, width)]


def _gradient(draw: ImageDraw.ImageDraw, top: tuple[int, int, int], bottom: tuple[int, int, int], y0: int, y1: int, x0: int, x1: int) -> None:
    for y in range(y0, y1):
        blend = (y - y0) / max(1, y1 - y0 - 1)
        color = tuple(round(start * (1 - blend) + end * blend) for start, end in zip(top, bottom))
        draw.line((x0, y, x1, y), fill=color)


def _disc(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.ellipse((x, y, x + 15, y + 15), fill="#e9f1f8", outline="#7597b4", width=1)
    draw.ellipse((x + 4, y + 4, x + 11, y + 11), outline="#acc5da", width=1)
    draw.ellipse((x + 7, y + 7, x + 8, y + 8), fill="#6d9fc7")


def _draw_cover(canvas: Image.Image, draw: ImageDraw.ImageDraw, cover_path: Path, x: int, y: int) -> None:
    draw.rectangle((x + 5, y + 6, x + COVER_SIZE + 5, y + COVER_SIZE + 6), fill="#9caebb")
    with Image.open(cover_path) as source:
        cover = ImageOps.fit(source.convert("RGB"), (COVER_SIZE, COVER_SIZE), method=Image.Resampling.LANCZOS)
    canvas.paste(cover, (x, y))
    draw.rectangle((x, y, x + COVER_SIZE, y + COVER_SIZE), outline="#566371", width=2)


def draw_library_og(featured: list[tuple[dict[str, Any], Path]]) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), "#e5f0f8")
    draw = ImageDraw.Draw(canvas)
    _gradient(draw, (246, 250, 253), (217, 234, 246), 0, HEIGHT, 0, WIDTH)
    glow = Image.radial_gradient("L").resize((900, 760), Image.Resampling.BICUBIC)
    glow = glow.point(lambda value: round((255 - value) * 0.58))
    canvas.paste("#ffffff", (255, 10), glow)
    draw = ImageDraw.Draw(canvas)

    _gradient(draw, (249, 252, 255), (218, 231, 247), 0, 43, 0, WIDTH)
    draw.line((0, 42, WIDTH, 42), fill="#aebfd2", width=1)
    menu_font = _font(15)
    for label, x in (("Organize", 13), ("Stream", 107), ("Create playlist", 193)):
        draw.text((x, 11), label, font=menu_font, fill="#1a416c")
        arrow_x = x + round(draw.textlength(label, font=menu_font)) + 8
        draw.polygon(((arrow_x, 18), (arrow_x + 7, 18), (arrow_x + 3, 22)), fill="#294a6e")
    draw.rectangle((977, 8, 1174, 32), fill="#fafdff", outline="#92a8bd", width=1)
    draw.text((985, 10), "Search", font=_font(14), fill="#5e7290")
    draw.ellipse((1145, 14, 1155, 24), outline="#2e84c3", width=2)
    draw.line((1154, 23, 1160, 29), fill="#2e84c3", width=2)
    draw.ellipse((1180, 11, 1197, 28), fill="#3b77b6", outline="#2a5e98")
    draw.text((1186, 10), "?", font=_font(14, bold=True), fill="#ffffff")

    _gradient(draw, (246, 250, 253), (227, 241, 249), 43, HEIGHT, 0, 194)
    draw.line((194, 43, 194, HEIGHT), fill="#d0dfeb", width=1)
    draw.rectangle((23, 77, 35, 88), outline="#77a1c1", width=1)
    draw.line((25, 81, 33, 81), fill="#77a1c1")
    draw.text((43, 73), "Zayne Dockery", font=_font(16), fill="#375f89")
    draw.polygon(((15, 117), (23, 117), (19, 122)), fill="#243e5c")
    draw.text((32, 108), "♫", font=_font(20), fill="#5e96c1")
    draw.text((54, 109), "Music", font=_font(17), fill="#102c48")
    for index, (album, _) in enumerate(featured):
        y = 147 + index * 30
        _disc(draw, 37, y)
        title = str(album.get("album") or "")
        font = _text_font(title, 14)
        draw.text((60, y - 2), _fit_line(draw, title, font, 126), font=font, fill="#294a6e")

    _gradient(draw, (252, 254, 255), (239, 247, 252), 43, 71, 195, WIDTH)
    draw.line((195, 70, WIDTH, 70), fill="#c6dbea", width=1)
    for label, x, end in (("Album", 203, 407), ("Album Artist", 414, 636), ("Count", 644, 766), ("Total Listens", 774, 944)):
        draw.text((x, 49), label, font=_font(14), fill="#345c82")
        draw.line((end, 47, end, 67), fill="#d1e3ef", width=1)

    draw.text((230, 94), "Music Library", font=_font(42, bold=True), fill="#183a5b")
    draw.text((232, 149), "Zayne Dockery's album collection", font=_font(19), fill="#5f7794")
    draw.line((230, 190, 1162, 190), fill="#abc4dc", width=1)

    gap = 29
    total_width = len(featured) * CARD_WIDTH + max(0, len(featured) - 1) * gap
    first_x = 195 + (WIDTH - 195 - total_width) // 2
    for index, (album, cover_path) in enumerate(featured):
        x = first_x + index * (CARD_WIDTH + gap)
        cover_x = x + (CARD_WIDTH - COVER_SIZE) // 2
        _draw_cover(canvas, draw, cover_path, cover_x, 216)
        title = str(album.get("album") or "")
        title_font = _text_font(title, 22, bold=True)
        for line_index, line in enumerate(_two_lines(draw, title, title_font, CARD_WIDTH)):
            draw.text((x, 444 + line_index * 29), line, font=title_font, fill="#111b27")
        artist = str(album.get("artist") or "Unknown artist")
        artist_font = _text_font(artist, 17)
        draw.text((x, 511), _fit_line(draw, artist, artist_font, CARD_WIDTH), font=artist_font, fill="#506f96")
        count = int(album.get("trackCount") or 0)
        listens = int(album.get("totalListens") or 0)
        draw.text((x, 543), f"{count} songs  ·  {listens:,} listens", font=_font(16), fill="#657e9d")

    return canvas


def generate_library_og(albums: list[dict[str, Any]]) -> list[str]:
    featured = select_featured_albums(albums)
    canvas = draw_library_og(featured)
    IMAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=IMAGE_PATH.parent, prefix=".library-og-", suffix=".png", delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        canvas.save(temporary_path, format="PNG", optimize=True)
        image_bytes = temporary_path.read_bytes()
        if not IMAGE_PATH.is_file() or IMAGE_PATH.read_bytes() != image_bytes:
            temporary_path.replace(IMAGE_PATH)
    finally:
        temporary_path.unlink(missing_ok=True)

    titles = [str(album.get("album") or "") for album, _ in featured]
    alt = "Windows Media Player-style music library preview"
    if titles:
        alt += " featuring " + ", ".join(titles)
    manifest = {
        "version": hashlib.sha256(image_bytes).hexdigest()[:16],
        "alt": alt,
    }
    manifest_text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    if not MANIFEST_PATH.is_file() or MANIFEST_PATH.read_text(encoding="utf-8") != manifest_text:
        MANIFEST_PATH.write_text(manifest_text, encoding="utf-8")
    return titles


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="backslashreplace")
    dataset = json.loads((SITE_ROOT / "app" / "data" / "listening-stats.generated.json").read_text(encoding="utf-8"))
    selected_titles = generate_library_og(dataset["albums"])
    print("Generated library social image: " + ", ".join(selected_titles))
