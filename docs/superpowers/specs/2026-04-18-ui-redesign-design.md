# Pinui-Binui Radar — UI/UX Redesign Spec

**Date:** 2026-04-18
**User:** Power-user personal investment dashboard
**Scope:** Full visual + structural redesign. 10 pages → 3 views.

---

## 1. Information Architecture

### 3 Views (Single-Page App Feel)

Views swap via JS — sidebar persists, no full page reloads. URL hash tracks state (`#dashboard`, `#zone/neve-eliezer`, `#tools`).

**View 1 — Dashboard** (landing page, replaces index.html + compare.html)
- Persistent sidebar (left in LTR, right in RTL)
- Main area, top to bottom:
  1. KPI row: zones in budget, top score, avg price/sqm, YoY change
  2. Ranked zone table: all zones across 3 cities, sorted by value score, columns: #, zone, city, entry price, premium, timeline, status badge, score badge. Clickable rows → Zone Detail.
  3. Bottom grid (2 columns): fresh deals (listings below zone avg) | timeline mini-gantt

**View 2 — Zone Detail** (replaces zones.html, per-zone prices)
- Same sidebar + zone quick-nav list in sidebar (all zones, current highlighted)
- Back link → Dashboard
- Stacked sections:
  1. Header: zone name + status badge + value score + subtitle (city, units, status, timeline)
  2. KPI chips: entry price, price/sqm, premium %, developer badge
  3. Description block
  4. Action/recommendation block (cyan accent)
  5. Listings grid: each card shows title, price, rooms, sqm, price/sqm, deal badge (מציאה/שוק/יקר), source
  6. Search platform buttons (Yad2, Madlan, nadlan.gov, Facebook, Homeless, Komo)

**View 3 — Tools** (replaces search, score, checklist, workflow, glossary, resources, calculator)
- Same sidebar
- Single scrollable page, collapsible sections (accordion):
  1. **Mortgage calculator** — zone selector dropdown auto-fills price, purchase tax brackets (corrected), monthly payment, total cost
  2. **Opportunity scorer** — 7-factor tool, zone auto-fill from data
  3. **Checklist** — 26 items in 4 phases, sessionStorage persistence, progress bar
  4. **Search builder** — neighborhood chips, room/price filters, generates 6 platform links
  5. **Glossary** — 18 terms as accordion items
  6. **Resources** — curated links by category

### Pages Eliminated
| Old Page | Destination |
|----------|------------|
| index.html | Dashboard |
| compare.html | Dashboard |
| zones.html | Zone Detail |
| prices.html | Calculator → Tools; per-zone prices → Zone Detail |
| search.html | Tools |
| score.html | Tools |
| checklist.html | Tools |
| workflow.html | Eliminated (content absorbed into zone actions) |
| glossary.html | Tools |
| resources.html | Tools |

---

## 2. Color System

Cyan accent, evolved from current identity. Proper semantic separation.

```css
:root {
  --bg:       #0c1222;    /* deep navy — page background */
  --bg-deep:  #0a0f1a;    /* sidebar background */
  --surface:  #162032;    /* cards, panels, table rows */
  --surface-hi: #1a2a40;  /* hover state for surfaces */
  --border:   #243448;    /* borders, dividers */
  --border-hi: #2d4a64;   /* hover/focus borders */

  --text:     #e2e8f0;    /* primary text */
  --muted:    #7c9ab8;    /* secondary text, labels */
  --faint:    #4a6a82;    /* tertiary — column headers, timestamps */

  --accent:   #06b6d4;    /* cyan — primary action, links, nav active */
  --accent-light: #22d3ee; /* cyan light — hover states */

  --good:     #34d399;    /* emerald — deals, high scores, "yes" status */
  --warn:     #fbbf24;    /* amber — "maybe" status, medium scores */
  --bad:      #fb7185;    /* rose — "no" status, expensive, risk */

  /* Platform colors (for search buttons) */
  --yad2:     #ff9800;
  --madlan:   #06b6d4;
  --facebook: #1877f2;
  --nadlan:   #34d399;
  --homeless: #a78bfa;
  --komo:     #fbbf24;
}
```

Background: flat `--bg`, no radial gradients (cleaner). Sidebar uses `--bg-deep`.

---

## 3. Typography

- **Font:** Heebo (unchanged — good Hebrew support, wide weight range)
- **Scale:**
  - 9px: labels, timestamps, column headers (weight 600-700, uppercase, letter-spacing 0.5px)
  - 11px: body text, table cells, descriptions (weight 400)
  - 13px: secondary headings, sidebar items (weight 500-600)
  - 16-18px: zone name, section titles (weight 800)
  - 20-24px: KPI values (weight 800, tight letter-spacing -0.5px)
- **No gradients on text.** Accent color or white for emphasis, not gradient clipping.

---

## 4. Layout & Components

### 4.1 Sidebar (persistent, all views)
- Width: 220px (collapsible to 60px icon-only on mobile)
- Background: `--bg-deep`
- Border: 1px solid `--border` on the content side
- Sections (top to bottom):
  1. Logo: "⬡ רדאר" in `--accent`, weight 800
  2. Nav: 3 items (סקירה, מתחמים, כלים), active state = `--surface` bg + `--accent` text
  3. Filters (Dashboard only):
     - Budget: number input, styled
     - Cities: 3 toggle chips (Givatayim, Ramat Gan, Tel Aviv)
     - Status: 3 toggle chips (כן, אולי, לא)
  4. Zone list (Zone Detail view): all zones, current = highlighted
  5. Changelog: compact list of status changes since last visit

