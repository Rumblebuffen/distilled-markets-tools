# Build manifest — Distilled Markets Member Research Tools

Working checklist for finishing the build. Items are checked off as completed.
If a session is interrupted, treat this file as the source of truth for what's left.

## Done
- [x] App built: index.html, css/styles.css, js/app.js, data/portfolios.json, data/prices.json
- [x] Founder docs: DATA-GUIDE.md, README.md
- [x] Local verification (tabs, zone badges, JSON-error safety net)
- [x] Adversarial multi-agent review — 21 confirmed findings
- [x] Review fixes, part 1 (js/app.js): money() formatting; pie labels use entered
      values; profileCard warns on non-numeric values, negatives, misspelled or
      list-format holdings

## Remaining
- [x] Review fixes, part 2 (js/app.js) — all applied & verified live
- [x] Review fixes, part 3 (css/styles.css) — all applied & verified live
- [x] Review fixes, part 4 (docs) — all applied
- [x] Re-verified in browser: tabs fit at 375px; 320px scrolls with fade +
      auto-scroll-into-view; DCA table swipeable at 768px; all 8 badges correct;
      cleared price shows "—"; band gap shows "Between zones"; console clean
- [x] git commit
- [x] GitHub repo created + pushed: https://github.com/Rumblebuffen/distilled-markets-tools
- [x] Hosting: GitHub Pages (user's choice — no Netlify account needed; repo public)
- [x] Live URL verified 200, all files byte-identical to local:
      https://rumblebuffen.github.io/distilled-markets-tools/
- [x] Hand over: live URL + GitHub edit steps

## Nothing remains — build complete (2026-07-04)

## Fixed decisions (do not revisit)
- Runtime-fetched JSON only; no build step; no bundler. Founder edits via GitHub
  web editor; GitHub Pages auto-publishes (~1–2 min, up to ~10 min CDN cache).
- Manual weekly price entry — NO market-data API (all free tiers verified
  restricted for paid-membership display; see conversation 2026-07-04).
- Linked from Skool (target="_blank"), never embedded.
