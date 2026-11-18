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

The import also regenerates `public/images/library-og.png` from the three most
listened albums with available artwork, choosing each album artist
only once. It updates `app/data/library-og.generated.json` to give the image a
new share URL when its contents change. Commit both generated files alongside
the refreshed listening data and imported covers before deploying.
The library stays out of the sitemap and disallowed for search crawlers; link
preview crawlers can read its noindex page to render the social image.

The same import refreshes `app/data/library-overview.generated.json` for the
library landing view. Its week, month, and year windows are measured back from
the latest snapshot, using positive play-count changes and first-seen counts,
just as WMPL Wrap's default report does. Add physical CD photos to
`public/images/library/` and list their paths and descriptions in
`app/data/library-photos.ts` to populate the 4:3 slideshow.
To choose the six album covers shown below it, set `overviewFeatured: true`
on their existing entries in `app/data/album-settings.ts`. The import preserves
these settings when it adds or sorts albums. Unfilled spots use the first
remaining albums in alphabetical order.

------

## Past portfolio iterations

[zaynedoc.dev v2.5](https://github.com/zaynedoc/zaynedoc.dev_2): Next.js + Figma; never deployed

[zaynedoc.dev v2](https://github.com/zaynedoc/zaynedoc.dev): Next.js + Figma; previously deployed on Vercel

[zaynedoc.dev v1](https://github.com/zaynedoc/portfolio-archive2): Next.js; previously deployed on Vercel

[zaynedoc.dev v0](https://github.com/zaynedoc/portfolio-archive1): ASP.NET Core; previously deployed on Azure