### 4.2 KPI Card
- Background: `--surface`, border: 1px `--border`, radius: 10px
- Label: 9px `--muted` uppercase
- Value: 20-24px weight 800
- Optional sub-label: 9px `--muted`

### 4.3 Zone Table Row
- Grid columns: `20px 2.5fr 0.8fr 0.8fr 0.8fr 0.8fr 50px`
- Headers: 9px `--faint` weight 700
- Cells: 11px `--text`
- Hover: `--surface-hi` background
- Click: navigates to Zone Detail
- Score badge: pill with semantic color background (good/warn/bad at 15% opacity)
- Status badge: same style as score

### 4.4 Listing Card
- Background: `--bg` (darker than panel for contrast)
- Border: 1px `--border`, radius: 8px
- Top row: title (left) + price (right, weight 800)
- Meta: rooms, sqm in `--muted`
- Price/sqm line: computed value + deal badge (מציאה = green, שוק = neutral, יקר = red)
- Source: platform name in platform color, 9px
- Hover: border → `--accent`, subtle translateY(-2px)

### 4.5 Search Platform Button
- Background: `--bg` or `--surface`
- Border: 1px solid platform color
- Text: platform color
- Hover: background fills with platform color, text → `--bg`
- Radius: 8px

### 4.6 Collapsible Section (Tools view)
- Header: clickable, `--surface` bg, radius 10px, padding 14px
- Chevron: rotates on open
- Content: slides open with max-height transition
- Each section independent — multiple can be open simultaneously

---

## 5. Navigation & Routing

### Hash-Based Routing
```
#dashboard              → View 1
#zone/{zoneId}          → View 2 for specific zone
#tools                  → View 3
#tools/{section}        → View 3 with section auto-opened
```

### City Selection
- City is a global filter (stored in localStorage), not a URL param
- Sidebar city chips toggle on/off (multi-select)
- Dashboard table shows zones from selected cities
- Zone Detail shows all zones in sidebar regardless of city filter

### State Persistence
- Budget: localStorage
- City selection: localStorage
- Checklist progress: sessionStorage (per city, as before)
- Last visit zone statuses: localStorage (for changelog)

---

## 6. Data Architecture

### No Changes to cities.js Data Structure
The existing `CITIES`, `YAD2_HOOD_IDS`, and `listings.json` remain unchanged. All new functions added in the previous session (`computeValueScore`, `getAllZonesFlat`, `whatBudgetBuys`, `parsePriceMin`, `parsePremiumMid`, `parseTimelineMid`, `parsePpsqmRange`, `checkForStatusChanges`, `DEVELOPERS`, `findDeveloper`, `buildSearchLinks`, `buildFacebookLinks`) are reused as-is.

### New: Router + View Renderer
```javascript
// app.js — new file, replaces per-page <script> blocks
const App = {
  state: {
    view: 'dashboard',        // 'dashboard' | 'zone' | 'tools'
    zoneId: null,              // active zone for detail view
    budget: 3000000,           // from localStorage
    cities: ['givatayim','ramat-gan','tel-aviv'],  // active city filters
    statuses: ['yes','maybe'], // active status filters
    sortCol: 'score',
    sortAsc: false
  },

  init() { /* read hash, localStorage, render */ },
  navigate(view, params) { /* update hash, re-render */ },
  renderSidebar() { /* persistent */ },
  renderDashboard() { /* KPIs + table + deals + timeline */ },
  renderZoneDetail(zoneId) { /* stacked sections */ },
  renderTools() { /* collapsible sections */ }
};
```

---

## 7. File Structure (After Redesign)

```
givatayim-pinui-radar/
├── index.html          ← single HTML shell (nav, sidebar, main container)
├── app.js              ← router, view renderers, UI logic
├── cities.js           ← unchanged data + utility functions
├── listings.json       ← unchanged
├── styles.css          ← rewritten with new design system
└── old/                ← archived old pages (not deleted, just moved)
    ├── zones.html
    ├── prices.html
    ├── search.html
    ├── score.html
    ├── checklist.html
    ├── workflow.html
    ├── glossary.html
    ├── resources.html
    └── compare.html
```

---

## 8. Responsive Behavior

- **Desktop (>1024px):** Full sidebar (220px) + main content
- **Tablet (768-1024px):** Sidebar collapsed to icons (60px), expands on hover
- **Mobile (<768px):** Sidebar becomes bottom tab bar (3 icons: סקירה, מתחמים, כלים). Zone table becomes card list. KPIs stack 2×2.

---

## 9. Interactions & Transitions

- View transitions: 200ms opacity fade
- Sidebar nav: instant highlight, no transition
- Table row hover: 150ms background color
- Listing card hover: 150ms border-color + translateY(-2px)
- Collapsible sections: 250ms max-height + opacity
- Budget input: debounced 300ms — re-filters table on type
- No loading spinners (all data is local)

---

## 10. What's NOT in Scope

- Server-side anything — remains static HTML/JS/JSON
- Build step — no bundler, no framework
- External API calls — no live nadlan.gov or Yad2 data fetching
- Authentication or user accounts
- Push notifications
- Map visualization (future enhancement)
