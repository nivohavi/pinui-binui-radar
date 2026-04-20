# UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the 10-page pinui-binui radar into a 3-view SPA-like dashboard with modern SaaS design, persistent sidebar, and hash-based routing.

**Architecture:** Single `index.html` shell with `app.js` handling routing and view rendering. `cities.js` and `listings.json` remain unchanged. All old pages archived to `old/` directory.

**Tech Stack:** Vanilla JS (no framework), CSS custom properties, Heebo font, Chart.js for timeline visualization, hash-based routing.

**Spec:** `docs/superpowers/specs/2026-04-18-ui-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `givatayim-pinui-radar/index.html` | Rewrite | HTML shell: `<head>`, sidebar skeleton, `<main>` container |
| `givatayim-pinui-radar/app.js` | Create | Router, state management, all 3 view renderers, sidebar logic |
| `givatayim-pinui-radar/styles.css` | Rewrite | New design system: colors, typography, layout, all components |
| `givatayim-pinui-radar/cities.js` | Unchanged | Data + utility functions (already has all needed functions) |
| `givatayim-pinui-radar/listings.json` | Unchanged | Listing data |
| `givatayim-pinui-radar/old/` | Create dir | Archive of all old HTML pages |

---

### Task 1: Archive Old Pages & Create Shell

**Files:**
- Move: `givatayim-pinui-radar/*.html` (except index.html) → `givatayim-pinui-radar/old/`
- Rewrite: `givatayim-pinui-radar/index.html`

- [ ] **Step 1: Create old/ directory and move pages**

```bash
cd /Users/nivo/Documents/pinui-binui-radar/givatayim-pinui-radar
mkdir -p old
for f in zones.html prices.html search.html score.html checklist.html workflow.html glossary.html resources.html compare.html; do
  [ -f "$f" ] && mv "$f" old/
done
```

- [ ] **Step 2: Write the HTML shell**

Rewrite `index.html` to be the single-page app shell. This file contains ONLY structure — no view content. Views are rendered by `app.js`.

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>רדאר פינוי-בינוי</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<link rel="stylesheet" href="styles.css?v=20260418f">
</head>
<body>

<div class="app">
  <!-- Sidebar — persistent across all views -->
  <aside class="sidebar" id="sidebar"></aside>

  <!-- Main content — swapped by router -->
  <main class="main" id="main"></main>
</div>

<script src="cities.js?v=20260418f"></script>
<script src="app.js?v=20260418f"></script>

</body>
</html>
```

- [ ] **Step 3: Verify shell loads without errors**

Open `index.html` in browser. Should show blank page with no console errors (app.js doesn't exist yet, so one 404 is expected for now).

---

### Task 2: Write the New Design System (styles.css)

**Files:**
- Rewrite: `givatayim-pinui-radar/styles.css`

- [ ] **Step 1: Write the complete CSS file**

Replace the entire `styles.css` with the new design system. This is a full rewrite — every class is new.

```css
/* ═══════════════════════════════════════════════════════════════════
   Pinui-Binui Radar — Design System v2 (SaaS Dashboard)
   ═══════════════════════════════════════════════════════════════════ */

/* ── Tokens ── */
:root {
  --bg:         #0c1222;
  --bg-deep:    #0a0f1a;
  --surface:    #162032;
  --surface-hi: #1a2a40;
  --border:     #243448;
  --border-hi:  #2d4a64;

  --text:       #e2e8f0;
  --muted:      #7c9ab8;
  --faint:      #4a6a82;

  --accent:     #06b6d4;
  --accent-lt:  #22d3ee;

  --good:       #34d399;
  --warn:       #fbbf24;
  --bad:        #fb7185;

  --yad2:       #ff9800;
  --madlan:     #06b6d4;
  --facebook:   #1877f2;
  --nadlan:     #34d399;
  --homeless:   #a78bfa;
  --komo:       #fbbf24;

  --sidebar-w:  220px;
  --radius:     10px;
  --radius-sm:  6px;
  --radius-xs:  4px;
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: var(--bg); color: var(--text); font-family: 'Heebo', system-ui, sans-serif; min-height: 100vh; line-height: 1.6; font-size: 14px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font-family: inherit; cursor: pointer; }
input, select { font-family: inherit; }

/* ── App Layout ── */
.app { display: flex; min-height: 100vh; }

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-w); flex-shrink: 0; background: var(--bg-deep);
  border-left: 1px solid var(--border); padding: 20px 16px;
  display: flex; flex-direction: column; gap: 20px;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}
.sb-logo { font-size: 16px; font-weight: 800; color: var(--accent); display: flex; align-items: center; gap: 6px; }
.sb-section-label { font-size: 9px; color: var(--faint); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
.sb-nav { display: flex; flex-direction: column; gap: 2px; }
.sb-nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-sm); color: var(--muted); font-size: 13px; font-weight: 500; border: none; background: none; text-align: right; width: 100%; transition: all 0.15s; }
.sb-nav-item:hover { color: var(--text); background: var(--surface); }
.sb-nav-item.active { color: var(--accent); background: var(--surface); font-weight: 600; }

