# Distilled Markets — Member Research Tools

Three research tools for members, served as one static page with tabs:

1. **Portfolio Structures** — allocation pies per market regime (Growth / Defensive) and risk profile (Conservative / Balanced / Aggressive)
2. **Core Asset Library** — the ETF building blocks and why each is on the list
3. **DCA Zone Map** — weekly prices vs. accumulation bands, with the active zone computed in the browser

## How it works

- **No build step.** Plain HTML/CSS/JS. What's in this repo is exactly what's served.
- **All data lives in [`data/portfolios.json`](data/portfolios.json) and [`data/prices.json`](data/prices.json)** and is fetched by the browser at page load. No data values are bundled or hardcoded — though the structural key names the site looks for are fixed (`growth_market`, `defensive_market`, the three profile names, and the three category names; see [DATA-GUIDE.md](DATA-GUIDE.md)).
- **To change anything members see, edit those two files on GitHub** — see [DATA-GUIDE.md](DATA-GUIDE.md). Netlify republishes automatically on every commit (~30 seconds).

## Files

```
index.html          the app shell (3 tabs)
css/styles.css      dark theme, mobile-first
js/app.js           fetches the JSON and renders everything
data/*.json         ← the only files you edit week to week
DATA-GUIDE.md       plain-English editing instructions
```

Prices are entered manually (roughly weekly). There is intentionally no market-data API: free API tiers do not license display inside a paid membership product.

Educational framework, not personalized advice.
