# Data editing guide (plain English)

Everything members see comes from two files in the `data` folder. Edit them on GitHub, commit, wait ~30 seconds, refresh the site. No other steps — ever.

**Two things to know before your first edit:**

- Each file starts with a `_note` line — that's just a reminder for you; the site ignores it completely. Leave it alone (if you ever edit it, keep the straight quotes and the comma after the closing quote).
- **Some names are fixed.** The site looks for these exact spellings and silently skips anything else: the section names `growth_market` and `defensive_market`, the profile names `conservative`, `balanced`, `aggressive`, and the category names `core`, `defensive`, `aggressive` (including inside `holdings`). Change the *numbers and tickers* freely — never rename these keys. If a category inside `holdings` is misspelled, the card shows a ⚠ warning so you can spot it.

## How to edit any file on GitHub

1. Go to your repository on **github.com** and open the `data` folder.
2. Click the file you want (`prices.json` or `portfolios.json`).
3. Click the **pencil icon** (top-right of the file view).
4. Make your changes (rules below).
5. Click the green **Commit changes** button, then **Commit changes** again in the pop-up.
6. Wait ~30–60 seconds, then refresh the tools page. Done.

This also works from your phone's browser.

## Weekly price update — `data/prices.json` (≈5 minutes)

You only change two kinds of things each week:

1. The `"updated"` date near the top — set it to today, in `YYYY-MM-DD` format:
   ```
   "updated": "2026-07-10",
   ```
2. Each asset's `"price"` number:
   ```
   "VOO":  { "price": 514.80, ... }
   ```

Leave the bands (`slow`, `moderate`, `aggressive`) alone unless you want to move a zone. The site works out each asset's **Active Zone badge automatically** by comparing the price to the bands.

**Band format:** `[low, high]`. Use `0` as the low number to mean "below X" — e.g. `"aggressive": [0, 470]` shows as "Below $470". `slow` should be the highest band, `aggressive` the lowest, and neighbouring bands should touch (the top of `moderate` = the bottom of `slow`). A price above all bands shows as "Above zones"; a price that falls in a gap between bands shows as "Between zones" — if you see that badge, one of the bands probably needs its edge adjusted.

**If you accidentally clear a price** (leave it as `""` or delete the number), that row shows "—" for the price and zone until you fix it — it will never show a false buy signal.

**Adding an asset to the DCA table:** copy an existing line, change the ticker, price, and bands. Don't forget the comma at the end of the line above it. (If the ticker also exists in the Core Asset Library, its full name appears automatically.)

## Portfolios & asset library — `data/portfolios.json`

**Changing an allocation:** each portfolio has three category numbers that should add up to 100:

```
"core": 60, "defensive": 30, "aggressive": 10,
```

**Changing the tickers under a chart:** inside `holdings`, each category lists tickers with their share. These should add up to that category's number (e.g. the three `core` tickers below add up to 60):

```
"holdings": {
  "core": { "VOO": 35, "VTI": 15, "VXUS": 10 },
  ...
}
```

If the numbers don't add up, the site still works — it just shows a small ⚠ warning on that card so you can spot the typo.

**Editing the Core Asset Library table:** each row is one line in the `assets` list. Copy a line to add one; delete a line to remove one. `category` should be `core`, `defensive`, or `aggressive` (capitalization doesn't matter). Any other word still shows in the table, but as a plain grey label without the color coding.

## The three JSON rules (avoid 99% of mistakes)

1. **Commas between items, no comma after the last one** in a list or block.
2. **Straight double quotes** `"` around all text — never curly quotes (careful if pasting from Word/Notes).
3. **No quotes around numbers**: `"price": 514.80`, not `"price": "514.80"`.

If you break the file, the site won't go blank — the affected tab shows a friendly message telling you which file to check. Fix your last edit (GitHub's **History** button shows exactly what changed) and refresh.

You can sanity-check a file before committing by pasting it into https://jsonlint.com and clicking Validate.