/* Sidebar filters */
.sb-filters { display: flex; flex-direction: column; gap: 10px; }
.sb-input { width: 100%; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--surface); color: var(--text); border: 1px solid var(--border); font-size: 13px; }
.sb-input:focus { outline: none; border-color: var(--accent); }
.sb-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.sb-chip { padding: 4px 10px; border-radius: var(--radius-xs); font-size: 11px; font-weight: 600; border: 1px solid var(--border); background: transparent; color: var(--muted); transition: all 0.15s; }
.sb-chip.on { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.sb-chip[data-status="yes"].on { background: var(--good); border-color: var(--good); color: var(--bg); }
.sb-chip[data-status="maybe"].on { background: var(--warn); border-color: var(--warn); color: var(--bg); }
.sb-chip[data-status="no"].on { background: var(--bad); border-color: var(--bad); color: var(--bg); }

/* Sidebar zone list */
.sb-zone-list { display: flex; flex-direction: column; gap: 2px; }
.sb-zone-item { padding: 5px 10px; border-radius: var(--radius-xs); font-size: 11px; color: var(--muted); cursor: pointer; border: none; background: none; text-align: right; width: 100%; transition: all 0.15s; }
.sb-zone-item:hover { color: var(--text); background: var(--surface); }
.sb-zone-item.active { color: var(--accent); background: rgba(6,182,212,.1); font-weight: 600; }

/* Sidebar changelog */
.sb-changelog { font-size: 10px; }
.sb-change { padding: 3px 0; }
.sb-change-good { color: var(--good); }
.sb-change-bad { color: var(--bad); }

/* ── Main Content ── */
.main { flex: 1; padding: 24px 28px; min-width: 0; }

/* ── KPI Cards ── */
.kpi-row { display: flex; gap: 10px; margin-bottom: 16px; }
.kpi { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; }
.kpi-label { font-size: 9px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
.kpi-value { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1; }
.kpi-sub { font-size: 9px; color: var(--muted); margin-top: 4px; }
.kpi-value.accent { color: var(--accent); }
.kpi-value.good { color: var(--good); }

/* ── Data Table ── */
.data-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 14px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.panel-title { font-size: 12px; font-weight: 700; color: var(--text); }
.panel-subtitle { font-size: 10px; color: var(--faint); }

.zone-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.zone-table th { text-align: right; padding: 6px 8px; font-size: 9px; color: var(--faint); font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid var(--border); cursor: pointer; user-select: none; white-space: nowrap; }
.zone-table th:hover { color: var(--muted); }
.zone-table th .arrow { font-size: 8px; margin-right: 2px; opacity: 0.4; }
.zone-table th.sorted .arrow { opacity: 1; }
.zone-table td { padding: 7px 8px; border-bottom: 1px solid rgba(36,52,72,.5); }
.zone-table tr { transition: background 0.15s; cursor: pointer; }
.zone-table tr:hover td { background: var(--surface-hi); }
.zone-table .zone-name { font-weight: 700; color: var(--text); }
.zone-table .city-name { color: var(--muted); font-weight: 400; }
.zone-table .rank { color: var(--faint); font-weight: 600; width: 24px; }

/* ── Badges ── */
.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: var(--radius-xs); font-size: 10px; font-weight: 700; }
.badge-good { background: rgba(52,211,153,.15); color: var(--good); }
.badge-warn { background: rgba(251,191,36,.15); color: var(--warn); }
.badge-bad { background: rgba(251,113,133,.15); color: var(--bad); }
.badge-neutral { background: rgba(255,255,255,.06); color: var(--muted); }
.badge-accent { background: rgba(6,182,212,.15); color: var(--accent); }

.status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-left: 4px; }
.status-dot.yes { background: var(--good); box-shadow: 0 0 6px var(--good); }
.status-dot.maybe { background: var(--warn); box-shadow: 0 0 6px var(--warn); }
.status-dot.no { background: var(--bad); box-shadow: 0 0 6px var(--bad); }

/* ── Score Badge (larger) ── */
.score-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 800; }

/* ── Developer Badge ── */
.dev-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 3px 8px; border-radius: var(--radius-xs); background: rgba(167,139,250,.12); color: #c4b5fd; border: 1px solid rgba(167,139,250,.25); cursor: help; }

/* ── Listing Cards ── */
.listings-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 14px; }
.listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
.listing-card { display: block; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; text-decoration: none; color: var(--text); transition: all 0.15s; }
.listing-card:hover { border-color: var(--accent); transform: translateY(-2px); text-decoration: none; box-shadow: 0 4px 16px rgba(6,182,212,.08); }
.listing-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.listing-title { font-size: 11px; font-weight: 600; }
.listing-price { font-size: 13px; font-weight: 800; }
.listing-meta { font-size: 10px; color: var(--muted); margin-bottom: 4px; }
.listing-ppsqm { font-size: 10px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.listing-source { font-size: 9px; font-weight: 700; letter-spacing: 0.3px; }
.listing-note { font-size: 10px; color: var(--muted); margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border); font-style: italic; }

/* Deal badges */
.deal { font-size: 9px; padding: 1px 6px; border-radius: var(--radius-xs); font-weight: 600; }
.deal-good { background: rgba(52,211,153,.18); color: var(--good); }
.deal-market { background: rgba(255,255,255,.06); color: var(--muted); }
.deal-bad { background: rgba(251,113,133,.12); color: var(--bad); }

/* ── Search Buttons ── */
.search-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.search-btn { display: inline-flex; align-items: center; gap: 4px; background: var(--bg); border: 1px solid var(--b, var(--border)); color: var(--b, var(--muted)); font-weight: 600; font-size: 11px; padding: 6px 12px; border-radius: 8px; text-decoration: none; transition: all 0.15s; }
.search-btn:hover { background: var(--b, var(--accent)); color: var(--bg); text-decoration: none; transform: translateY(-1px); }

