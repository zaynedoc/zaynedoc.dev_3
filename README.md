# zaynedoc.dev

### The third iteration of my portfolio website

#### "Less is always more" - James Blake

------

## Refresh listening data

```powershell
$env:WMPL_LOGGER_ROOT = "C:\path\to\repo\WMPL-Wrap"
```

Set the logger's absolute path when it is not in the expected repository folder.

```powershell
npm run data:listening
```

Import the active WMPL snapshots and regenerate the album listening dataset. The
website importer always includes first-seen WMP counts, regardless of the WMPL Wrap
desktop setting.

These snapshots are sourced from your metadata of a valid [WMPL Wrap](https://github.com/zaynedoc/WMPL-Wrap) instance.

------

## Past portfolio iterations

[zaynedoc.dev v2.5](https://github.com/zaynedoc/zaynedoc.dev_2): Next.js + Figma; never deployed

[zaynedoc.dev v2](https://github.com/zaynedoc/zaynedoc.dev): Next.js + Figma; previously deployed on Vercel

[zaynedoc.dev v1](https://github.com/zaynedoc/portfolio-archive2): Next.js; previously deployed on Vercel

[zaynedoc.dev v0](https://github.com/zaynedoc/portfolio-archive1): ASP.NET Core; previously deployed on Azure
