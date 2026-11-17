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

------

## Past portfolio iterations

[zaynedoc.dev v2.5](https://github.com/zaynedoc/zaynedoc.dev_2): Next.js + Figma; never deployed

[zaynedoc.dev v2](https://github.com/zaynedoc/zaynedoc.dev): Next.js + Figma; previously deployed on Vercel

[zaynedoc.dev v1](https://github.com/zaynedoc/portfolio-archive2): Next.js; previously deployed on Vercel

[zaynedoc.dev v0](https://github.com/zaynedoc/portfolio-archive1): ASP.NET Core; previously deployed on Azure
