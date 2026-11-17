# zaynedoc.dev

### The third iteration of my portfolio website

#### "Less is always more" - James Blake

------

## Refresh listening data

```powershell
$env:WMPL_LOGGER_ROOT = "C:\path\to\repo\WMPL-Wrap"
```

Set the logger's absolute path when it is not in the expected repository folder.
WMPL Wrap album art defaults to your Music library's `_coverarts` folder. Override
that location when necessary:

```powershell
$env:WMPL_COVER_ART_ROOT = "C:\path\to\Music\_coverarts"
```

```powershell
npm run data:listening
```

Import the active WMPL snapshots and regenerate the album listening dataset. The
website importer always includes first-seen WMP counts, regardless of the WMPL Wrap
desktop setting. It reads WMPL Wrap and your media-library metadata without changing
either one, and it refuses to write anywhere outside this portfolio repository.

Every album in the latest snapshot is included, even if it has no recorded listens.
On Windows, the importer also reads the current Windows Media Player library for
the displayed track title, all contributing artists, track and disc numbers,
duration, album artist, and
current play count. These fields populate `/library`; the existing snapshot
totals continue to populate the portfolio carousel. If WMP is unavailable, the
import falls back to snapshot fields. Local media paths are only used to match
records during import and are never written to the generated JSON.
The importer also reads Picard's `CATALOGNUMBER` tag directly from each local
audio file. Distinct numbers from every track in an album appear in its detail
view; albums without the tag display `Unknown`.
The importer reads WMPL Wrap's `data/desktop-settings.json`, joins each album to its
Discord asset key, and copies the matching `_coverarts` file into
`public/images/albums/wmpl-imported`. Only the portable website path is written to
the generated dataset; local file paths are never exposed. New albums use
`public/images/albums/wmp_empty.png` only when their mapping or local cover is missing.

### Show or hide imported albums

Edit `app/data/album-settings.ts`. Each `npm run data:listening` run adds an empty
entry for any imported album missing from the file and sorts the entries by album
title. Existing overrides and notes are preserved, so you can edit the generated
`{}` entry without copying the WMPL album title yourself. New albums follow
`defaultVisibility`, which is `"show"` by default. For example:

```ts
albums: {
  "Parousia": { visibility: "hide" },
  "Quietus Ray": {
    visibility: "show",
    coverSrc: "/images/albums/quietus-ray.webp",
    coverAlt: "Quietus Ray album cover",
  },
},
```

Keep overrides within the sorted section's markers; edit their values freely.

Changing `visibility` never deletes listening data; it only controls whether the
album appears in the public carousel. Album-title matching ignores capitalization,
leading or trailing spaces, and repeated spaces. A manually configured `coverSrc`
takes precedence over automatically imported artwork.
Add `notes` to an album override to show a Notes section on that album's
`/library` detail view. Leave it unset to omit the section. Separate paragraphs
with `\n\n` in the note string.

These snapshots are sourced from your metadata of a valid [WMPL Wrap](https://github.com/zaynedoc/WMPL-Wrap) instance.

------

## Past portfolio iterations

[zaynedoc.dev v2.5](https://github.com/zaynedoc/zaynedoc.dev_2): Next.js + Figma; never deployed

[zaynedoc.dev v2](https://github.com/zaynedoc/zaynedoc.dev): Next.js + Figma; previously deployed on Vercel

[zaynedoc.dev v1](https://github.com/zaynedoc/portfolio-archive2): Next.js; previously deployed on Vercel

[zaynedoc.dev v0](https://github.com/zaynedoc/portfolio-archive1): ASP.NET Core; previously deployed on Azure
