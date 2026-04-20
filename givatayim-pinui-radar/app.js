/* ═══════════════════════════════════════════════════════════════════
   Pinui-Binui Radar — App Controller (SPA Router + Views)
   ═══════════════════════════════════════════════════════════════════ */

const App = {

  // ── State ──────────────────────────────────────────────────────
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

  // ── Routing ────────────────────────────────────────────────────
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

  // ── Persistence ────────────────────────────────────────────────
  saveBudget() { localStorage.setItem('pinui_budget', this.state.budget); },
  saveCities() { localStorage.setItem('pinui_cities', JSON.stringify(this.state.cities)); },
  saveStatuses() { localStorage.setItem('pinui_statuses', JSON.stringify(this.state.statuses)); },

  // ── Filters ────────────────────────────────────────────────────
  getFilteredZones() {
    const s = this.state;
    return getAllZonesFlat().filter(z =>
      (s.cities.length === 0 || s.cities.includes(z.citySlug)) &&
      (s.statuses.length === 0 || s.statuses.includes(z.status)) &&
      (z.status === 'yes' || !s.budget || z.entryPriceMin <= s.budget)
    );
  },

  toggleCity(slug) {
    const i = this.state.cities.indexOf(slug);
    if (i >= 0) this.state.cities.splice(i, 1);
    else this.state.cities.push(slug);
    this.saveCities();
    this.render();
  },

  toggleStatus(key) {
    const i = this.state.statuses.indexOf(key);
    if (i >= 0) this.state.statuses.splice(i, 1);
    else this.state.statuses.push(key);
    this.saveStatuses();
    this.render();
  },

  _filterZoneList(query) {
    const q = query.trim().toLowerCase();
    const items = document.querySelectorAll('.sb-zone-item');
    const groups = document.querySelectorAll('.sb-city-group');
    for (const item of items) {
      const name = (item.getAttribute('data-zone-name') || '').toLowerCase();
      item.style.display = (!q || name.includes(q)) ? '' : 'none';
    }
    // Hide empty city groups
    for (const g of groups) {
      const visible = g.querySelectorAll('.sb-zone-item:not([style*="display: none"])');
      g.style.display = visible.length ? '' : 'none';
    }
  },

  sortBy(col) {
    if (this.state.sortCol === col) this.state.sortAsc = !this.state.sortAsc;
    else { this.state.sortCol = col; this.state.sortAsc = false; }
    this.renderDashboard();
  },

  // ── Master Render ──────────────────────────────────────────────
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

  // ── Init ───────────────────────────────────────────────────────
  init() {
    window.addEventListener('hashchange', () => this.render());
    loadListings().then(() => this.render());
  },

  // ═══════════════════════════════════════════════════════════════
  //  SIDEBAR
  // ═══════════════════════════════════════════════════════════════
  renderSidebar() {
    const sb = document.getElementById('sidebar');
    const v = this.state.view;

    // Logo
    let html = '<div class="sb-logo"><span>⬡</span><span>רדאר</span></div>';

    // Nav
    const navItems = [
      { view: 'dashboard', icon: '⊞', label: 'סקירה' },
      { view: 'zone',      icon: '◎', label: 'מתחמים' },
      { view: 'tools',     icon: '⚙', label: 'כלים' }
    ];
    html += '<nav class="sb-nav">';
    for (const n of navItems) {
      const active = (v === n.view || (n.view === 'zone' && v === 'zone')) ? ' active' : '';
      const href = n.view === 'zone' ? '#zone/' + (this.state.zoneId || getAllZonesFlat()[0].zoneId) : '#' + n.view;
      html += `<a href="${href}" class="sb-nav-item${active}"><span>${n.icon}</span><span>${n.label}</span></a>`;
    }
    html += '</nav>';

    // Filters — dashboard only
    if (v === 'dashboard') {
      html += '<div class="sb-filters">';
      html += '<div class="sb-section-label">תקציב</div>';
      html += `<input type="text" class="sb-input" id="sb-budget" value="${this.state.budget.toLocaleString('he-IL')}"
        oninput="App._onBudgetInput(this.value)" inputmode="numeric">`;

      // City chips
      html += '<div class="sb-section-label">ערים</div><div class="sb-chips">';
      const cityList = [['givatayim','גבעתיים'],['ramat-gan','רמת גן'],['tel-aviv','תל אביב']];
      for (const [slug, name] of cityList) {
        const on = this.state.cities.includes(slug) ? ' on' : '';
        html += `<button class="sb-chip${on}" onclick="App.toggleCity('${slug}')">${name}</button>`;
      }
      html += '</div>';

      // Status chips
      html += '<div class="sb-section-label">סטטוס</div><div class="sb-chips">';
      const statusList = [['yes','לקנות'],['maybe','לעקוב'],['no','לחכות']];
      for (const [key, label] of statusList) {
        const on = this.state.statuses.includes(key) ? ' on' : '';
        html += `<button class="sb-chip${on}" data-status="${key}" onclick="App.toggleStatus('${key}')">${label}</button>`;
      }
      html += '</div>';
      html += '</div>';
    }

    // Zone list — all views, grouped by city, filterable
    html += '<div class="sb-section-label">מתחמים</div>';
    html += '<div class="sb-zone-filter"><input class="sb-input sb-zone-search" placeholder="סנן מתחמים..." oninput="App._filterZoneList(this.value)"></div>';
    html += '<div class="sb-zone-list" id="sb-zone-list">';
    const cityOrder = [['givatayim','גבעתיים'],['ramat-gan','רמת גן'],['tel-aviv','תל אביב']];
    for (const [slug, cityName] of cityOrder) {
      const city = CITIES[slug];
      if (!city) continue;
      html += `<div class="sb-city-group" data-city="${slug}">`;
      html += `<div class="sb-city-header">${cityName} <span class="sb-city-count">${city.zones.length}</span></div>`;
      for (const z of city.zones) {
        const active = v === 'zone' && z.id === this.state.zoneId ? ' active' : '';
        const statusDot = z.status === 'yes' ? 'good' : z.status === 'maybe' ? 'warn' : 'bad';
        html += `<button class="sb-zone-item${active}" data-zone-name="${z.name}" onclick="App.navigate('zone','${z.id}')">`;
        html += `<span class="sb-zone-dot ${statusDot}"></span>`;
        html += `<span class="sb-zone-label">${z.name.split('·')[0].trim()}</span>`;
        html += `</button>`;
      }
      html += '</div>';
    }
    html += '</div>';

    // Changelog
    const changes = checkForStatusChanges();
    if (changes.length) {
      html += '<div class="sb-changelog"><div class="sb-section-label">שינויים</div>';
      for (const c of changes) {
        const cls = c.to === 'yes' ? 'sb-change-good' : (c.to === 'no' ? 'sb-change-bad' : '');
        html += `<div class="sb-change ${cls}">${c.zoneName}: ${c.from} → ${c.to}</div>`;
      }
      html += '</div>';
    }

    sb.innerHTML = html;
  },

  // Budget debounce helper
  _budgetTimer: null,
  _onBudgetInput(val) {
    clearTimeout(App._budgetTimer);
    // Strip non-digits, parse
    const num = parseInt(val.replace(/[^\d]/g, '')) || 0;
    // Re-format input with commas
    const el = document.getElementById('sb-budget');
    if (el) {
      const pos = el.selectionStart;
      const oldLen = el.value.length;
      el.value = num ? num.toLocaleString('he-IL') : '';
      const newLen = el.value.length;
      el.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
    }
    App._budgetTimer = setTimeout(() => {
      App.state.budget = num;
      App.saveBudget();
      if (App.state.view === 'dashboard') App.renderDashboard();
    }, 300);
  },

  // ═══════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  renderDashboard() {
    document.title = 'סקירה · רדאר פינוי-בינוי';
    const main = document.getElementById('main');
    const zones = this.getFilteredZones();

    // ── KPI Row ──
    const inBudget = zones.length;
    const scored = zones.filter(z => z.valueScore != null).sort((a, b) => b.valueScore - a.valueScore);
    const topScore = scored.length ? scored[0] : null;
    const avgPpsqm = this._calcAvgPpsqm(zones);
    const deals = this._countDeals();

    let html = '<div class="kpi-row">';
    html += this._kpi('מתחמים בתקציב', inBudget, `מתוך ${getAllZonesFlat().length} מתחמים`);
    html += this._kpi('ציון ערך מוביל', topScore ? topScore.valueScore.toFixed(1) : '-', topScore ? topScore.zone : '', 'accent');
    html += this._kpi('ממוצע ₪/מ"ר', avgPpsqm ? '₪' + Math.round(avgPpsqm / 1000) + 'K' : '-', 'ממוצע מתחמים מסוננים');
    html += this._kpi('מציאות', deals, 'מחיר < 92% ממוצע מתחם');
    html += '</div>';

    // ── Ranked Table ──
    const sorted = this._sortZones(zones);
    html += '<div class="data-panel">';
    html += '<div class="panel-header"><span class="panel-title">דירוג מתחמים</span><span class="panel-subtitle">' + zones.length + ' מתחמים</span></div>';
    html += '<table class="zone-table"><thead><tr>';

    const cols = [
      { key: 'rank', label: '#' },
      { key: 'zone', label: 'מתחם' },
      { key: 'address', label: 'כתובת' },
      { key: 'city', label: 'עיר' },
      { key: 'price', label: 'מחיר כניסה' },
      { key: 'premium', label: 'פרמיה' },
      { key: 'timeline', label: 'אופק' },
      { key: 'status', label: 'סטטוס' },
      { key: 'score', label: 'ציון' }
    ];
    for (const c of cols) {
      const isSorted = this.state.sortCol === c.key;
      const arrow = isSorted ? (this.state.sortAsc ? '▲' : '▼') : '▽';
      const cls = isSorted ? ' class="sorted"' : '';
      html += `<th${cls} onclick="App.sortBy('${c.key}')"><span class="arrow">${arrow}</span>${c.label}</th>`;
    }
    html += '</tr></thead><tbody>';

    sorted.forEach((z, i) => {
      const statusCls = { yes: 'badge-good', maybe: 'badge-warn', no: 'badge-bad' }[z.status] || 'badge-neutral';
      const statusLabel = { yes: 'לקנות', maybe: 'לעקוב', no: 'לחכות' }[z.status] || z.status;
      const scoreCls = z.valueScore != null ? (z.valueScore >= 3 ? 'badge-good' : z.valueScore >= 1.5 ? 'badge-accent' : 'badge-neutral') : 'badge-neutral';
      html += `<tr onclick="App.navigate('zone','${z.zoneId}')">`;
      html += `<td class="rank">${i + 1}</td>`;
      html += `<td class="zone-name">${z.zone}</td>`;
      html += `<td class="address-col">${z.address || '-'}</td>`;
      html += `<td class="city-name">${z.city}</td>`;
      html += `<td>${z.priceLabel}</td>`;
      html += `<td>${z.premiumLabel}</td>`;
      html += `<td>${z.timelineLabel}</td>`;
      html += `<td><span class="badge ${statusCls}">${statusLabel}</span></td>`;
      html += `<td><span class="badge ${scoreCls}">${z.valueScore != null ? z.valueScore.toFixed(1) : '-'}</span></td>`;
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // ── Bottom Grid ──
    html += '<div class="bottom-grid">';

    // Left: Fresh deals
    html += '<div class="data-panel"><div class="panel-header"><span class="panel-title">מציאות טריות</span></div>';
    html += '<div class="listings-grid">';
    const freshDeals = this._getFreshDeals();
    if (freshDeals.length) {
      for (const d of freshDeals) html += d.html;
    } else {
      html += '<p style="color:var(--muted);font-size:11px">אין מציאות כרגע</p>';
    }
    html += '</div></div>';

    // Right: Timeline mini-gantt
    html += '<div class="data-panel"><div class="panel-header"><span class="panel-title">ציר זמן</span></div>';
    const maxYears = 15;
    for (const z of sorted) {
      if (!z.timelineMidYears) continue;
      const lo = Math.max(0, z.timelineMidYears - 2);
      const hi = z.timelineMidYears + 2;
      const left = (lo / maxYears * 100).toFixed(1);
      const width = (Math.min((hi - lo) / maxYears * 100, 100 - parseFloat(left))).toFixed(1);
      const color = { yes: 'var(--good)', maybe: 'var(--warn)', no: 'var(--bad)' }[z.status] || 'var(--muted)';
      html += `<div class="timeline-bar-row">
        <div class="timeline-bar-label">${z.zone.length > 12 ? z.zone.slice(0, 12) + '…' : z.zone}</div>
        <div class="timeline-bar-track">
          <div class="timeline-bar-fill" style="right:${left}%;width:${width}%;background:${color}"></div>
        </div>
      </div>`;
    }
    html += `<div class="timeline-axis"><span>0</span><span>5</span><span>10</span><span>15 שנים</span></div>`;
    html += '</div>';

    html += '</div>'; // close bottom-grid
    main.innerHTML = html;
  },

  // ── Dashboard Helpers ──
  _kpi(label, value, sub, cls) {
    return `<div class="kpi">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value${cls ? ' ' + cls : ''}">${value}</div>
      <div class="kpi-sub">${sub}</div>
    </div>`;
  },

  _calcAvgPpsqm(zones) {
    let sum = 0, count = 0;
    for (const z of zones) {
      // Look up the zone data to get ppsqm
      for (const [, city] of Object.entries(CITIES)) {
        const found = city.zones.find(cz => cz.id === z.zoneId);
        if (found) {
          const ppsqm = parsePpsqmRange(found.prices.rows);
          if (ppsqm) { sum += ppsqm; count++; }
          break;
        }
      }
    }
    return count ? sum / count : null;
  },

  _countDeals() {
    if (!_listingsCache || !_listingsCache.byZone) return 0;
    let count = 0;
    for (const [zoneId, listings] of Object.entries(_listingsCache.byZone)) {
      const zone = this._findZoneData(zoneId);
      if (!zone) continue;
      const avgPpsqm = parsePpsqmRange(zone.prices.rows);
      if (!avgPpsqm) continue;
      for (const l of listings) {
        const sqm = parseInt(l.sqm) || 0;
        const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;
        if (sqm > 0 && price > 0) {
          const ppsqm = price / sqm;
          if (ppsqm / avgPpsqm < 0.92) count++;
        }
      }
    }
    return count;
  },

  _getFreshDeals() {
    if (!_listingsCache || !_listingsCache.byZone) return [];
    const deals = [];
    for (const [zoneId, listings] of Object.entries(_listingsCache.byZone)) {
      const zone = this._findZoneData(zoneId);
      if (!zone) continue;
      const avgPpsqm = parsePpsqmRange(zone.prices.rows);
      if (!avgPpsqm) continue;
      for (const l of listings) {
        const sqm = parseInt(l.sqm) || 0;
        const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;
        if (sqm > 0 && price > 0) {
          const ppsqm = price / sqm;
          if (ppsqm / avgPpsqm < 0.92) {
            deals.push({ html: formatListingCard(l, avgPpsqm), ppsqmRatio: ppsqm / avgPpsqm });
          }
        }
      }
    }
    deals.sort((a, b) => a.ppsqmRatio - b.ppsqmRatio);
    return deals.slice(0, 6);
  },

  _findZoneData(zoneId) {
    for (const [, city] of Object.entries(CITIES)) {
      const z = city.zones.find(cz => cz.id === zoneId);
      if (z) return z;
    }
    return null;
  },

  _findZoneCity(zoneId) {
    for (const [, city] of Object.entries(CITIES)) {
      if (city.zones.find(cz => cz.id === zoneId)) return city;
    }
    return null;
  },

  _sortZones(zones) {
    const col = this.state.sortCol;
    const asc = this.state.sortAsc;
    const sorted = [...zones];
    sorted.sort((a, b) => {
      let va, vb;
      switch (col) {
        case 'rank':
        case 'score':    va = a.valueScore || 0; vb = b.valueScore || 0; break;
        case 'zone':     va = a.zone; vb = b.zone; break;
        case 'address':  va = a.address; vb = b.address; break;
        case 'city':     va = a.city; vb = b.city; break;
        case 'price':    va = a.entryPriceMin; vb = b.entryPriceMin; break;
        case 'premium':  va = a.premiumMid; vb = b.premiumMid; break;
        case 'timeline': va = a.timelineMidYears; vb = b.timelineMidYears; break;
        case 'status':   va = { yes: 3, maybe: 2, no: 1 }[a.status] || 0; vb = { yes: 3, maybe: 2, no: 1 }[b.status] || 0; break;
        default:         va = a.valueScore || 0; vb = b.valueScore || 0;
      }
      if (typeof va === 'string') return asc ? va.localeCompare(vb) : vb.localeCompare(va);
      return asc ? va - vb : vb - va;
    });
    return sorted;
  },

  // ═══════════════════════════════════════════════════════════════
  //  ZONE DETAIL
  // ═══════════════════════════════════════════════════════════════
  renderZoneDetail(zoneId) {
    document.title = 'מתחם · רדאר פינוי-בינוי';
    const main = document.getElementById('main');
    const zone = this._findZoneData(zoneId);
    const city = this._findZoneCity(zoneId);

    if (!zone || !city) {
      main.innerHTML = '<p style="color:var(--muted)">מתחם לא נמצא</p>';
      return;
    }

    document.title = zone.name + ' · רדאר פינוי-בינוי';

    const statusCls = { yes: 'badge-good', maybe: 'badge-warn', no: 'badge-bad' }[zone.status] || 'badge-neutral';
    const score = computeValueScore(zone);
    const scoreCls = score != null ? (score >= 3 ? 'badge-good' : score >= 1.5 ? 'badge-accent' : 'badge-neutral') : 'badge-neutral';
    const dev = findDeveloper(zone);

    let html = '<div class="zone-header">';
    html += '<button class="zone-back" onclick="App.navigate(\'dashboard\')">← חזרה לסקירה</button>';
    html += '<div class="zone-title-row">';
    html += `<span class="zone-title">${zone.name}</span>`;
    html += `<span class="badge ${statusCls}">${zone.statusLabel}</span>`;
    if (score != null) html += `<span class="badge ${scoreCls}">ציון ${score.toFixed(1)}</span>`;
    if (dev) html += `<span class="dev-badge" title="${dev.note}">🏗 ${dev.key} · דרג ${dev.tier}</span>`;
    html += '</div>';

    // Subtitle with city + facts
    html += `<div class="zone-subtitle">${city.name} · ${zone.sub}</div>`;
    html += '</div>';

    // KPI chips from prices.rows
    html += '<div class="zone-kpis">';
    for (const row of zone.prices.rows) {
      html += `<div class="zone-kpi"><div class="zone-kpi-label">${row[0]}</div><div class="zone-kpi-value">${row[1]}</div></div>`;
    }
    html += '</div>';

    // Facts
    html += '<div class="zone-kpis">';
    for (const fact of zone.facts) {
      html += `<div class="zone-kpi"><div class="zone-kpi-label">${fact[0]}</div><div class="zone-kpi-value">${fact[1]}</div></div>`;
    }
    html += '</div>';

    // Description
    html += `<div class="zone-desc">${zone.desc}</div>`;

    // Action block
    html += `<div class="zone-action"><div class="zone-action-label">מה לעשות?</div>${zone.action}</div>`;

    // Listings
    if (_listingsCache) {
      const listingsHtml = this._renderZoneListings(zoneId, zone);
      if (listingsHtml) html += listingsHtml;
    }

    // Search buttons
    const links = buildSearchLinks(city, { hood: zone.hood });
    html += '<div class="data-panel"><div class="panel-header"><span class="panel-title">חפש דירות</span></div>';
    html += '<div class="search-row">';
    html += renderSearchButtons(links);
    html += '</div></div>';

    main.innerHTML = html;
  },

  _renderZoneListings(zoneId, zone) {
    if (!_listingsCache || !_listingsCache.byZone) return '';
    const list = _listingsCache.byZone[zoneId] || [];
    if (!list.length) return '';

    const avgPpsqm = parsePpsqmRange(zone.prices.rows);
    const updated = _listingsCache._meta && _listingsCache._meta.updated ? ' · עודכן ' + _listingsCache._meta.updated : '';

    let html = '<div class="data-panel">';
    html += `<div class="panel-header"><span class="panel-title">דירות לדוגמה במתחם${updated}</span></div>`;
    html += '<div class="listings-grid">';
    for (const l of list) {
      html += formatListingCard(l, avgPpsqm);
    }
    html += '</div></div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════
  //  TOOLS
  // ═══════════════════════════════════════════════════════════════
  toggleTool(id) {
    document.getElementById('tool-' + id)?.classList.toggle('open');
  },

  renderTools(section) {
    document.title = 'כלים · רדאר פינוי-בינוי';
    const main = document.getElementById('main');
    const allZones = getAllZonesFlat();

    // Zone options for dropdowns
    const zoneOpts = allZones.map(z => {
      const price = parsePriceMin(z.priceLabel);
      return `<option value="${price}" data-zone-id="${z.zoneId}">${z.zone} (${z.city}) — ${z.priceLabel}</option>`;
    }).join('');

    // ── Section 1: Mortgage Calculator ──
    const calcHtml = `
      <div class="calc-row">
        <label>בחר מתחם (אופציונלי)</label>
        <select id="calc-zone" onchange="if(this.value){document.getElementById('calc-price').value=this.value;App._calcMortgage()}">
          <option value="">— בחר מתחם למילוי אוטומטי —</option>
          ${zoneOpts}
        </select>
      </div>
      <div class="calc-row">
        <label>מחיר הדירה (₪)</label>
        <input type="number" id="calc-price" value="3500000" step="100000" oninput="App._calcMortgage()">
      </div>
      <div class="calc-row">
        <label>הון עצמי (₪)</label>
        <input type="number" id="calc-equity" value="1000000" step="50000" oninput="App._calcMortgage()">
      </div>
      <div class="calc-row">
        <label>סטטוס דירה</label>
        <select id="calc-status" onchange="App._calcMortgage()">
          <option value="first">דירה יחידה</option>
          <option value="second">דירה שנייה / משקיע</option>
        </select>
      </div>
      <div class="calc-row">
        <label>ריבית משכנתא שנתית (%)</label>
        <input type="number" id="calc-rate" value="4.5" step="0.1" oninput="App._calcMortgage()">
      </div>
      <div class="calc-row">
        <label>תקופת משכנתא (שנים)</label>
        <input type="number" id="calc-years" value="25" step="5" oninput="App._calcMortgage()">
      </div>
      <div class="calc-result">
        <div class="res-label">מס רכישה</div>
        <div class="res-val" id="calc-res-tax">—</div>
      </div>
      <div class="calc-result">
        <div class="res-label">החזר חודשי · משכנתא</div>
        <div class="res-val" id="calc-res-monthly">—</div>
        <div class="res-sub" id="calc-res-loan">—</div>
      </div>
      <div class="calc-result">
        <div class="res-label">סה"כ עלות אמיתית (כולל ריבית)</div>
        <div class="res-val" id="calc-res-total">—</div>
        <div class="res-sub" id="calc-res-interest">—</div>
      </div>
      <div class="warning-box" style="margin-top:18px;font-size:13px;line-height:1.7;background:rgba(255,181,71,.08);border:1px solid rgba(255,181,71,.3);border-radius:12px;padding:14px">
        <strong style="color:var(--warn)">זהירות:</strong> מס רכישה מחושב לפי מדרגות 2026 (דירה יחידה — 0% עד 2.1M, 3.5% עד 2.5M, 5% עד 6.05M, 8% עד 20.2M, 10% מעל. משקיע — 8% עד 6.05M, 10% עד 20.2M, 12% מעל). היטל השבחה, עו"ד, ושמאי לא כלולים.
      </div>`;

    // ── Section 2: Opportunity Scorer ──
    const factors = [
      { name: 'stage', weight: 25, title: '1. באיזה שלב נמצא הפרויקט?', help: 'ככל שהפרויקט מתקדם יותר — כך הסיכון הרגולטורי קטן יותר.', options: [
        ['100', 'יש היתר בנייה מלא והיזם כבר משווק'],
        ['80', 'תוכנית מאושרת, ממתין להיתר'],
        ['55', 'תוכנית מופקדת (בהתנגדויות)'],
        ['30', 'תוכנית בהכנה / לפני הפקדה'],
        ['10', 'רק תוכנית-אב / רעיון']
      ]},
      { name: 'consent', weight: 20, title: '2. כמה דיירים כבר חתמו על הסכם הפינוי?', help: 'בלי 80% — אי אפשר להתקדם.', options: [
        ['100', 'מעל 80% חתמו (רוב מובטח)'],
        ['75', '66%-80% חתמו'],
        ['45', '50%-65% חתמו'],
        ['15', 'פחות מ-50%'],
        ['50', 'לא רלוונטי — קנייה מהיזם']
      ]},
      { name: 'developer', weight: 15, title: '3. מי היזם?', help: 'יזם ותיק עם פרויקטים מוגמרים = סיכון אי-ביצוע נמוך.', options: [
        ['100', 'יזם מוביל (אביב, אזורים, קרסו, אשטרום וכו\')'],
        ['70', 'יזם בינוני עם 3+ פרויקטים מוגמרים'],
        ['40', 'יזם קטן / פחות מוכר'],
        ['15', 'חברה חדשה / בלי היסטוריה']
      ]},
      { name: 'price', weight: 15, title: '4. המחיר ביחס לעסקאות דומות באזור', help: 'בדוק ב-nadlan.gov.il עסקאות ב-12 חודשים האחרונים באותם רחובות.', options: [
        ['100', 'מתחת ל-95% ממחיר שוק רגיל'],
        ['75', '95%-105% ממחיר שוק'],
        ['45', '105%-120% (פרמיה בגלל הפוטנציאל)'],
        ['10', 'מעל 120% — כבר "מתומחר"']
      ]},
      { name: 'location', weight: 10, title: '5. מיקום', help: 'קרבה לרכבת הקלה, לתל אביב, וצירים ראשיים משפיעה על שווי עתידי.', options: [
        ['100', 'ליד תחנת רכבת קלה / גבול ת"א'],
        ['75', 'מרכז העיר / ציר ראשי'],
        ['50', 'שכונה שקטה אך מתפתחת'],
        ['25', 'מרוחק / פחות נגיש']
      ]},
      { name: 'horizon', weight: 10, title: '6. אופק זמן שאתה יכול להמתין', help: 'פינוי-בינוי לוקח זמן. פרויקטים מוכנים הרבה יותר מתאימים אם צריך דירה עכשיו.', options: [
        ['100', '10+ שנים — יכול לחכות בקלות'],
        ['70', '5-10 שנים'],
        ['40', '3-5 שנים בלבד'],
        ['15', 'פחות מ-3 שנים']
      ]},
      { name: 'objections', weight: 5, title: '7. האם יש התנגדויות / ערעורים?', help: 'פרויקטים בהתנגדויות יכולים להיתקע שנים.', options: [
        ['100', 'אין התנגדויות ידועות'],
        ['60', 'היו התנגדויות — כבר נפתרו'],
        ['20', 'התנגדויות פעילות / ערעורים בבית משפט']
      ]}
    ];

    let scoreHtml = '<div class="score-layout">';
    scoreHtml += '<div>';
    for (const f of factors) {
      scoreHtml += `<div class="score-factor"><h3>${f.title}</h3><div class="help" style="color:var(--muted);font-size:14px;margin-bottom:14px;line-height:1.6">${f.help}</div><div class="score-options">`;
      for (const [val, label] of f.options) {
        scoreHtml += `<label class="score-option"><input type="radio" name="score_${f.name}" value="${val}" onchange="App._updateScore()"><span class="opt-label">${label}</span><span class="opt-pts">${val} נק'</span></label>`;
      }
      scoreHtml += '</div></div>';
    }
    scoreHtml += '</div>';
    scoreHtml += `<aside class="score-panel">
      <div class="score-ring" id="scoreRing" style="background:conic-gradient(var(--border) 0%,var(--border) 100%)">
        <div class="score-ring-inner">
          <div class="score-num" id="scoreNum">—</div>
          <div class="score-max">/ 100</div>
        </div>
      </div>
      <div class="score-label" id="scoreLabel">בחר תשובות כדי לקבל ניקוד</div>
      <div class="score-verdict" id="scoreVerdict" style="font-size:14px;color:var(--muted);line-height:1.6;text-align:right">
        הניקוד משקלל 7 גורמים — שלב רגולטורי (25%), רוב דיירים (20%), איכות יזם (15%), מחיר (15%), מיקום (10%), אופק זמן (10%), התנגדויות (5%).
      </div>
      <button style="margin-top:20px;width:100%;background:var(--bg-2);border:1px solid var(--border);color:var(--muted);padding:10px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:13px" onclick="document.querySelectorAll('#tool-scorer input[type=radio]').forEach(r=>r.checked=false);document.querySelectorAll('#tool-scorer .score-option').forEach(o=>o.classList.remove('selected'));App._updateScore()">איפוס</button>
    </aside>`;
    scoreHtml += '</div>';

    // ── Section 3: Checklist ──
    const phases = [
      { num: 1, title: 'סינון ראשוני — מוצאים נכס ובודקים רקע', sub: 'לפני שמשלמים כסף על עו"ד או שמאי', items: [
        ['בדקתי במבא"ת אם יש תוכנית פעילה על הכתובת', 'חפש לפי כתובת או גוש/חלקה. אם אין תוכנית — אין פרויקט.'],
        ['ראיתי מה הסטטוס: מופקדת / מאושרת / לקראת הפקדה', 'הפערים ביניהם = שנים של המתנה.'],
        ['חיפשתי את המתחם ברשימת מתחמי פינוי-בינוי הרשמיים', 'אתר הרשות להתחדשות עירונית. הכרזה רשמית = הטבות מס.'],
        ['מצאתי מי היזם / לא מצאתי', 'אם קיים — בדוק ותק, פרויקטים מוגמרים, דירוג. אם לא — הפרויקט בוודאי לא בשל.'],
        ['בדקתי עסקאות אחרונות באזור ב-nadlan.gov.il', 'קח 12 חודשים אחרונים של אותם רחובות. זו הבסיס להשוואת מחירים.'],
        ['השוותי את המחיר המבוקש למחיר שוק רגיל באזור', 'אם המחיר 20% מעל השוק — המוכר כבר הפנים את הפוטנציאל.'],
        ['חיפשתי את כתובת המתחם באתר החדשות המקומי', 'גלובס, Themarker, ynet נדל"ן. כל מחלוקת / התנגדות תמצא שם.']
      ]},
      { num: 2, title: 'בדיקת מסמכים — מה באמת יש', sub: 'חובה לפני הגשת הצעת מחיר', items: [
        ['הוצאתי נסח טאבו מעודכן', 'מי הבעלים, משכנתאות, הערות אזהרה, הערות פינוי-בינוי. עלות ~15 ש"ח.'],
        ['ראיתי את תשריט התב"ע הרלוונטית', 'במבא"ת, לחץ על מספר התוכנית → "תשריט" → PDF.'],
        ['קראתי את הוראות התב"ע', 'כמה קומות מותר? כמה דירות? מה יחס ההעברה (כמה מ"ר חדש על כל מ"ר ישן)?'],
        ['ביקשתי לראות את החוזה שהדיירים חתמו עם היזם', '(אם כבר חתמו) — שיעור היחס ההעברה, פיצויים, ערבויות.'],
        ['ברור לי כמה % מהדיירים חתמו נכון להיום', 'מהוועד, מיזם, מעו"ד המתחם. פחות מ-66% = סיכון. מעל 80% = שלב מתקדם.'],
        ['בדקתי פרוטוקולי ועדה מקומית', 'אתר העירייה → הנדסה → פרוטוקולים. תאריכי דיונים בפרויקט שלך.'],
        ['בדקתי אם יש התנגדויות שטרם טופלו', 'בטקסט המחלטת הוועדה. התנגדות פעילה = עיכוב.']
      ]},
      { num: 3, title: 'כספים ומיסוי', sub: 'מה באמת תשלם, מה באמת תקבל', items: [
        ['חישבתי מס רכישה לפי סטטוס שלי', 'דירה יחידה: 0%-5% מדרגות. דירה 2+: 8% מהשקל הראשון.'],
        ['התייעצתי עם יועץ מס על מס שבח העתידי', 'אם אתה משקיע, לא דייר — מס שבח יחול כשתמכור.'],
        ['ברור לי מי משלם היטל השבחה', 'בפינוי-בינוי — בדרך כלל היזם. בקשת דירה ישנה — בחלק מהמקרים אתה.'],
        ['אם קונה מיזם — ראיתי דוגמה לערבות בנקאית', 'עליה לכסות כל תשלום מעל 7% מערך הדירה. בלי זה — אל תשלם.'],
        ['בדקתי כושר המשכנתא שלי', 'בנק או יועץ משכנתאות. מה האחוז המרבי, מה הריבית, מה ההחזר החודשי.'],
        ['חישבתי תזרים מלא: קנייה + ריבית + דמי ניהול + מסים עד המסירה', 'פרויקט שלוקח 8 שנים — הריבית המצטברת יכולה להכפיל את העלות.']
      ]},
      { num: 4, title: 'משפטי — רק עם עורך דין מקרקעין', sub: 'לפני החתימה', items: [
        ['עו"ד מקרקעין עם ניסיון בפינוי-בינוי ליווה אותי', 'לא כל עו"ד מקרקעין מכיר את הניואנסים של פינוי-בינוי.'],
        ['החוזה כולל תנאי יציאה ברור למקרה שהפרויקט לא מתקדם', '"אם לא התקבל היתר תוך X שנים — הרוכש זכאי לבטל ולקבל את כספו חזרה עם ריבית".'],
        ['זיכרון דברים לא נחתם לפני שעו"ד אישר', 'זיכרון דברים הוא חוזה מחייב. חריג שכיח בישראל.'],
        ['בדקתי חוזה עם היזם לתנאי פיצוי לדיירים הישנים', 'אם בעל הבית הישן כבר חתם — מה הוא קיבל?'],
        ['קראתי את התוכנית מול התשריט — הדירה שאני קונה אמנם נמצאת שם', 'חשוב לראות את הקומה, הכיוון, המ"ר.'],
        ['הוספתי לחוזה סעיף אכיפה אם היזם חורג מלו"ז', 'קנסות יומיים, או זכות ביטול אחרי איחור X חודשים.']
      ]}
    ];
    const totalItems = phases.reduce((s, p) => s + p.items.length, 0);
    let itemIdx = 0;
    let checkHtml = `<div class="check-progress" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px">
        <span><strong id="checkNum">0</strong> / ${totalItems} סעיפים</span>
        <span id="checkPct">0%</span>
      </div>
      <div style="height:10px;background:var(--bg-2);border-radius:10px;overflow:hidden">
        <div id="checkFill" style="height:100%;background:var(--gradient);width:0%;transition:width .3s;border-radius:10px"></div>
      </div>
    </div>`;
    for (const phase of phases) {
      checkHtml += `<div class="phase" style="margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border)">
          <div style="width:36px;height:36px;background:var(--gradient);color:var(--bg);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0">${phase.num}</div>
          <div><div style="font-size:18px;font-weight:800">${phase.title}</div><div style="font-size:13px;color:var(--muted);margin-top:2px">${phase.sub}</div></div>
        </div>`;
      for (const [title, help] of phase.items) {
        checkHtml += `<label class="check-item" style="display:flex;align-items:flex-start;gap:14px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;cursor:pointer;transition:all .15s">
          <input type="checkbox" data-idx="${itemIdx}" onchange="App._onCheckChange()" style="margin-top:3px;accent-color:var(--good);width:18px;height:18px;cursor:pointer;flex-shrink:0">
          <div style="flex:1"><div style="font-weight:600;font-size:15px;margin-bottom:4px">${title}</div><div style="color:var(--muted);font-size:13px;line-height:1.6">${help}</div></div>
        </label>`;
        itemIdx++;
      }
      checkHtml += '</div>';
    }
    checkHtml += `<button onclick="App._resetChecklist()" style="display:block;margin:16px auto 0;background:var(--bg-2);border:1px solid var(--border);color:var(--muted);padding:10px 24px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:13px">איפוס כל הצ'קליסט</button>`;

    // ── Section 4: Search Builder ──
    const allHoods = [];
    for (const slug of this.state.cities) {
      const city = CITIES[slug];
      if (!city) continue;
      for (const z of city.zones) {
        if (z.hood && !allHoods.includes(z.hood)) allHoods.push(z.hood);
      }
    }
    let searchHtml = `<div style="margin-bottom:16px">
      <div style="font-size:13px;color:var(--muted);margin-bottom:8px;font-weight:600">שכונות</div>
      <div class="hood-chips" style="display:flex;flex-wrap:wrap;gap:8px">
        ${allHoods.map(h => `<button type="button" class="hood-chip" onclick="App._toggleHoodChip(this,'${h.replace(/'/g, "\\'")}')">${h}</button>`).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:6px;font-weight:600">חדרים</div>
        <select id="search-rooms" style="width:100%;background:var(--bg-2);border:1px solid var(--border);padding:12px;border-radius:10px;color:var(--text);font-family:inherit;font-size:15px">
          <option value="">לא משנה</option>
          <option value="2-3">2-3 חדרים</option>
          <option value="3-3">3 חדרים בלבד</option>
          <option value="3-4">3-4 חדרים</option>
          <option value="4-4">4 חדרים בלבד</option>
          <option value="4-5">4-5 חדרים</option>
          <option value="5-99">5+ חדרים</option>
        </select>
      </div>
      <div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:6px;font-weight:600">מחיר מקסימלי (₪)</div>
        <input type="number" id="search-max-price" placeholder="למשל 4000000" step="100000" style="width:100%;background:var(--bg-2);border:1px solid var(--border);padding:12px;border-radius:10px;color:var(--text);font-family:inherit;font-size:15px;box-sizing:border-box">
      </div>
    </div>
    <button onclick="App._buildSearch()" style="background:var(--gradient);color:var(--bg);border:none;padding:12px 28px;border-radius:10px;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer">חפש דירות</button>
    <div id="search-results" style="margin-top:18px"></div>`;

    // ── Section 5: Glossary ──
    const glossaryTerms = [
      { id: 'pinui', term: 'פינוי-בינוי', tr: 'Pinui-Binui · Evacuation and Reconstruction',
        desc: 'מסלול להתחדשות עירונית שבו הורסים לגמרי בניינים ישנים ובונים חדשים במקומם — בדרך כלל גבוהים ועם יותר דירות. הדיירים הישנים מקבלים דירה חדשה ואת ההפרש היזם מוכר בשוק החופשי.',
        example: 'AIR — שני בניינים בני 3 קומות פונו, נבנה במקומם מגדל מגורים עם 333 דירות.' },
      { id: 'tama', term: 'תמ"א 38', tr: 'Tama 38 · National Master Plan 38',
        desc: 'תוכנית ארצית שאפשרה חיזוק מבנים ישנים נגד רעידות אדמה תמורת תוספת דירות. 38/1 (חיזוק + תוספת קומות) ו-38/2 (הריסה ובנייה מחדש). התוכנית הסתיימה ב-2022.',
        example: 'אם יש מודעה שמבטיחה "תמ"א 38" — תבדוק מתי הוגשה הבקשה. אחרי 2022 זה לא אופציה חדשה.' },
      { id: 'tochnit', term: 'תב"ע — תוכנית בניין עיר', tr: 'Tochnit Binyan Ir · Local Building Plan',
        desc: 'המסמך התכנוני המרכזי שמגדיר "מה מותר לבנות כאן" — כמה קומות, אילו שימושים, זכויות בנייה, דרכים. כדי שפרויקט פינוי-בינוי ייצא לדרך, חייבת להיות תב"ע מאושרת.',
        example: 'שלבי החיים של תב"ע: הכנה → הגשה → הפקדה → דיון → אישור → תוקף.' },
      { id: 'hefkada', term: 'תוכנית מופקדת / מאושרת', tr: '',
        desc: 'מופקדת = התב"ע הוגשה רשמית ופתוחה 60 יום להתנגדויות. עדיין לא מחייבת. מאושרת = אחרי הפקדה ודיון, התוכנית אושרה סופית ותקפה.',
        example: 'הפער בין "לקראת הפקדה" ל"מאושרת" יכול להיות 3-5 שנים.' },
      { id: 'mavat', term: 'מבא"ת', tr: 'MAVAT · Government Planning Database',
        desc: 'המערכת הממשלתית המרכזית לכל התוכניות בישראל. אפשר לחפש לפי גוש/חלקה, שם רחוב, או שם תוכנית, ולקבל את כל המסמכים.',
        example: 'לפני שקונים דירה — מחפשים את כתובתה ב-mavat.iplan.gov.il ורואים אם יש תב"ע פעילה.' },
      { id: 'vaada', term: 'ועדה מקומית / ועדה מחוזית', tr: '',
        desc: 'ועדה מקומית = של העירייה, מאשרת היתרי בנייה ותוכניות קטנות. ועדה מחוזית = של המחוז, מאשרת תוכניות גדולות כמו תב"ע לפינוי-בינוי מתחמי.',
        example: 'יזם מגיש תב"ע לוועדה המחוזית → אישור → מגיש בקשה להיתר לוועדה המקומית → אישור → בונה.' },
      { id: 'heter', term: 'היתר בנייה', tr: '',
        desc: 'האישור הסופי של העירייה שמאפשר פיזית להתחיל לבנות. זה המסמך הכי חשוב — בלעדיו הכל רק על הנייר.',
        example: 'יזם שאומר "ההיתר יגיע תוך שבועיים" אבל כבר חודשיים לא קרה כלום — בקש לראות את המסמך הרשמי.' },
      { id: 'sarvan', term: 'דייר סרבן', tr: '',
        desc: 'דייר שמסרב לחתום על הסכם הפינוי-בינוי. פרויקט חייב תמיכה של 80% מבעלי הדירות כדי להתחיל. יש מנגנון משפטי (סעיף 23) להסיר סרבן יחיד.',
        example: '"כמה דיירים חתמו?" אם פחות מ-70% — הסיכון גבוה.' },
      { id: '66', term: 'רוב 66% / 80%', tr: '',
        desc: '66% = הרוב הדרוש להתחיל תהליך מקדים. 80% = הרוב הנדרש בפועל כדי להחיל את הפרויקט על כל הדיירים (כולל הסרבנים).',
        example: '"מתחם" = קבוצה של בניינים שעל פי התב"ע מתחדשים יחד. לפעמים 2 בניינים, לפעמים 20.' },
      { id: 'saif23', term: 'סעיף 23 לחוק פינוי-בינוי', tr: '',
        desc: 'הסעיף שמאפשר לתבוע דייר סרבן יחיד אם הוא מונע מ-80% מהשכנים להתחדש. בית המשפט יכול לחייב אותו להצטרף לפרויקט. מסלול ארוך — 1-3 שנים.',
        example: 'אם יש 1-2 סרבנים — הפרויקט יקרה, אבל לא מחר.' },
      { id: 'hitnagdut', term: 'התנגדויות', tr: '',
        desc: 'מסמכים שתושבים, שכנים, או העירייה מגישים נגד תוכנית מופקדת. במהלך 60 יום של הפקדה — כל אחד יכול להגיש. התנגדויות יכולות לדחות, לשנות או לבטל תוכנית.',
        example: 'תוכנית ארלוזורוב (שני מגדלים בני 15 קומות) נמצאת בסטטוס התנגדויות — זו הסיבה שהמתחם מסומן כ"עדיין לא".' },
      { id: 'arvut', term: 'ערבות בנקאית', tr: '',
        desc: 'מסמך מהבנק שמבטיח שאם היזם פשט רגל או לא יסיים לבנות — הרוכש יקבל את כספו חזרה. בישראל זה חובה. לעולם לא לשלם סכום משמעותי ליזם בלי ערבות.',
        example: '"חוק המכר דירות" — מחייב את היזם לתת ערבות על כל תשלום מעל 7% משווי הדירה.' },
      { id: 'hashvaha', term: 'היטל השבחה', tr: '',
        desc: 'מס שהעירייה גובה כשערך הנכס עלה בגלל אישור תוכנית חדשה. בפרויקטי פינוי-בינוי — היזם בדרך כלל נושא בהיטל.',
        example: 'גובה ההיטל: 50% מההפרש בין שווי הנכס לפני התוכנית לאחריה.' },
      { id: 'shevach', term: 'מס שבח', tr: '',
        desc: 'מס על רווח ההון ממכירת דירה. בפינוי-בינוי — יש פטור לבעל דירה יחידה שמקבל דירה חדשה במקום הישנה.',
        example: 'אם בעוד 7 שנים תקבל דירה חדשה תמורת הישנה — בדרך כלל הפטור חל גם עליך אם זו דירתך היחידה.' },
      { id: 'rechisha', term: 'מס רכישה', tr: '',
        desc: 'מס שמשלם הקונה בעת רכישת דירה. לדירה יחידה — מדרגות ותעריפים נוחים (0%-5%). לדירה שנייה או משקיע — 8%-10% מהשקל הראשון.',
        example: 'אם קונה דירה ישנה במתחם לצורך השקעה — מס רכישה של משקיע (8%+). זה משפיע על המשוואה.' },
      { id: 'nesach', term: 'נסח טאבו', tr: '',
        desc: 'מסמך רשמי מרשם המקרקעין שמראה: מי הבעלים, משכנתאות, עיקולים, הערות אזהרה. חובה להוציא לפני כל קנייה.',
        example: 'באתר טאבו אונליין או דרך עורך הדין שלך. עלות ~15 ש"ח.' },
      { id: 'gush', term: 'גוש / חלקה', tr: '',
        desc: 'המספר הרשמי של הקרקע במפות הקדסטר של ישראל. "גוש" = אזור, "חלקה" = חלקת קרקע ספציפית. זו הדרך הכי מדויקת לחפש תוכניות.',
        example: 'מוצאים את המספרים בנסח הטאבו, ברישיונות הבנייה, או ב-nadlan.gov.il.' },
      { id: 'rashut', term: 'הרשות הממשלתית להתחדשות עירונית', tr: '',
        desc: 'הגוף המרכזי במדינה שאחראי על פרויקטי פינוי-בינוי. מכריז על מתחמים רשמיים, מלווה דיירים, ומקיים מאגר פרויקטים פתוח.',
        example: 'אתר הרשות: gov.il/urban-renewal — רשימה של מתחמים מוכרזים.' }
    ];
    let glossaryHtml = '';
    for (const t of glossaryTerms) {
      glossaryHtml += `<div class="glossary-term" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:10px;cursor:pointer" onclick="this.classList.toggle('expanded')">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3 style="color:var(--accent);margin:0;font-size:16px">${t.term}</h3>
          <span style="color:var(--muted);font-size:12px;transition:transform .2s">${t.tr ? t.tr : ''} ▼</span>
        </div>
        <div class="glossary-body" style="display:none;margin-top:12px">
          <p style="font-size:15px;line-height:1.7;margin-bottom:10px">${t.desc}</p>
          <div style="background:var(--bg-2);border-right:3px solid var(--accent);padding:12px 14px;border-radius:8px;font-size:14px;color:var(--muted);margin-top:10px"><strong style="color:var(--text)">דוגמה:</strong> ${t.example}</div>
        </div>
      </div>`;
    }

    // ── Section 6: Resources ──
    const resourceGroups = [
      { title: 'תוכניות ורגולציה', items: [
        { tag: 'חינם · רשמי', cls: 'free', title: 'מבא"ת — מערכת התכנון הארצית', desc: 'חיפוש מרכזי של כל התוכניות. חיפוש לפי כתובת, גוש/חלקה או מס\' תוכנית.', url: 'https://mavat.iplan.gov.il', label: 'mavat.iplan.gov.il' },
        { tag: 'חינם · רשמי', cls: 'free', title: 'הרשות להתחדשות עירונית', desc: 'רשימת מתחמי פינוי-בינוי מוכרזים, הטבות מס, מדריכים.', url: 'https://www.gov.il/he/departments/government_authority_for_urban_renewal', label: 'gov.il/urban-renewal' },
        { tag: 'חינם · רשמי', cls: 'free', title: 'מינהל התכנון', desc: 'מסמכי מדיניות, הנחיות, תמ"אות ותוכניות ארציות.', url: 'https://www.gov.il/he/departments/ministry_of_interior_planning_administration', label: 'gov.il/planning' }
      ]},
      { title: 'עסקאות ושווי נדל"ן', items: [
        { tag: 'חינם · רשמי', cls: 'free', title: 'nadlan.gov.il — עסקאות אמת', desc: 'כל עסקאות הנדל"ן שדווחו לרשות המיסים. הבסיס להערכת מחיר אמיתי.', url: 'https://www.nadlan.gov.il', label: 'nadlan.gov.il' },
        { tag: 'חלקי חינם', cls: 'paid', title: 'Madlan', desc: 'דירות למכירה + מפות חמות של מחירי שוק.', url: 'https://www.madlan.co.il', label: 'madlan.co.il' },
        { tag: 'חלקי חינם', cls: 'paid', title: 'Yad2 נדל"ן', desc: 'הלוח הגדול בישראל. דירות למכירה, השכרה, מודעות מקבלנים.', url: 'https://www.yad2.co.il/realestate', label: 'yad2.co.il' },
        { tag: 'חינם · API', cls: 'free', title: 'data.gov.il — API CKAN', desc: 'גישה פרוגרמטית לעסקאות, נתוני למ"ס, רשימת רחובות.', url: 'https://data.gov.il/dataset', label: 'data.gov.il' }
      ]},
      { title: 'מסמכים משפטיים', items: [
        { tag: '~15 ש"ח', cls: 'paid', title: 'טאבו אונליין — נסחים', desc: 'הוצאת נסח טאבו בתשלום נמוך, תוך דקות. חובה לפני כל קנייה.', url: 'https://www.gov.il/he/departments/general/real_estate_registration', label: 'טאבו אונליין' },
        { tag: 'חינם · רשמי', cls: 'free', title: 'חוק פינוי-בינוי — נוסח מלא', desc: 'הנוסח המעודכן של החוק, כולל סעיף 23 על דייר סרבן.', url: 'https://www.nevo.co.il', label: 'nevo.co.il' },
        { tag: 'חינם · ספריה', cls: 'free', title: 'פסקי דין בפינוי-בינוי', desc: 'מאגר פסקי דין של בתי משפט בעניין סעיף 23 וסרבנים.', url: 'https://www.takdin.co.il', label: 'takdin.co.il' }
      ]},
      { title: 'מיסוי', items: [
        { tag: 'חינם · רשמי', cls: 'free', title: 'מחשבון מס רכישה', desc: 'המחשבון הרשמי של רשות המיסים.', url: 'https://www.gov.il/he/service/purchase-tax-calculator', label: 'gov.il/purchase-tax' },
        { tag: 'חינם · רשמי', cls: 'free', title: 'מס שבח — הנחיות', desc: 'פטורים בפינוי-בינוי, חישוב מס שבח למשקיעים, טפסים.', url: 'https://www.gov.il/he/departments/topics/real_estate_taxes', label: 'gov.il/real-estate-taxes' }
      ]},
      { title: 'חדשות ומעקב', items: [
        { tag: 'מנוי', cls: 'paid', title: 'גלובס — נדל"ן', desc: 'חדשות עסקיות עדכניות על פרויקטים, יזמים, עסקאות.', url: 'https://www.globes.co.il/news/RealEstate.aspx', label: 'globes.co.il' },
        { tag: 'חינם', cls: 'free', title: 'ynet — נדל"ן', desc: 'כיסוי נרחב של התחדשות עירונית, תמ"אות, שוק הנדל"ן.', url: 'https://www.ynet.co.il/real-estate', label: 'ynet.co.il' },
        { tag: 'מנוי', cls: 'paid', title: 'TheMarker — נדל"ן', desc: 'ניתוחים מעמיקים, שמות יזמים, מעקב פרויקטים.', url: 'https://www.themarker.com/realestate', label: 'themarker.com' }
      ]},
      { title: 'כלי AI / MCP לסריקה', items: [
        { tag: 'ב-Cowork', cls: 'free', title: 'Claude in Chrome', desc: 'סוכן שמדפדף עבורך ב-mavat, nadlan, יד2. טוב לסריקה חוזרת.', url: 'https://www.claude.com', label: 'claude.com' },
        { tag: 'רישום חינם', cls: 'free', title: 'data.gov.il / CKAN API', desc: 'לבניית סקריפט שמושך עסקאות חדשות מדי לילה.', url: 'https://data.gov.il/dataset', label: 'data.gov.il' },
        { tag: 'חינם · עברית', cls: 'free', title: 'agentskills.co.il — אינדקס', desc: 'אינדקס מפותח של סקילים ו-MCP בעברית.', url: 'https://agentskills.co.il/he', label: 'agentskills.co.il' }
      ]}
    ];
    let resourcesHtml = '';
    for (const group of resourceGroups) {
      resourcesHtml += `<div style="margin-bottom:24px"><div style="font-size:13px;color:var(--muted);margin-bottom:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">${group.title}</div><div class="resource-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">`;
      for (const item of group.items) {
        const tagCls = item.cls === 'free' ? 'background:rgba(46,229,157,.15);color:var(--good)' : 'background:rgba(255,181,71,.15);color:var(--warn)';
        resourcesHtml += `<div class="resource-card" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;display:flex;flex-direction:column;transition:all .2s">
          <span style="${tagCls};display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;margin-bottom:8px;width:fit-content">${item.tag}</span>
          <h3 style="font-size:17px;margin-bottom:6px">${item.title}</h3>
          <p style="color:var(--muted);font-size:13px;line-height:1.6;margin-bottom:14px;flex:1">${item.desc}</p>
          <a href="${item.url}" target="_blank" style="background:var(--bg-2);border:1px solid var(--border);padding:8px 14px;border-radius:8px;font-size:13px;color:var(--accent);text-decoration:none;font-weight:600;text-align:center;display:block">${item.label} ←</a>
        </div>`;
      }
      resourcesHtml += '</div></div>';
    }

    // ── Assemble all sections ──
    const sections = [
      { id: 'calc', title: 'מחשבון משכנתא', content: calcHtml },
      { id: 'scorer', title: 'ניקוד הזדמנות', content: scoreHtml },
      { id: 'checklist', title: 'צ\'קליסט רכישה', content: checkHtml },
      { id: 'search', title: 'חיפוש דירות', content: searchHtml },
      { id: 'glossary', title: 'מילון מונחים', content: glossaryHtml },
      { id: 'resources', title: 'משאבים', content: resourcesHtml }
    ];

    let html = '<h1 style="font-size:24px;margin-bottom:24px">כלים</h1>';
    for (const s of sections) {
      const isOpen = section === s.id;
      html += `<div class="tools-section${isOpen ? ' open' : ''}" id="tool-${s.id}">
        <button class="tools-header" onclick="App.toggleTool('${s.id}')">
          ${s.title} <span class="chevron">▼</span>
        </button>
        <div class="tools-body">${s.content}</div>
      </div>`;
    }
    main.innerHTML = html;

    // Post-render: run calculator, load checklist, set up glossary expand
    this._calcMortgage();
    this._loadChecklist();
    this._setupGlossaryExpand();

    // Auto-open section from hash
    if (section) {
      const el = document.getElementById('tool-' + section);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // ── Tools Helpers ──────────────────────────────────────────────

  _calcMortgage() {
    const priceEl = document.getElementById('calc-price');
    if (!priceEl) return;
    const price = +priceEl.value || 0;
    const equity = +(document.getElementById('calc-equity')?.value) || 0;
    const status = document.getElementById('calc-status')?.value || 'first';
    const rate = (+(document.getElementById('calc-rate')?.value) || 0) / 100 / 12;
    const years = +(document.getElementById('calc-years')?.value) || 25;
    const months = years * 12;
    const loan = Math.max(0, price - equity);

    let tax = 0;
    if (status === 'first') {
      const brackets = [[2100000, 0], [2500000, .035], [6055000, .05], [20185000, .08], [Infinity, .1]];
      let prev = 0;
      for (const [limit, r] of brackets) {
        if (price <= limit) { tax += (price - prev) * r; break; }
        else { tax += (limit - prev) * r; prev = limit; }
      }
    } else {
      const brackets = [[6055000, .08], [20185000, .1], [Infinity, .12]];
      let prev = 0;
      for (const [limit, r] of brackets) {
        if (price <= limit) { tax += (price - prev) * r; break; }
        else { tax += (limit - prev) * r; prev = limit; }
      }
    }

    const monthly = rate > 0 ? loan * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1) : loan / months;
    const totalInterest = monthly * months - loan;
    const totalCost = price + tax + totalInterest;
    const fmt = n => '\u20AA' + Math.round(n).toLocaleString('he-IL');

    const taxEl = document.getElementById('calc-res-tax');
    if (taxEl) taxEl.textContent = fmt(tax);
    const monthlyEl = document.getElementById('calc-res-monthly');
    if (monthlyEl) monthlyEl.textContent = fmt(monthly) + ' / חודש';
    const loanEl = document.getElementById('calc-res-loan');
    if (loanEl) loanEl.textContent = 'משכנתא של ' + fmt(loan) + ' ל-' + years + ' שנים';
    const totalEl = document.getElementById('calc-res-total');
    if (totalEl) totalEl.textContent = fmt(totalCost);
    const interestEl = document.getElementById('calc-res-interest');
    if (interestEl) interestEl.textContent = 'ריבית מצטברת: ' + fmt(totalInterest);
  },

  _updateScore() {
    const factorNames = ['stage', 'consent', 'developer', 'price', 'location', 'horizon', 'objections'];
    const weights = { stage: 25, consent: 20, developer: 15, price: 15, location: 10, horizon: 10, objections: 5 };
    const verdicts = [
      { min: 85, label: 'הזדמנות מצוינת', color: 'var(--good)', text: 'הגורמים שבדקת מצביעים על עסקה בשלה ורגולטורית בטוחה. עדיין — אמת כל פרט עם עו"ד מקרקעין.' },
      { min: 70, label: 'הזדמנות טובה', color: 'var(--good)', text: 'זה נראה סביר, עם כמה נקודות לסגור. שב עם עו"ד וברר את הפרטים שקיבלו ניקוד נמוך.' },
      { min: 50, label: 'הימור סביר', color: 'var(--warn)', text: 'יש פוטנציאל אבל גם לא מעט סיכון. מתאים רק אם התקציב שלך גמיש והאופק שלך ארוך.' },
      { min: 30, label: 'סיכון גבוה', color: 'var(--warn)', text: 'הרבה דברים עדיין לא ידועים או לא בוגרים. שקול לחכות עוד כמה חודשים ולהעריך שוב.' },
      { min: 0, label: 'לא מומלץ', color: 'var(--bad)', text: 'הניקוד נמוך מדי. הפרויקט רחוק מלהיות בשל, או שהמחיר לא מוצדק. חפש אלטרנטיבה.' }
    ];

    let total = 0, answered = 0;
    for (const f of factorNames) {
      const sel = document.querySelector(`input[name=score_${f}]:checked`);
      if (sel) { total += parseInt(sel.value) * weights[f] / 100; answered++; }
    }

    // Update selected styling
    document.querySelectorAll('#tool-scorer .score-option').forEach(o => {
      o.classList.toggle('selected', !!o.querySelector('input:checked'));
    });

    const ring = document.getElementById('scoreRing');
    const num = document.getElementById('scoreNum');
    const label = document.getElementById('scoreLabel');
    const verdict = document.getElementById('scoreVerdict');
    if (!ring || !num) return;

    if (answered === 0) {
      num.textContent = '—';
      label.textContent = 'בחר תשובות כדי לקבל ניקוד';
      label.style.color = '';
      verdict.textContent = 'הניקוד משקלל 7 גורמים — שלב רגולטורי (25%), רוב דיירים (20%), איכות יזם (15%), מחיר (15%), מיקום (10%), אופק זמן (10%), התנגדויות (5%).';
      ring.style.background = 'conic-gradient(var(--border) 0%,var(--border) 100%)';
      return;
    }

    const rounded = Math.round(total);
    num.textContent = rounded;
    const v = verdicts.find(x => rounded >= x.min);
    label.textContent = v.label;
    label.style.color = v.color;
    verdict.textContent = v.text;
    ring.style.background = `conic-gradient(${v.color} ${rounded}%,var(--border) ${rounded}%)`;
  },

  _onCheckChange() {
    const boxes = document.querySelectorAll('#tool-checklist .check-item input[type=checkbox]');
    const total = boxes.length;
    let done = 0;
    boxes.forEach(cb => {
      const item = cb.closest('.check-item');
      if (cb.checked) { done++; if (item) item.style.background = 'rgba(46,229,157,.05)'; if (item) item.style.borderColor = 'rgba(46,229,157,.3)'; }
      else { if (item) item.style.background = ''; if (item) item.style.borderColor = ''; }
    });
    const pct = Math.round(done / total * 100);
    const numEl = document.getElementById('checkNum');
    if (numEl) numEl.textContent = done;
    const pctEl = document.getElementById('checkPct');
    if (pctEl) pctEl.textContent = pct + '%';
    const fillEl = document.getElementById('checkFill');
    if (fillEl) fillEl.style.width = pct + '%';

    // Save to sessionStorage
    const states = [...boxes].map(cb => cb.checked);
    try { sessionStorage.setItem('pinui_checklist', JSON.stringify(states)); } catch (e) {}
  },

  _loadChecklist() {
    try {
      const saved = sessionStorage.getItem('pinui_checklist');
      if (saved) {
        const states = JSON.parse(saved);
        const boxes = document.querySelectorAll('#tool-checklist .check-item input[type=checkbox]');
        boxes.forEach((cb, idx) => { cb.checked = states[idx] || false; });
        this._onCheckChange();
      }
    } catch (e) {}
  },

  _resetChecklist() {
    document.querySelectorAll('#tool-checklist .check-item input[type=checkbox]').forEach(cb => cb.checked = false);
    this._onCheckChange();
    try { sessionStorage.removeItem('pinui_checklist'); } catch (e) {}
  },

  _selectedHood: '',
  _toggleHoodChip(el, hood) {
    const isSelected = el.classList.contains('selected');
    document.querySelectorAll('#tool-search .hood-chip').forEach(c => c.classList.remove('selected'));
    if (!isSelected) {
      el.classList.add('selected');
      App._selectedHood = hood;
    } else {
      App._selectedHood = '';
    }
  },

  _buildSearch() {
    const hood = App._selectedHood || '';
    const rooms = document.getElementById('search-rooms')?.value || '';
    const maxPrice = document.getElementById('search-max-price')?.value || '';

    // Use first selected city
    const citySlug = this.state.cities[0] || Object.keys(CITIES)[0];
    const city = CITIES[citySlug];
    if (!city) return;

    const links = buildSearchLinks(city, { hood, rooms, maxPrice });
    const resultsEl = document.getElementById('search-results');
    if (resultsEl) {
      resultsEl.innerHTML = '<div class="search-row" style="display:flex;flex-wrap:wrap;gap:12px">' + renderSearchButtons(links) + '</div>';
    }
  },

  _setupGlossaryExpand() {
    document.querySelectorAll('#tool-glossary .glossary-term').forEach(term => {
      term.addEventListener('click', function () {
        const body = this.querySelector('.glossary-body');
        if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
      });
    });
  }
};

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