/* ── Bottom Grid (deals + timeline) ── */
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* ── Timeline Mini ── */
.timeline-bar-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.timeline-bar-label { font-size: 9px; width: 70px; color: var(--muted); text-align: left; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timeline-bar-track { flex: 1; height: 8px; background: var(--bg); border-radius: 4px; position: relative; }
.timeline-bar-fill { position: absolute; height: 100%; border-radius: 4px; }
.timeline-axis { display: flex; justify-content: space-between; font-size: 8px; color: var(--faint); margin-top: 2px; }

/* ── Zone Detail ── */
.zone-header { margin-bottom: 16px; }
.zone-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.zone-title { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
.zone-subtitle { font-size: 11px; color: var(--muted); }
.zone-back { font-size: 11px; color: var(--accent); cursor: pointer; margin-bottom: 10px; display: inline-block; border: none; background: none; }
.zone-back:hover { text-decoration: underline; }

.zone-kpis { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.zone-kpi { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; }
.zone-kpi-label { font-size: 9px; color: var(--muted); font-weight: 600; }
.zone-kpi-value { font-size: 16px; font-weight: 800; }

.zone-desc { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 14px; font-size: 12px; color: var(--muted); line-height: 1.7; }
.zone-action { background: var(--surface); border: 1px solid rgba(6,182,212,.3); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 14px; font-size: 12px; color: var(--muted); line-height: 1.7; }
.zone-action-label { font-size: 10px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }

/* ── Tools View ── */
.tools-section { margin-bottom: 8px; }
.tools-header { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; cursor: pointer; transition: all 0.15s; width: 100%; color: var(--text); font-size: 14px; font-weight: 700; text-align: right; }
.tools-header:hover { border-color: var(--border-hi); }
.tools-header .chevron { color: var(--muted); font-size: 12px; transition: transform 0.25s; }
.tools-section.open .tools-header { border-radius: var(--radius) var(--radius) 0 0; border-bottom-color: transparent; }
.tools-section.open .chevron { transform: rotate(180deg); }
.tools-body { background: var(--surface); border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--radius) var(--radius); padding: 18px; max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; }
.tools-section.open .tools-body { max-height: 2000px; padding: 18px; }

/* Calculator */
.calc-row { margin-bottom: 12px; }
.calc-row label { display: block; font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px; }
.calc-row input, .calc-row select { width: 100%; padding: 10px; border-radius: var(--radius-sm); background: var(--bg); color: var(--text); border: 1px solid var(--border); font-size: 14px; }
.calc-row input:focus, .calc-row select:focus { outline: none; border-color: var(--accent); }
.calc-result { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 8px; }
.calc-result-label { font-size: 10px; color: var(--muted); }
.calc-result-value { font-size: 18px; font-weight: 800; }
.calc-result-sub { font-size: 10px; color: var(--muted); }
.calc-warning { background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.2); border-radius: var(--radius-sm); padding: 12px; font-size: 11px; color: var(--warn); line-height: 1.6; margin-top: 12px; }

/* Score tool */
.score-factor { margin-bottom: 16px; }
.score-factor-title { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
.score-factor-help { font-size: 10px; color: var(--muted); margin-bottom: 8px; }
.score-options { display: flex; flex-direction: column; gap: 4px; }
.score-option { display: flex; align-items: center; gap: 8px; }
.score-option input[type="radio"] { accent-color: var(--accent); }
.score-option label { font-size: 11px; cursor: pointer; }
.score-gauge { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 20px auto; }
.score-gauge-inner { width: 90px; height: 90px; border-radius: 50%; background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; }
.score-verdict { text-align: center; margin-top: 12px; }
.score-verdict-label { font-size: 16px; font-weight: 800; }
.score-verdict-text { font-size: 11px; color: var(--muted); margin-top: 4px; }

/* Checklist */
.check-phase { margin-bottom: 16px; }
.check-phase-title { font-size: 12px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
.check-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(36,52,72,.4); font-size: 11px; }
.check-item input[type="checkbox"] { accent-color: var(--accent); margin-top: 3px; flex-shrink: 0; }
.check-item-title { font-weight: 600; }
.check-item-help { font-size: 10px; color: var(--muted); }
.check-progress { height: 6px; background: var(--bg); border-radius: 3px; margin-bottom: 12px; overflow: hidden; }
.check-progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }

/* Search builder */
.hood-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
.hood-chip { padding: 4px 10px; border-radius: var(--radius-xs); font-size: 11px; font-weight: 600; border: 1px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; transition: all 0.15s; }
.hood-chip.selected { background: var(--accent); color: var(--bg); border-color: var(--accent); }

/* Glossary */
.glossary-item { border-bottom: 1px solid var(--border); }
.glossary-term { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; cursor: pointer; font-size: 13px; font-weight: 700; }
.glossary-term .chevron { color: var(--muted); font-size: 10px; transition: transform 0.2s; }
.glossary-item.open .glossary-term .chevron { transform: rotate(180deg); }
.glossary-body { max-height: 0; overflow: hidden; transition: max-height 0.25s; font-size: 11px; color: var(--muted); line-height: 1.7; }
.glossary-item.open .glossary-body { max-height: 300px; padding-bottom: 10px; }
.glossary-example { background: var(--bg); border-radius: var(--radius-sm); padding: 8px; margin-top: 6px; font-size: 10px; }

/* Resources */
.resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.resource-card { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
.resource-card h4 { font-size: 12px; margin-bottom: 4px; }
.resource-card p { font-size: 10px; color: var(--muted); margin-bottom: 6px; }
.resource-card a { font-size: 11px; }
.resource-tag { font-size: 9px; padding: 1px 6px; border-radius: var(--radius-xs); background: rgba(6,182,212,.1); color: var(--accent); }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .sidebar { width: 60px; padding: 16px 8px; overflow: hidden; }
  .sidebar:hover { width: var(--sidebar-w); overflow-y: auto; }
  .sb-logo span:not(:first-child), .sb-section-label, .sb-filters, .sb-zone-list, .sb-changelog,
  .sb-nav-item span { display: none; }
  .sidebar:hover .sb-logo span:not(:first-child), .sidebar:hover .sb-section-label,
  .sidebar:hover .sb-filters, .sidebar:hover .sb-zone-list, .sidebar:hover .sb-changelog,
  .sidebar:hover .sb-nav-item span { display: initial; }
}

@media (max-width: 768px) {
  .app { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    flex-direction: row; padding: 8px 16px; gap: 0; justify-content: space-around;
    border-left: none; border-top: 1px solid var(--border); }
  .sb-nav { flex-direction: row; gap: 4px; }
  .sb-section-label, .sb-filters, .sb-zone-list, .sb-changelog, .sb-logo { display: none; }
  .main { padding: 16px 16px 80px; }
  .kpi-row { flex-wrap: wrap; }
  .kpi { min-width: calc(50% - 5px); }
  .bottom-grid { grid-template-columns: 1fr; }
  .zone-kpis { flex-direction: column; }
}
```

- [ ] **Step 2: Verify CSS loads**

Open `index.html` — page should show deep navy background with no errors.

---

### Task 3: App.js — Router & State Management

**Files:**
- Create: `givatayim-pinui-radar/app.js`

- [ ] **Step 1: Write the router and state core**

Create `app.js` with the App object, state management, router, and init logic. This task creates the skeleton — view renderers are added in subsequent tasks.

```javascript
// app.js — SPA router and view renderers
const App = {
  state: {
    view: 'dashboard',
    zoneId: null,
    budget: parseInt(localStorage.getItem('pinui_budget')) || 3000000,
    cities: JSON.parse(localStorage.getItem('pinui_cities') || '["givatayim","ramat-gan","tel-aviv"]'),
    statuses: JSON.parse(localStorage.getItem('pinui_statuses') || '["yes","maybe"]'),
    sortCol: 'score',
    sortAsc: false,
    toolsOpen: {}
  },

  // ── Routing ──
  parseHash() {
    const h = location.hash.slice(1) || 'dashboard';
    if (h.startsWith('zone/')) return { view: 'zone', zoneId: h.slice(5) };
    if (h.startsWith('tools/')) return { view: 'tools', section: h.slice(6) };
    if (h === 'tools') return { view: 'tools', section: null };
    return { view: 'dashboard' };
  },

  navigate(view, params) {
    if (view === 'zone') location.hash = '#zone/' + params;
    else if (view === 'tools' && params) location.hash = '#tools/' + params;
    else location.hash = '#' + view;
  },

  // ── Persistence ──
  saveBudget() { localStorage.setItem('pinui_budget', this.state.budget); },
  saveCities() { localStorage.setItem('pinui_cities', JSON.stringify(this.state.cities)); },
  saveStatuses() { localStorage.setItem('pinui_statuses', JSON.stringify(this.state.statuses)); },

  // ── Filtered Data ──
  getFilteredZones() {
    return getAllZonesFlat().filter(z =>
      this.state.cities.includes(z.citySlug) &&
      this.state.statuses.includes(z.status) &&
      z.entryPriceMin <= this.state.budget
    );
  },

  // ── Render Dispatch ──
  render() {
    const parsed = this.parseHash();
    this.state.view = parsed.view;
    if (parsed.view === 'zone') this.state.zoneId = parsed.zoneId;

    this.renderSidebar();
    const main = document.getElementById('main');
    main.style.opacity = '0';
    setTimeout(() => {
      if (parsed.view === 'zone') this.renderZoneDetail(parsed.zoneId);
      else if (parsed.view === 'tools') this.renderTools(parsed.section);
      else this.renderDashboard();
      main.style.opacity = '1';
    }, 50);
  },

  // Placeholder renderers — filled in Tasks 4-7
  renderSidebar() { document.getElementById('sidebar').innerHTML = '<div class="sb-logo">⬡ רדאר</div>'; },
  renderDashboard() { document.getElementById('main').innerHTML = '<p>Dashboard loading...</p>'; },
  renderZoneDetail(id) { document.getElementById('main').innerHTML = '<p>Zone ' + id + '</p>'; },
  renderTools(section) { document.getElementById('main').innerHTML = '<p>Tools loading...</p>'; },

  // ── Init ──
  init() {
    window.addEventListener('hashchange', () => this.render());
    loadListings().then(() => this.render());
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: Verify routing works**

Open `index.html` — should show "Dashboard loading...". Change URL hash to `#zone/air` — should show "Zone air". Change to `#tools` — should show "Tools loading...".

---

### Task 4: Sidebar Renderer

**Files:**
- Modify: `givatayim-pinui-radar/app.js` — replace `renderSidebar()`

- [ ] **Step 1: Implement renderSidebar()**

Replace the placeholder `renderSidebar` method with the full implementation:

```javascript
  renderSidebar() {
    const s = this.state;
    const navItems = [
      { id: 'dashboard', label: 'סקירה', icon: '◉' },
      { id: 'zones', label: 'מתחמים', icon: '▦' },
      { id: 'tools', label: 'כלים', icon: '⚙' }
    ];

    const cityLabels = { givatayim: 'גבעתיים', 'ramat-gan': 'רמת גן', 'tel-aviv': 'תל אביב' };
    const statusLabels = { yes: 'כן', maybe: 'אולי', no: 'לא' };

    // Changelog
    const changes = checkForStatusChanges();
    const changelogHTML = changes.length > 0
      ? `<div><div class="sb-section-label">שינויים</div><div class="sb-changelog">${
          changes.map(c => {
            const cls = c.to === 'yes' ? 'sb-change-good' : c.to === 'no' ? 'sb-change-bad' : '';
            const lbl = statusLabels[c.to] || c.to;
            return `<div class="sb-change ${cls}">${c.zoneName.split('·')[0].trim()} → ${lbl}</div>`;
          }).join('')
        }</div></div>`
      : '';

    // Zone list (for zone detail view)
    const zoneListHTML = s.view === 'zone'
      ? `<div><div class="sb-section-label">מתחמים</div><div class="sb-zone-list">${
          getAllZonesFlat().map(z =>
            `<button class="sb-zone-item${z.zoneId === s.zoneId ? ' active' : ''}" onclick="App.navigate('zone','${z.zoneId}')">${z.zone.split('·')[0].trim()}</button>`
          ).join('')
        }</div></div>`
      : '';

    // Filters (for dashboard view)
    const filtersHTML = s.view === 'dashboard'
      ? `<div class="sb-filters">
          <div class="sb-section-label">סינון</div>
          <div>
            <div class="sb-section-label" style="margin-top:0">תקציב</div>
            <input class="sb-input" type="number" id="sb-budget" value="${s.budget}" step="100000"
              oninput="App.state.budget=+this.value;App.saveBudget();App.renderDashboard()">
          </div>
          <div>
            <div class="sb-section-label">ערים</div>
            <div class="sb-chips" id="sb-cities">${
              Object.entries(cityLabels).map(([slug, name]) =>
                `<button class="sb-chip${s.cities.includes(slug) ? ' on' : ''}" data-city="${slug}" onclick="App.toggleCity('${slug}')">${name}</button>`
              ).join('')
            }</div>
          </div>
          <div>
            <div class="sb-section-label">סטטוס</div>
            <div class="sb-chips">${
              Object.entries(statusLabels).map(([key, label]) =>
                `<button class="sb-chip${s.statuses.includes(key) ? ' on' : ''}" data-status="${key}" onclick="App.toggleStatus('${key}')">${label}</button>`
              ).join('')
            }</div>
          </div>
        </div>`
      : '';

    document.getElementById('sidebar').innerHTML = `
      <div class="sb-logo"><span>⬡</span> <span>רדאר</span></div>
      <div>
        <div class="sb-section-label">ניווט</div>
        <div class="sb-nav">
          ${navItems.map(n => {
            const isActive = (n.id === 'zones' && s.view === 'zone') || (n.id !== 'zones' && s.view === n.id);
            const target = n.id === 'zones' ? "App.navigate('zone',getAllZonesFlat()[0].zoneId)" : `App.navigate('${n.id}')`;
            return `<button class="sb-nav-item${isActive ? ' active' : ''}" onclick="${target}"><span>${n.icon}</span> <span>${n.label}</span></button>`;
          }).join('')}
        </div>
      </div>
      ${filtersHTML}
      ${zoneListHTML}
      ${changelogHTML}
    `;
  },

  toggleCity(slug) {
    const idx = this.state.cities.indexOf(slug);
    if (idx >= 0) { if (this.state.cities.length > 1) this.state.cities.splice(idx, 1); }
    else this.state.cities.push(slug);
    this.saveCities();
    this.render();
  },

  toggleStatus(key) {
    const idx = this.state.statuses.indexOf(key);
    if (idx >= 0) { if (this.state.statuses.length > 1) this.state.statuses.splice(idx, 1); }
    else this.state.statuses.push(key);
    this.saveStatuses();
    this.render();
  },
```

Note: `toggleCity` and `toggleStatus` are new methods on the App object, add them right after `renderSidebar`.

- [ ] **Step 2: Verify sidebar renders**

Open `index.html` — sidebar should show logo, nav, filters. Click city/status chips and verify they toggle. Change hash to `#zone/air` and verify zone list appears.

---

### Task 5: Dashboard View Renderer

**Files:**
- Modify: `givatayim-pinui-radar/app.js` — replace `renderDashboard()`

- [ ] **Step 1: Implement renderDashboard()**

Replace the placeholder. This renders KPIs, ranked zone table, deals feed, and timeline mini.

```javascript
  renderDashboard() {
    const zones = this.getFilteredZones();
    const s = this.state;

    // Sort
    const sortFns = {
      rank: (a,b) => (b.valueScore||0) - (a.valueScore||0),
      zone: (a,b) => a.zone.localeCompare(b.zone,'he'),
      city: (a,b) => a.city.localeCompare(b.city,'he'),
      price: (a,b) => a.entryPriceMin - b.entryPriceMin,
      premium: (a,b) => a.premiumMid - b.premiumMid,
      timeline: (a,b) => a.timelineMidYears - b.timelineMidYears,
      status: (a,b) => {const o={yes:0,maybe:1,no:2}; return (o[a.status]||9)-(o[b.status]||9);},
      score: (a,b) => (b.valueScore||0) - (a.valueScore||0)
    };
    const sorted = [...zones].sort((a,b) => {
      const v = (sortFns[s.sortCol] || sortFns.score)(a,b);
      return s.sortAsc ? -v : v;
    });

    // KPIs
    const topScore = zones.reduce((max, z) => Math.max(max, z.valueScore || 0), 0);
    const topZone = zones.find(z => z.valueScore === topScore);
    const avgPpsqm = Math.round(zones.reduce((sum, z) => {
      const city = CITIES[z.citySlug];
      const zObj = city.zones.find(zn => zn.id === z.zoneId);
      return sum + (zObj ? (parsePpsqmRange(zObj.prices.rows) || 0) : 0);
    }, 0) / (zones.length || 1) / 1000);

    // Deals: listings below zone average
    const deals = [];
    if (_listingsCache && _listingsCache.byZone) {
      for (const z of zones) {
        const city = CITIES[z.citySlug];
        const zObj = city ? city.zones.find(zn => zn.id === z.zoneId) : null;
        if (!zObj) continue;
        const avg = parsePpsqmRange(zObj.prices.rows);
        const listings = _listingsCache.byZone[z.zoneId] || [];
        for (const l of listings) {
          const p = parseInt((l.price||'').replace(/[^\d]/g,'')) || 0;
          const sq = parseInt(l.sqm) || 0;
          if (p && sq) {
            const ppsqm = Math.round(p / sq);
            if (avg && ppsqm < avg * 0.92) {
              deals.push({ ...l, ppsqm, zoneName: z.zone.split('·')[0].trim(), zoneId: z.zoneId });
            }
          }
        }
      }
      deals.sort((a,b) => a.ppsqm - b.ppsqm);
    }

    // Timeline data
    const timelineZones = sorted.filter(z => z.timelineMidYears > 0).slice(0, 8);

    const scoreBadge = v => {
      if (v === null || v === undefined) return '<span class="badge badge-neutral">—</span>';
      const cls = v >= 3.5 ? 'badge-good' : v >= 1.5 ? 'badge-warn' : 'badge-bad';
      return `<span class="badge ${cls}">${v}</span>`;
    };
    const statusBadge = st => {
      const cls = st === 'yes' ? 'badge-good' : st === 'maybe' ? 'badge-warn' : 'badge-bad';
      const lbl = st === 'yes' ? 'כן' : st === 'maybe' ? 'אולי' : 'לא';
      return `<span class="badge ${cls}">${lbl}</span>`;
    };
    const thArrow = col => {
      const sorted = s.sortCol === col;
      const arrow = sorted ? (s.sortAsc ? '▲' : '▼') : '⇅';
      return `<span class="arrow">${arrow}</span>`;
    };

    document.getElementById('main').innerHTML = `
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-label">מתחמים בתקציב</div><div class="kpi-value accent">${zones.length}</div></div>
        <div class="kpi"><div class="kpi-label">ציון מוביל</div><div class="kpi-value good">${topScore || '—'}</div>${topZone ? `<div class="kpi-sub">${topZone.zone.split('·')[0].trim()} · ${topZone.city}</div>` : ''}</div>
        <div class="kpi"><div class="kpi-label">ממוצע למ"ר</div><div class="kpi-value">${avgPpsqm}K</div></div>
        <div class="kpi"><div class="kpi-label">מציאות טריות</div><div class="kpi-value good">${deals.length}</div><div class="kpi-sub">מתחת לממוצע</div></div>
      </div>

      <div class="data-panel">
        <div class="panel-header">
          <div class="panel-title">כל המתחמים — ממוינים לפי ${s.sortCol === 'score' ? 'כדאיות' : s.sortCol}</div>
        </div>
        <table class="zone-table">
          <thead><tr>
            <th class="${s.sortCol==='rank'?'sorted':''}" onclick="App.sortBy('rank')">${thArrow('rank')} #</th>
            <th class="${s.sortCol==='zone'?'sorted':''}" onclick="App.sortBy('zone')">${thArrow('zone')} מתחם</th>
            <th class="${s.sortCol==='city'?'sorted':''}" onclick="App.sortBy('city')">${thArrow('city')} עיר</th>
            <th class="${s.sortCol==='price'?'sorted':''}" onclick="App.sortBy('price')">${thArrow('price')} כניסה</th>
            <th class="${s.sortCol==='premium'?'sorted':''}" onclick="App.sortBy('premium')">${thArrow('premium')} פרמיה</th>
            <th class="${s.sortCol==='timeline'?'sorted':''}" onclick="App.sortBy('timeline')">${thArrow('timeline')} אופק</th>
            <th class="${s.sortCol==='status'?'sorted':''}" onclick="App.sortBy('status')">${thArrow('status')} סטטוס</th>
            <th class="${s.sortCol==='score'?'sorted':''}" onclick="App.sortBy('score')">${thArrow('score')} ציון</th>
          </tr></thead>
          <tbody>${sorted.map((z, i) => `
            <tr onclick="App.navigate('zone','${z.zoneId}')">
              <td class="rank">${i + 1}</td>
              <td class="zone-name">${z.zone.split('·')[0].trim()}</td>
              <td class="city-name">${z.city}</td>
              <td>${z.priceLabel}</td>
              <td style="color:var(--good)">${z.premiumLabel}</td>
              <td>${z.timelineLabel}</td>
              <td>${statusBadge(z.status)}</td>
              <td>${scoreBadge(z.valueScore)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="bottom-grid">
        <div class="data-panel">
          <div class="panel-header"><div class="panel-title">מציאות טריות</div></div>
          <div class="listings-grid">${deals.slice(0, 4).map(d => `
            <a href="${d.url}" target="_blank" rel="noopener" class="listing-card">
              <div class="listing-top">
                <span class="listing-title">${d.title}</span>
                <span class="listing-price">${d.price}</span>
              </div>
              <div class="listing-meta">${d.rooms ? d.rooms + " חד'" : ''} · ${d.sqm || '?'} מ"ר · ${d.zoneName}</div>
              <div class="listing-ppsqm">₪${(d.ppsqm/1000).toFixed(1)}K/מ"ר <span class="deal deal-good">מציאה</span></div>
            </a>`).join('') || '<div class="panel-subtitle">אין מציאות כרגע בתקציב</div>'}
          </div>
        </div>
        <div class="data-panel">
          <div class="panel-header"><div class="panel-title">ציר זמן</div></div>
          ${timelineZones.map(z => {
            const m = z.timelineLabel.match(/(\d+)[–\-](\d+)/);
            const min = m ? parseInt(m[1]) : 0, max = m ? parseInt(m[2]) : 0;
            const color = z.status === 'yes' ? 'var(--good)' : z.status === 'maybe' ? 'var(--warn)' : 'var(--bad)';
            return `<div class="timeline-bar-row">
              <span class="timeline-bar-label">${z.zone.split('·')[0].trim()}</span>
              <div class="timeline-bar-track">
                <div class="timeline-bar-fill" style="right:${min/15*100}%;width:${(max-min)/15*100}%;background:${color}"></div>
              </div>
            </div>`;
          }).join('')}
          <div class="timeline-axis"><span>0y</span><span>5y</span><span>10y</span><span>15y</span></div>
        </div>
      </div>
    `;
  },

  sortBy(col) {
    if (this.state.sortCol === col) this.state.sortAsc = !this.state.sortAsc;
    else { this.state.sortCol = col; this.state.sortAsc = false; }
    this.renderDashboard();
  },
```

Note: `sortBy` is a new method on the App object.

- [ ] **Step 2: Verify dashboard renders**

Open `index.html` — should show KPIs, ranked table, deals, timeline. Click column headers to sort. Click a zone row — should navigate to `#zone/{id}`.

---

### Task 6: Zone Detail View Renderer

**Files:**
- Modify: `givatayim-pinui-radar/app.js` — replace `renderZoneDetail()`

- [ ] **Step 1: Implement renderZoneDetail()**

```javascript
  renderZoneDetail(zoneId) {
    // Find zone across all cities
    let zone = null, city = null, citySlug = null;
    for (const [slug, c] of Object.entries(CITIES)) {
      const z = c.zones.find(zn => zn.id === zoneId);
      if (z) { zone = z; city = c; citySlug = slug; break; }
    }
    if (!zone) { this.renderDashboard(); return; }

    const vs = computeValueScore(zone);
    const dev = findDeveloper(zone);
    const avgPpsqm = parsePpsqmRange(zone.prices.rows);
    const listings = (_listingsCache && _listingsCache.byZone && _listingsCache.byZone[zoneId]) || [];
    const links = buildSearchLinks(city, { hood: zone.hood });

    const scoreCls = vs >= 3.5 ? 'badge-good' : vs >= 1.5 ? 'badge-warn' : 'badge-bad';
    const statusCls = zone.status === 'yes' ? 'badge-good' : zone.status === 'maybe' ? 'badge-warn' : 'badge-bad';
    const statusLbl = zone.status === 'yes' ? 'כן' : zone.status === 'maybe' ? 'אולי' : 'לא';

    const timelineRow = zone.facts.find(f => f[0].includes('אופק') || f[0].includes('אכלוס'));

    document.getElementById('main').innerHTML = `
      <button class="zone-back" onclick="App.navigate('dashboard')">← חזרה לסקירה</button>

      <div class="zone-header">
        <div class="zone-title-row">
          <span class="zone-title">${zone.name}</span>
          <span class="badge ${statusCls}">${statusLbl}</span>
          ${vs !== null ? `<span class="badge ${scoreCls}">${vs}</span>` : ''}
          ${dev ? `<span class="dev-badge" title="${dev.note}"><strong>${dev.tier}</strong> ${dev.short} · ${dev.completed} פרויקטים</span>` : ''}
        </div>
        <div class="zone-subtitle">${city.name} · ${zone.facts.map(f => f[1]).join(' · ')}</div>
      </div>

      <div class="zone-kpis">
        ${zone.prices.rows.map(([label, val]) => `
          <div class="zone-kpi">
            <div class="zone-kpi-label">${label}</div>
            <div class="zone-kpi-value" ${val.includes('+') ? 'style="color:var(--good)"' : ''}>${val}</div>
          </div>
        `).join('')}
      </div>

      <div class="zone-desc">${zone.desc}</div>

      ${zone.action ? `<div class="zone-action"><div class="zone-action-label">מה לעשות</div>${zone.action}</div>` : ''}

      ${listings.length ? `
        <div class="listings-panel">
          <div class="panel-header">
            <div class="panel-title">דירות לדוגמה</div>
            <div class="panel-subtitle">עודכן ${_listingsCache._meta?.updated || ''}</div>
          </div>
          <div class="listings-grid">${listings.map(l => {
            const p = parseInt((l.price||'').replace(/[^\d]/g,'')) || 0;
            const sq = parseInt(l.sqm) || 0;
            const ppsqm = (p && sq) ? Math.round(p / sq) : null;
            let dealHTML = '';
            if (ppsqm && avgPpsqm) {
              const ratio = ppsqm / avgPpsqm;
              if (ratio < 0.92) dealHTML = '<span class="deal deal-good">מציאה</span>';
              else if (ratio <= 1.05) dealHTML = '<span class="deal deal-market">שוק</span>';
              else dealHTML = '<span class="deal deal-bad">יקר</span>';
            }
            return `<a href="${l.url}" target="_blank" rel="noopener" class="listing-card">
              <div class="listing-top">
                <span class="listing-title">${l.title}</span>
                <span class="listing-price">${l.price}</span>
              </div>
              <div class="listing-meta">${l.rooms ? l.rooms + " חד'" : ''} · ${l.sqm || '?'} מ"ר</div>
              ${ppsqm ? `<div class="listing-ppsqm">₪${(ppsqm/1000).toFixed(1)}K/מ"ר ${dealHTML}</div>` : ''}
              ${l.note ? `<div class="listing-note">${l.note}</div>` : ''}
              <div class="listing-source" style="color:var(--${l.source === 'Yad2' ? 'yad2' : l.source === 'Madlan' ? 'madlan' : 'accent'})">${l.source}</div>
            </a>`;
          }).join('')}</div>
        </div>
      ` : ''}

      <div class="search-row">
        <a href="${links.yad2}" target="_blank" rel="noopener" class="search-btn" style="--b:var(--yad2)">Yad2 ↗</a>
        <a href="${links.madlan}" target="_blank" rel="noopener" class="search-btn" style="--b:var(--madlan)">Madlan ↗</a>
        <a href="${links.nadlan}" target="_blank" rel="noopener" class="search-btn" style="--b:var(--nadlan)">nadlan.gov ↗</a>
        <a href="${links.facebook}" target="_blank" rel="noopener" class="search-btn" style="--b:var(--facebook)">Facebook ↗</a>
        <a href="${links.homeless}" target="_blank" rel="noopener" class="search-btn" style="--b:var(--homeless)">Homeless ↗</a>
        <a href="${links.komo}" target="_blank" rel="noopener" class="search-btn" style="--b:var(--komo)">Komo ↗</a>
      </div>
    `;
  },
```

- [ ] **Step 2: Verify zone detail renders**

Navigate to `#zone/air` — should show full zone detail with header, KPIs, description, listings, search buttons. Click sidebar zone list to switch between zones.

---

### Task 7: Tools View Renderer

**Files:**
- Modify: `givatayim-pinui-radar/app.js` — replace `renderTools()`

- [ ] **Step 1: Implement renderTools()**

This is the largest renderer. It contains 6 collapsible accordion sections porting content from the old pages: calculator, scorer, checklist, search builder, glossary, resources.

The full implementation is long. Write it as a method that generates all 6 sections. Each section uses the `tools-section` / `tools-header` / `tools-body` classes with a toggle function.

Key implementation details:
- **Calculator:** Port the exact bracket logic from old `prices.html` (corrected brackets: first-apartment [[2100000,0],[2500000,.035],[6055000,.05],[20185000,.08],[Infinity,.1]], investor [[6055000,.08],[20185000,.1],[Infinity,.12]]).
- **Scorer:** Port the 7 factors with weights {stage:25, consent:20, developer:15, price:15, location:10, horizon:10, objections:5} and verdict thresholds [{min:85,label:'הזדמנות מצוינת'}, {min:70,...}, {min:50,...}, {min:30,...}, {min:0,...}].
- **Checklist:** All 26 items in 4 phases. Use sessionStorage key `pinui_checklist` for persistence.
- **Search builder:** Neighborhood chips from zone hoods, room/price filters, calls `buildSearchLinks()`.
- **Glossary:** 18 terms as accordion items.
- **Resources:** 6 categories of curated links.

Add a `toggleTool(id)` method:
```javascript
  toggleTool(id) {
    const el = document.getElementById('tool-' + id);
    if (el) el.classList.toggle('open');
  },
```

And add event delegation for checklist checkboxes and score radio buttons (use `onclick` attributes on the generated HTML that call App methods).

- [ ] **Step 2: Port calculator section**

Write the calculator HTML generation including zone selector dropdown, all inputs, bracket calculation function, and result display. The calc function should be called via `oninput` on each field.

- [ ] **Step 3: Port scorer section**

Write all 7 factors as radio button groups, the gauge (conic-gradient), and the verdict display. Score recalculates on any radio change.

- [ ] **Step 4: Port checklist section**

Write all 26 items grouped by 4 phases. Checkbox state persists to sessionStorage. Progress bar updates on each click.

- [ ] **Step 5: Port search builder section**

Write neighborhood chips, room/price dropdowns, and the result area that calls `buildSearchLinks()` and renders platform buttons.

- [ ] **Step 6: Port glossary section**

Write all 18 terms as clickable accordion items with explanation and example.

- [ ] **Step 7: Port resources section**

Write all 6 categories with their links, descriptions, and tags.

- [ ] **Step 8: Verify all tools work**

Navigate to `#tools` — all 6 sections should be visible as collapsed headers. Open each one and verify:
- Calculator: change price, see tax/mortgage update
- Scorer: select options, see gauge change
- Checklist: check items, refresh page, verify persistence
- Search: select hood, click generate, verify links open
- Glossary: click terms, verify accordion
- Resources: verify all links are clickable

---

### Task 8: Final Polish & Smoke Test

**Files:**
- Modify: `givatayim-pinui-radar/app.js` (minor tweaks)
- Modify: `givatayim-pinui-radar/styles.css` (minor tweaks)

- [ ] **Step 1: Add main transition CSS**

Verify that `#main` has the opacity transition for view switches:
```css
.main { transition: opacity 0.2s ease; }
```

- [ ] **Step 2: Smoke test all flows**

1. Open `index.html` → Dashboard loads with KPIs, table, deals, timeline
2. Click column headers → table re-sorts
3. Change budget in sidebar → table filters
4. Toggle city chips → zones filter
5. Click zone row → Zone Detail loads
6. Click different zones in sidebar → view updates
7. Click "← חזרה" → back to Dashboard
8. Click "כלים" in sidebar → Tools view loads
9. Open each accordion section → content renders
10. Calculator: change values → results update
11. Checklist: check items → progress bar updates, survives refresh
12. Search: select hood → links generate
13. Direct URL: type `#zone/shapira` → correct zone loads
14. Mobile: resize to 768px → sidebar becomes bottom bar

- [ ] **Step 3: Update page title dynamically**

Add to each renderer:
```javascript
// In renderDashboard:
document.title = 'סקירה · רדאר פינוי-בינוי';

// In renderZoneDetail:
document.title = zone.name + ' · רדאר פינוי-בינוי';

// In renderTools:
document.title = 'כלים · רדאר פינוי-בינוי';
```

---

## Task Dependency Graph

```
Task 1 (archive + shell)
  ↓
Task 2 (CSS) ──────────┐
  ↓                     │
Task 3 (router core) ──┤
  ↓                     │
Task 4 (sidebar) ───────┤  (all need CSS + router)
  ↓                     │
Task 5 (dashboard) ─────┤
  ↓                     │
Task 6 (zone detail) ───┤
  ↓                     │
Task 7 (tools) ─────────┘
  ↓
Task 8 (polish + smoke test)
```

Tasks 1-3 are sequential (each depends on previous). Tasks 4-7 are sequential (each builds on the app.js from the previous task). Task 8 is last.
