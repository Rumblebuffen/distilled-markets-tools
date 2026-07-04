/* Distilled Markets — Member Research Tools
   All data is fetched at page load from /data/*.json.
   Nothing is hardcoded here: edit the JSON files and refresh. */

'use strict';

/* ---------- Constants (labels & colors only — never data) ---------- */

var COLORS = { core: '#4da3ff', defensive: '#37d399', aggressive: '#f5a623' };

var CATEGORIES = [
  { key: 'core', label: 'Core' },
  { key: 'defensive', label: 'Defensive' },
  { key: 'aggressive', label: 'Aggressive' }
];

var REGIMES = [
  { key: 'growth_market', label: 'Growth Market' },
  { key: 'defensive_market', label: 'Defensive Market' }
];

var PROFILES = [
  { key: 'conservative', label: 'Conservative Approach' },
  { key: 'balanced', label: 'Balanced Approach' },
  { key: 'aggressive', label: 'Aggressive Approach' }
];

var ZONES = [
  { key: 'aggressive', label: 'Aggressive' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'slow', label: 'Slow' }
];

/* ---------- Small helpers ---------- */

function $(sel) { return document.querySelector(sel); }

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function money(n) {
  var num = Number(n);
  if (!isFinite(num)) return '—';
  return '$' + num.toLocaleString('en-US', {
    minimumFractionDigits: (num >= 1000 && num % 1 === 0) ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function formatDate(iso) {
  if (!iso) return '';
  var d = new Date(String(iso) + 'T00:00:00');
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function errorCard(file, message) {
  return '<div class="data-error"><strong>Couldn&rsquo;t load <code>' + esc(file) + '</code>.</strong> ' +
    'This usually means the file has a small formatting error from a recent edit &mdash; most often a missing comma or quotation mark. ' +
    'Open the file on GitHub, review the last change, then refresh this page.' +
    (message ? ' <span class="muted">(Details: ' + esc(message) + ')</span>' : '') +
    '</div>';
}

async function loadJSON(path) {
  var res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  try {
    return await res.json();
  } catch (e) {
    throw new Error('the file is not valid JSON');
  }
}

/* ---------- Pie chart (inline SVG, no libraries) ---------- */

function pieSVG(segments) {
  var parts = segments.filter(function (s) { return s.value > 0; });
  var total = parts.reduce(function (sum, s) { return sum + s.value; }, 0);
  var cx = 100, cy = 100, r = 92;

  var svgOpen = '<svg viewBox="0 0 200 200" role="img" aria-label="Allocation chart: ' +
    esc(segments.map(function (s) { return s.label + ' ' + s.value + '%'; }).join(', ')) + '">';

  if (total <= 0) {
    return svgOpen + '<circle cx="100" cy="100" r="' + r + '" fill="none" stroke="#1e2735" stroke-width="2"/></svg>';
  }

  var slices = '';
  var labels = '';

  if (parts.length === 1) {
    slices = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + parts[0].color + '"/>';
    labels = pieLabel(cx, cy, Math.round(parts[0].value));
  } else {
    var angle = -90;
    parts.forEach(function (p) {
      var sweep = (p.value / total) * 360;
      var a0 = angle * Math.PI / 180;
      var a1 = (angle + sweep) * Math.PI / 180;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var large = sweep > 180 ? 1 : 0;

      slices += '<path d="M ' + cx + ' ' + cy + ' L ' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
        ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' Z" fill="' + p.color + '"/>';

      // Label with the entered value (not the renormalized share) so the
      // pie always agrees with the numbers printed under it.
      var pct = Math.round(p.value);
      if (p.value / total >= 0.06) {
        var mid = (angle + sweep / 2) * Math.PI / 180;
        var lx = cx + r * 0.6 * Math.cos(mid);
        var ly = cy + r * 0.6 * Math.sin(mid);
        labels += pieLabel(lx, ly, pct);
      }
      angle += sweep;
    });
  }

  return svgOpen + slices + labels + '</svg>';
}

function pieLabel(x, y, pct) {
  return '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" text-anchor="middle" dominant-baseline="middle" ' +
    'font-size="14" font-weight="700" fill="#0b1220">' + pct + '%</text>';
}

/* ---------- Tool 1: Portfolio Structures ---------- */

function renderStructures(root, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  var html = '';

  REGIMES.forEach(function (regime) {
    var group = data[regime.key];
    if (!group || typeof group !== 'object') return;

    var cards = '';
    PROFILES.forEach(function (profile) {
      var p = group[profile.key];
      if (!p || typeof p !== 'object') return;
      cards += profileCard(profile.label, p);
    });
    if (!cards) return;

    html += '<section class="regime-card">' +
      '<h2 class="regime-title">' + esc(regime.label) + '</h2>' +
      '<div class="profile-grid">' + cards + '</div>' +
      '</section>';
  });

  root.innerHTML = html || '<div class="data-error">No portfolio structures found in <code>data/portfolios.json</code>. Expected <code>growth_market</code> and <code>defensive_market</code> sections.</div>';
}

function profileCard(title, portfolio) {
  var warnings = '';

  var totals = CATEGORIES.map(function (cat) {
    var raw = portfolio[cat.key];
    var num = Number(raw);
    var unreadable = raw !== undefined && raw !== null && raw !== '' && !isFinite(num);
    if (unreadable) {
      warnings += '<p class="sum-warning">&#9888; ' + esc(cat.label) + ' is set to &ldquo;' + esc(String(raw)) +
        '&rdquo;, which isn&rsquo;t a plain number &mdash; remove any quotes or % sign in data/portfolios.json.</p>';
    }
    return {
      key: cat.key,
      label: cat.label,
      color: COLORS[cat.key],
      value: isFinite(num) ? num : 0,
      raw: raw,
      unreadable: unreadable
    };
  });

  var anyUnreadable = totals.some(function (t) { return t.unreadable; });
  var totalSum = totals.reduce(function (s, t) { return s + t.value; }, 0);
  if (!anyUnreadable && totalSum > 0 && Math.abs(totalSum - 100) > 0.5) {
    warnings += '<p class="sum-warning">&#9888; Category percentages add up to ' + totalSum + '% (expected 100%). Check data/portfolios.json.</p>';
  }
  totals.forEach(function (t) {
    if (t.value < 0) {
      warnings += '<p class="sum-warning">&#9888; ' + esc(t.label) + ' is set to ' + t.value + '% &mdash; percentages can&rsquo;t be negative. Check data/portfolios.json.</p>';
    }
  });

  var holdingsRoot = (portfolio.holdings && typeof portfolio.holdings === 'object' && !Array.isArray(portfolio.holdings))
    ? portfolio.holdings : null;

  var breakdown = '';
  totals.forEach(function (cat) {
    var pctText = cat.unreadable ? esc(String(cat.raw)) : cat.value + '%';
    breakdown += '<div class="cat-block">' +
      '<div class="cat-head"><span class="dot ' + cat.key + '"></span>' + esc(cat.label) +
      '<span class="pct">' + pctText + '</span></div>';

    var holdings = holdingsRoot && holdingsRoot[cat.key];

    if (Array.isArray(holdings)) {
      warnings += '<p class="sum-warning">&#9888; ' + esc(cat.label) + ' holdings should be written as { "TICKER": number, ... }, not a list &mdash; check data/portfolios.json.</p>';
      if (cat.value <= 0 && !cat.unreadable) breakdown += '<div class="no-alloc">No allocation in this tier</div>';
    } else if (holdings && typeof holdings === 'object') {
      var holdSum = 0;
      Object.keys(holdings).forEach(function (ticker) {
        var pct = Number(holdings[ticker]) || 0;
        holdSum += pct;
        breakdown += '<div class="holding-row"><span class="dot ' + cat.key + '"></span>' +
          '<span class="ticker">' + esc(ticker) + '</span>' +
          '<span class="pct">' + pct + '%</span></div>';
      });
      if (!cat.unreadable && Math.abs(holdSum - cat.value) > 0.5) {
        warnings += '<p class="sum-warning">&#9888; ' + esc(cat.label) + ' tickers add up to ' + holdSum + '% but the category is set to ' + cat.value + '%.</p>';
      }
    } else if (cat.value <= 0 && !cat.unreadable) {
      breakdown += '<div class="no-alloc">No allocation in this tier</div>';
    } else if (holdingsRoot) {
      // Category has an allocation but no holdings entry — most likely a
      // misspelled category name inside "holdings".
      warnings += '<p class="sum-warning">&#9888; No tickers listed under &ldquo;holdings&rdquo; for ' + esc(cat.label) +
        ' &mdash; check that the category names inside holdings are spelled exactly core, defensive, aggressive.</p>';
    }
    breakdown += '</div>';
  });

  return '<article class="profile-card">' +
    '<h3 class="profile-title">' + esc(title) + '</h3>' +
    '<div class="pie-wrap">' + pieSVG(totals) + '</div>' +
    breakdown +
    warnings +
    '<p class="chart-disclaimer">Educational framework, not personalized advice.</p>' +
    '</article>';
}

/* ---------- Tool 2: Core Asset Library ---------- */

function renderAssets(root, assets) {
  if (!Array.isArray(assets) || assets.length === 0) {
    root.innerHTML = '<div class="data-error">No assets found. Expected an <code>assets</code> list in <code>data/portfolios.json</code>.</div>';
    return;
  }

  var rows = '';
  assets.forEach(function (a) {
    if (!a || typeof a !== 'object') return;
    var cat = String(a.category || '').toLowerCase();
    var catClass = COLORS[cat] ? cat : '';
    var catLabel = catClass ? catClass.charAt(0).toUpperCase() + catClass.slice(1) : (a.category ? String(a.category) : '—');

    rows += '<tr>' +
      '<td class="cell-main" data-label="Ticker"><span class="ticker">' + esc(a.ticker || '—') + '</span></td>' +
      '<td data-label="Name">' + esc(a.name || '—') + '</td>' +
      '<td data-label="Category"><span class="cat-pill ' + catClass + '">' + esc(catLabel) + '</span></td>' +
      '<td data-label="Rationale"><span>' + esc(a.rationale || '') + '</span></td>' +
      '</tr>';
  });

  root.innerHTML = '<div class="table-card"><table class="rtable">' +
    '<thead><tr><th>Ticker</th><th>Name</th><th>Category</th><th>Rationale</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

/* ---------- Tool 3: DCA Zone Map ---------- */

function activeZone(price, entry) {
  var bands = [];
  ZONES.forEach(function (z) {
    var b = entry[z.key];
    if (Array.isArray(b) && b.length === 2 && isFinite(Number(b[0])) && isFinite(Number(b[1]))) {
      bands.push({
        key: z.key,
        label: z.label,
        lo: Math.min(Number(b[0]), Number(b[1])),
        hi: Math.max(Number(b[0]), Number(b[1]))
      });
    }
  });

  if (!bands.length || !isFinite(price)) return { key: 'unknown', label: '—' };

  // Exact containment first (bands checked deepest-discount first).
  for (var i = 0; i < bands.length; i++) {
    if (price >= bands[i].lo && price <= bands[i].hi) return bands[i];
  }

  var maxHi = Math.max.apply(null, bands.map(function (b) { return b.hi; }));
  if (price > maxHi) return { key: 'above', label: 'Above zones' };

  // Price falls in a gap between bands (usually a band was deleted or its
  // edges no longer touch). Say so honestly instead of borrowing a badge.
  return { key: 'unknown', label: 'Between zones' };
}

function bandText(b) {
  if (!Array.isArray(b) || b.length !== 2 || !isFinite(Number(b[0])) || !isFinite(Number(b[1]))) return '—';
  var lo = Math.min(Number(b[0]), Number(b[1]));
  var hi = Math.max(Number(b[0]), Number(b[1]));
  if (lo <= 0) return 'Below ' + money(hi);
  return money(lo) + ' &ndash; ' + money(hi);
}

function renderDca(root, prices, nameIndex) {
  var assets = prices && prices.assets;
  if (!assets || typeof assets !== 'object' || Array.isArray(assets) || Object.keys(assets).length === 0) {
    root.innerHTML = '<div class="data-error">No prices found. Expected an <code>assets</code> section in <code>data/prices.json</code>.</div>';
    return;
  }

  var updatedEl = $('#dca-updated');
  if (updatedEl && prices.updated) {
    updatedEl.textContent = 'Last update: ' + formatDate(prices.updated);
  }

  var rows = '';
  Object.keys(assets).forEach(function (ticker) {
    var entry = assets[ticker];
    // Tolerate founder shorthand ("VOO": 512.30) and half-finished edits:
    // keep the row visible with dashes rather than silently dropping it.
    if (typeof entry === 'number' && isFinite(entry)) entry = { price: entry };
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) entry = {};

    // A cleared price ("" or null) must read as unknown, never as $0.00 —
    // 0 would land inside every [0, X] aggressive band and fake a buy signal.
    var rawPrice = entry.price;
    var price = (typeof rawPrice === 'number' || (typeof rawPrice === 'string' && rawPrice.trim() !== ''))
      ? Number(rawPrice) : NaN;
    if (!(price > 0)) price = NaN;

    var zone = activeZone(price, entry);
    var name = nameIndex[String(ticker).toUpperCase()] || '';

    rows += '<tr>' +
      '<td class="cell-main" data-label="Asset"><span class="ticker">' + esc(ticker) + '</span>' +
      (name ? '<br><span class="asset-name">' + esc(name) + '</span>' : '') + '</td>' +
      '<td class="price-cell" data-label="Latest price">' + money(price) + '</td>' +
      '<td data-label="Active zone"><span class="badge badge-' + zone.key + '">' + esc(zone.label) + '</span></td>' +
      '<td class="band-cell" data-label="Slow band">' + bandText(entry.slow) + '</td>' +
      '<td class="band-cell" data-label="Moderate band">' + bandText(entry.moderate) + '</td>' +
      '<td class="band-cell" data-label="Aggressive band">' + bandText(entry.aggressive) + '</td>' +
      '</tr>';
  });

  root.innerHTML = '<div class="table-card"><table class="rtable">' +
    '<thead><tr><th>Asset</th><th>Latest price</th><th>Active zone</th><th>Slow</th><th>Moderate</th><th>Aggressive</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

/* ---------- Tabs ---------- */

function activateTab(name) {
  var valid = ['structures', 'assets', 'dca'];
  if (valid.indexOf(name) === -1) name = 'structures';

  valid.forEach(function (key) {
    var btn = $('#tabbtn-' + key);
    var panel = $('#panel-' + key);
    var on = key === name;
    if (btn) btn.setAttribute('aria-selected', on ? 'true' : 'false');
    if (panel) panel.hidden = !on;
    if (btn && on && btn.scrollIntoView) {
      btn.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  });
}

/* On narrow screens the tab bar can overflow horizontally; show a fade at
   the right edge so members know more tabs exist. */
function initTabOverflowHint() {
  var row = document.querySelector('.tabs-row');
  var nav = document.querySelector('.tabs');
  if (!row || !nav) return;
  function update() {
    var overflowing = row.scrollWidth > row.clientWidth + 2;
    var atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
    nav.classList.toggle('has-overflow', overflowing && !atEnd);
  }
  row.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (window.ResizeObserver) new ResizeObserver(update).observe(row);
  update();
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-tab');
      if ('#' + name !== location.hash) {
        history.replaceState(null, '', '#' + name);
      }
      activateTab(name);
    });
  });

  window.addEventListener('hashchange', function () {
    activateTab(location.hash.replace('#', ''));
  });

  activateTab(location.hash.replace('#', ''));
}

/* ---------- Boot ---------- */

/* One tab's render failure must never freeze the other tabs on "Loading…". */
function safeRender(root, file, fn) {
  try {
    fn();
  } catch (e) {
    if (root) root.innerHTML = errorCard(file, e && e.message);
  }
}

async function boot() {
  initTabs();
  initTabOverflowHint();

  var results = await Promise.allSettled([
    loadJSON('data/portfolios.json'),
    loadJSON('data/prices.json')
  ]);

  var nameIndex = {};

  if (results[0].status === 'fulfilled') {
    var portfolios = results[0].value;
    safeRender($('#structures-root'), 'data/portfolios.json', function () {
      renderStructures($('#structures-root'), portfolios);
    });
    safeRender($('#assets-root'), 'data/portfolios.json', function () {
      renderAssets($('#assets-root'), portfolios && portfolios.assets);
    });
    var list = portfolios && Array.isArray(portfolios.assets) ? portfolios.assets : [];
    list.forEach(function (a) {
      if (a && a.ticker && a.name) nameIndex[String(a.ticker).toUpperCase()] = String(a.name);
    });
  } else {
    var msg = results[0].reason && results[0].reason.message;
    $('#structures-root').innerHTML = errorCard('data/portfolios.json', msg);
    $('#assets-root').innerHTML = errorCard('data/portfolios.json', msg);
  }

  if (results[1].status === 'fulfilled') {
    var prices = results[1].value;
    safeRender($('#dca-root'), 'data/prices.json', function () {
      renderDca($('#dca-root'), prices, nameIndex);
    });
  } else {
    $('#dca-root').innerHTML = errorCard('data/prices.json', results[1].reason && results[1].reason.message);
  }
}

boot();
