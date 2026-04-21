/* ═══════════════════════════════════════════════════════════════════
   Pinui-Binui Radar — App Controller (SPA Router + Views)
   ═══════════════════════════════════════════════════════════════════ */

// ── Top-level data constants (used across multiple views) ────────

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

const resourceGroups = [
  { title: 'תוכניות ורגולציה', items: [
    { tag: 'חינם · רשמי', cls: 'free', title: 'מבא"ת', desc: 'חיפוש תוכניות לפי כתובת/גוש/חלקה', url: 'https://mavat.iplan.gov.il', label: 'mavat.iplan.gov.il' },
    { tag: 'חינם · רשמי', cls: 'free', title: 'הרשות להתחדשות', desc: 'מתחמים מוכרזים, הטבות מס', url: 'https://www.gov.il/he/departments/government_authority_for_urban_renewal', label: 'gov.il/urban-renewal' },
    { tag: 'חינם · רשמי', cls: 'free', title: 'מינהל התכנון', desc: 'מדיניות, תמ"אות, תוכניות ארציות', url: 'https://www.gov.il/he/departments/ministry_of_interior_planning_administration', label: 'gov.il/planning' }
  ]},
  { title: 'עסקאות ושווי', items: [
    { tag: 'חינם · רשמי', cls: 'free', title: 'nadlan.gov.il', desc: 'עסקאות אמת מרשות המיסים', url: 'https://www.nadlan.gov.il', label: 'nadlan.gov.il' },
    { tag: 'חלקי חינם', cls: 'paid', title: 'Madlan', desc: 'מפות מחירים + דירות למכירה', url: 'https://www.madlan.co.il', label: 'madlan.co.il' },
    { tag: 'חלקי חינם', cls: 'paid', title: 'Yad2', desc: 'הלוח הגדול בישראל', url: 'https://www.yad2.co.il/realestate', label: 'yad2.co.il' },
    { tag: 'חינם · API', cls: 'free', title: 'data.gov.il', desc: 'גישה פרוגרמטית לנתונים', url: 'https://data.gov.il/dataset', label: 'data.gov.il' }
  ]},
  { title: 'מסמכים משפטיים', items: [
    { tag: '~15 ש"ח', cls: 'paid', title: 'טאבו אונליין', desc: 'נסח טאבו תוך דקות', url: 'https://www.gov.il/he/departments/general/real_estate_registration', label: 'טאבו אונליין' },
    { tag: 'חינם · רשמי', cls: 'free', title: 'חוק פינוי-בינוי', desc: 'נוסח מלא כולל סעיף 23', url: 'https://www.nevo.co.il', label: 'nevo.co.il' },
    { tag: 'חינם', cls: 'free', title: 'פסקי דין', desc: 'מאגר פסקי דין סרבנים', url: 'https://www.takdin.co.il', label: 'takdin.co.il' }
  ]},
  { title: 'מיסוי', items: [
    { tag: 'חינם · רשמי', cls: 'free', title: 'מחשבון מס רכישה', desc: 'המחשבון הרשמי', url: 'https://www.gov.il/he/service/purchase-tax-calculator', label: 'gov.il/purchase-tax' },
    { tag: 'חינם · רשמי', cls: 'free', title: 'מס שבח', desc: 'פטורים, חישוב, טפסים', url: 'https://www.gov.il/he/departments/topics/real_estate_taxes', label: 'gov.il/real-estate-taxes' }
  ]},
  { title: 'חדשות', items: [
    { tag: 'מנוי', cls: 'paid', title: 'גלובס', desc: 'חדשות נדל"ן עסקי', url: 'https://www.globes.co.il/news/RealEstate.aspx', label: 'globes.co.il' },
    { tag: 'חינם', cls: 'free', title: 'ynet נדל"ן', desc: 'כיסוי התחדשות עירונית', url: 'https://www.ynet.co.il/real-estate', label: 'ynet.co.il' },
    { tag: 'מנוי', cls: 'paid', title: 'TheMarker', desc: 'ניתוחים מעמיקים', url: 'https://www.themarker.com/realestate', label: 'themarker.com' }
  ]},
  { title: 'AI / MCP', items: [
    { tag: 'ב-Cowork', cls: 'free', title: 'Claude in Chrome', desc: 'סוכן סריקה אוטומטי', url: 'https://www.claude.com', label: 'claude.com' },
    { tag: 'חינם', cls: 'free', title: 'data.gov.il API', desc: 'סקריפט עסקאות לילי', url: 'https://data.gov.il/dataset', label: 'data.gov.il' },
    { tag: 'חינם · עברית', cls: 'free', title: 'agentskills.co.il', desc: 'אינדקס MCP בעברית', url: 'https://agentskills.co.il/he', label: 'agentskills.co.il' }
  ]}
];

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
    dealsSortCol: 'ratio',
    dealsSortAsc: true,
    search: '',
    viewMode: 'table', // 'table' or 'map'
    toolsOpen: {}
  },

  // Per-zone checklist tracking
  _currentChecklistZone: null,

  // ── Routing ────────────────────────────────────────────────────
  parseHash() {
    const h = location.hash.slice(1) || 'dashboard';
    const [path, query] = h.split('?');
    
    // Parse params if they exist (e.g. ?b=3000000&c=givatayim)
    if (query) {
      const params = new URLSearchParams(query);
      if (params.has('b')) this.state.budget = parseInt(params.get('b'));
      if (params.has('c')) this.state.cities = params.get('c').split(',').filter(Boolean);
      if (params.has('s')) this.state.statuses = params.get('s').split(',').filter(Boolean);
    }

    if (path.startsWith('zone/')) return { view: 'zone', zoneId: path.slice(5) };
    if (path === 'deals') return { view: 'deals' };
    // Redirect old tools routes to dashboard
    if (path === 'tools' || path.startsWith('tools/')) return { view: 'dashboard' };
    return { view: 'dashboard' };
  },

  updateURL() {
    const s = this.state;
    let url = '#' + s.view;
    if (s.view === 'zone') url = '#zone/' + s.zoneId;
    
    const params = new URLSearchParams();
    if (s.budget !== 3000000) params.set('b', s.budget);
    if (s.cities.length < 3) params.set('c', s.cities.join(','));
    if (s.statuses.length < 3) params.set('s', s.statuses.join(','));
    
    const pStr = params.toString();
    location.hash = pStr ? url + '?' + pStr : url;
  },

  navigate(view, params) {
    this.state.view = view;
    if (view === 'zone') this.state.zoneId = params;
    this.updateURL();
  },

  // ── Persistence ────────────────────────────────────────────────
  saveBudget() { 
    localStorage.setItem('pinui_budget', this.state.budget);
    this.updateURL();
  },
  saveCities() { 
    localStorage.setItem('pinui_cities', JSON.stringify(this.state.cities));
    this.updateURL();
  },
  saveStatuses() { 
    localStorage.setItem('pinui_statuses', JSON.stringify(this.state.statuses));
    this.updateURL();
  },

  // ── Filters ────────────────────────────────────────────────────
  getFilteredZones() {
    const s = this.state;
    const q = (s.search || '').toLowerCase();
    return getAllZonesFlat().filter(z =>
      (s.cities.length === 0 || s.cities.includes(z.citySlug)) &&
      (s.statuses.length === 0 || s.statuses.includes(z.status)) &&
      (!s.budget || z.entryPriceMin <= s.budget) &&
      (!q || (z.zone + z.address + z.city).toLowerCase().includes(q))
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

  resetFilters() {
    localStorage.removeItem('pinui_budget');
    localStorage.removeItem('pinui_cities');
    localStorage.removeItem('pinui_statuses');
    location.reload();
  },

  _filterZoneList(query) {
    this.state.search = query;
    const q = query.trim().toLowerCase();
    
    // Filter sidebar items (immediate DOM update for speed)
    const items = document.querySelectorAll('.sb-zone-item');
    const groups = document.querySelectorAll('.sb-city-group');
    for (const item of items) {
      const name = (item.getAttribute('data-zone-name') || '').toLowerCase();
      item.style.display = (!q || name.includes(q)) ? '' : 'none';
    }
    for (const g of groups) {
      const visible = g.querySelectorAll('.sb-zone-item:not([style*="display: none"])');
      g.style.display = visible.length ? '' : 'none';
    }

    // Filter main content (throttled re-render if needed, but for small data direct is fine)
    if (this.state.view === 'deals') this.renderDeals();
    else this.renderDashboard();
  },

  scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  sortBy(col) {
    if (this.state.sortCol === col) this.state.sortAsc = !this.state.sortAsc;
    else { this.state.sortCol = col; this.state.sortAsc = false; }
    this.renderDashboard();
  },

  sortDealsBy(col) {
    if (this.state.dealsSortCol === col) this.state.dealsSortAsc = !this.state.dealsSortAsc;
    else { this.state.dealsSortCol = col; this.state.dealsSortAsc = true; }
    this.renderDeals();
  },

  toggleViewMode(mode) {
    this.state.viewMode = mode;
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
      else if (parsed.view === 'deals') this.renderDeals();
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

    // Logo & Freshness
    let html = '<div class="sb-logo-container" style="display:flex; justify-content:space-between; align-items:center; padding:0 8px 16px 0">';
    html += '<div class="sb-logo"><span>⬡</span><span>התחדשות.AI</span></div>';
    
    if (_listingsCache && _listingsCache._meta) {
      const date = _listingsCache._meta.updated || '';
      html += `<div title="נתונים נכונים ליום: ${date}" style="display:flex; align-items:center; gap:4px; font-size:10px; color:var(--good); background:rgba(46,229,157,0.1); padding:2px 6px; border-radius:12px; border:1px solid rgba(46,229,157,0.2)">
        <span style="width:5px; height:5px; border-radius:50%; background:var(--good); display:inline-block"></span>
        מעודכן
      </div>`;
    }
    html += '</div>';

    // Global Search
    html += `<div style="margin-bottom:20px; position:relative">
      <input type="text" class="sb-input" placeholder="חפש רחוב, פרויקט או יזם..." 
        style="padding-right:32px"
        value="${this.state.search || ''}"
        oninput="App._filterZoneList(this.value)">
      <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); opacity:0.5">🔍</span>
    </div>`;

    // Nav — 3 items now
    const navItems = [
      { view: 'dashboard', icon: '⊞', label: 'סקירה' },
      { view: 'zone',      icon: '◎', label: 'מתחמים' },
      { view: 'deals',     icon: '🔍', label: 'מציאות' }
    ];
    html += '<nav class="sb-nav">';
    for (const n of navItems) {
      const active = (v === n.view || (n.view === 'zone' && v === 'zone')) ? ' active' : '';
      const href = n.view === 'zone' ? '#zone/' + (this.state.zoneId || getAllZonesFlat()[0].zoneId) : '#' + n.view;
      html += `<a href="${href}" class="sb-nav-item${active}"><span>${n.icon}</span><span>${n.label}</span></a>`;
    }
    html += '</nav>';

    // Filters — dashboard and deals
    if (v === 'dashboard' || v === 'deals') {
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
        html += `<button class="sb-chip${on}" onclick="App.toggleStatus('${key}')">${label}</button>`;
      }
      html += '</div>';

      // Reset button
      html += '<button class="sb-chip" style="margin-top:20px; width:100%; border-style:dashed; opacity:0.8" onclick="App.resetFilters()">🔄 איפוס הגדרות</button>';
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

    // Glossary search
    html += '<div class="sb-section-label">מונחים</div>';
    html += '<input class="sb-input" placeholder="חפש מונח..." oninput="App._searchGlossary(this.value)">';
    html += '<div id="sb-glossary-result" style="font-size:10px;color:var(--muted);margin-top:4px;line-height:1.5"></div>';

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

  // ── Glossary search ────────────────────────────────────────────
  _searchGlossary(query) {
    const el = document.getElementById('sb-glossary-result');
    if (!el) return;
    const q = query.trim().toLowerCase();
    if (!q) { el.innerHTML = ''; return; }
    const matches = glossaryTerms.filter(t =>
      t.term.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
    if (!matches.length) {
      el.innerHTML = '<span style="color:var(--muted)">לא נמצא</span>';
      return;
    }
    el.innerHTML = matches.slice(0, 3).map(t =>
      `<div style="margin-bottom:6px"><strong style="color:var(--accent)">${t.term}</strong><br>${t.desc.slice(0, 120)}${t.desc.length > 120 ? '...' : ''}</div>`
    ).join('');
  },

  // ═══════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  renderDashboard() {
    document.title = 'סקירה · התחדשות.AI';
    const main = document.getElementById('main');
    const zones = this.getFilteredZones();

    // ── KPI Row ──
    const inBudget = zones.length;
    const scored = zones.filter(z => z.valueScore != null).sort((a, b) => b.valueScore - a.valueScore);
    const topScore = scored.length ? scored[0] : null;
    const avgPpsqm = this._calcAvgPpsqm(zones);
    const deals = this._countDeals();

    let html = '<div class="kpi-row">';
    html += this._kpi('מתחמים בתקציב', inBudget, `מתוך ${getAllZonesFlat().length} מתחמים`, 'kpi-cyan', '🏢', `App.scrollToSection('zone-table')`);
    html += this._kpi('ציון ערך מוביל', topScore ? topScore.valueScore.toFixed(1) : '-', topScore ? topScore.zone : '', 'kpi-gold', '⭐', topScore ? `App.navigate('zone','${topScore.zoneId}')` : '');
    html += this._kpi('ממוצע ₪/מ"ר', avgPpsqm ? '₪' + Math.round(avgPpsqm / 1000) + 'K' : '-', 'ממוצע מתחמים מסוננים', 'kpi-amber', '📊', `App.scrollToSection('zone-table')`);
    html += this._kpi('מציאות', deals, 'מחיר < 92% ממוצע מתחם', 'kpi-emerald', '✨', `App.navigate('deals')`);
    html += '</div>';

    // ── View Mode Switcher ──
    html += `<div style="display:flex; justify-content:flex-start; margin-bottom:20px; background:rgba(255,255,255,0.03); padding:4px; border-radius:12px; width:fit-content; border:1px solid var(--border)">
      <button class="sb-chip${this.state.viewMode==='table'?' on':''}" 
        style="margin:0; border-radius:8px; padding:8px 16px; font-size:13px; min-width:100px; border:0" 
        onclick="App.toggleViewMode('table')">▦ טבלה</button>
      <button class="sb-chip${this.state.viewMode==='map'?' on':''}" 
        style="margin:0; border-radius:8px; padding:8px 16px; font-size:13px; min-width:100px; border:0" 
        onclick="App.toggleViewMode('map')">🗺️ מפה</button>
    </div>`;

    const sorted = this._sortZones(zones);

    if (this.state.viewMode === 'map') {
      html += '<div class="map-layout">';
      // Right sidebar list (RTL)
      html += '<div class="map-list" id="map-zone-list">';
      sorted.forEach(z => {
        html += `<div class="map-list-item" id="map-item-${z.zoneId}" onclick="App.focusZoneOnMap('${z.zoneId}')">
          <div class="map-list-title">${z.zone}</div>
          <div class="map-list-meta">${z.city} · ${z.statusLabel} · ${z.priceLabel}</div>
        </div>`;
      });
      html += '</div>';
      // Left map canvas
      html += '<div class="map-canvas" id="map-container">';
      html += '<div id="map" style="width:100%; height:100%"></div>';
      html += '</div></div>';
      
      // Initialize map after render
      setTimeout(() => this._initLeafletMap(zones), 100);
    } else {
      // ── Ranked Table ──
      html += '<div class="data-panel" id="zone-table">';
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
      { key: 'score', label: 'ציון', tooltip: 'פוטנציאל רווח שנתי מתואם סיכון: (פרמיה / שנים) × סיכון' }
    ];
    for (const c of cols) {
      const isSorted = this.state.sortCol === c.key;
      const arrow = isSorted ? (this.state.sortAsc ? '▲' : '▼') : '▽';
      const cls = isSorted ? ' class="sorted"' : '';
      const tip = c.tooltip ? ` title="${c.tooltip}" style="cursor:help; border-bottom:1px dotted var(--muted)"` : '';
      html += `<th${cls} onclick="App.sortBy('${c.key}')"><span${tip}>${c.label}</span><span class="arrow">${arrow}</span></th>`;
    }
    html += '</tr></thead><tbody>';

    sorted.forEach((z, i) => {
      const statusCls = { yes: 'badge-good', maybe: 'badge-warn', no: 'badge-bad' }[z.status] || 'badge-neutral';
      const statusLabel = { yes: 'לקנות', maybe: 'לעקוב', no: 'לחכות' }[z.status] || z.status;
      const scoreCls = z.valueScore != null ? (z.valueScore >= 3 ? 'badge-good' : z.valueScore >= 1.5 ? 'badge-accent' : 'badge-neutral') : 'badge-neutral';
      const displayAddress = z.address || (z.zone.includes(z.hood) ? z.zone : `שכונת ${z.hood}`);

      html += `<tr onclick="App.navigate('zone','${z.zoneId}')">`;
      html += `<td class="rank">${i + 1}</td>`;
      html += `<td class="zone-name">${z.zone}</td>`;
      html += `<td class="address-col">${displayAddress}</td>`;
      html += `<td class="city-name">${z.cityName}</td>`;
      html += `<td>${z.priceLabel}</td>`;
      html += `<td>${z.premiumLabel}</td>`;
      html += `<td>${z.timelineLabel}</td>`;
      html += `<td><span class="badge ${statusCls}">${statusLabel}</span></td>`;
      html += `<td><span class="badge ${scoreCls}">${z.valueScore != null ? z.valueScore.toFixed(1) : '-'}</span></td>`;
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    }

    // ── Bottom Grid ──
    html += '<div class="bottom-grid">';

    // Left: Fresh deals
    html += '<div class="data-panel" id="deals-section"><div class="panel-header"><span class="panel-title">מציאות טריות</span></div>';
    html += '<div class="listings-grid">';
    const freshDeals = this._getFreshDeals();
    if (freshDeals.length) {
      for (const d of freshDeals) html += d.html;
    } else {
      html += '<p style="color:var(--muted);font-size:11px">אין מציאות כרגע</p>';
    }
    html += '</div></div>';

    // Right: Timeline mini-gantt
    html += '<div class="data-panel"><div class="panel-header"><span class="panel-title">ציר זמן (שנים)</span></div>';
    html += '<div style="position:relative; padding-bottom:10px">';
    const maxYears = 15;
    for (const z of sorted) {
      if (!z.timelineMidYears) continue;
      const lo = Math.max(0, z.timelineMidYears - 2);
      const hi = z.timelineMidYears + 2;
      const left = (lo / maxYears * 100).toFixed(1);
      const width = (Math.min((hi - lo) / maxYears * 100, 100 - parseFloat(left))).toFixed(1);
      const color = { yes: 'var(--good)', maybe: 'var(--warn)', no: 'var(--bad)' }[z.status] || 'var(--muted)';
      const barLabel = `${z.timelineMidYears}±2`;
      
      html += `<div class="timeline-bar-row" style="margin-bottom:12px">
        <div class="timeline-bar-label" title="${z.zone}">${z.zone.length > 12 ? z.zone.slice(0, 12) + '…' : z.zone}</div>
        <div class="timeline-bar-track" style="position:relative; background:rgba(255,255,255,0.03)">
          <!-- Vertical grid lines for 5 and 10 years -->
          <div style="position:absolute; left:33.3%; top:0; bottom:0; border-left:1px solid rgba(255,255,255,0.05); z-index:0"></div>
          <div style="position:absolute; left:66.6%; top:0; bottom:0; border-left:1px solid rgba(255,255,255,0.05); z-index:0"></div>
          
          <div class="timeline-bar-fill" style="right:${left}%; width:${width}%; background:${color}; display:flex; align-items:center; justify-content:center; font-size:9px; color:#000; font-weight:800; border-radius:4px; min-width:24px; z-index:1">
            ${barLabel}
          </div>
        </div>
      </div>`;
    }
    html += `<div class="timeline-axis" style="margin-top:8px"><span>0</span><span>5</span><span>10</span><span>15 שנים</span></div>`;
    html += '</div></div>';

    html += '</div>'; // close bottom-grid

    // ── Resources Footer ──
    html += '<div class="data-panel" style="margin-top:24px"><div class="panel-header"><span class="panel-title">משאבים שימושיים</span></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;padding:4px 0">';
    for (const group of resourceGroups) {
      html += `<div>`;
      html += `<div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">${group.title}</div>`;
      html += `<div style="display:flex;flex-wrap:wrap;gap:6px">`;
      for (const item of group.items) {
        const tagColor = item.cls === 'free' ? 'var(--good)' : 'var(--warn)';
        html += `<a href="${item.url}" target="_blank" class="resource-chip" style="display:inline-flex;align-items:center;gap:4px;background:var(--card);border:1px solid var(--border);padding:4px 10px;border-radius:8px;font-size:11px;color:var(--text);text-decoration:none;transition:all .15s;white-space:nowrap" title="${item.desc}">`;
        html += `<span style="width:6px;height:6px;border-radius:50%;background:${tagColor};flex-shrink:0"></span>`;
        html += `${item.title}`;
        html += `</a>`;
      }
      html += `</div></div>`;
    }
    html += '</div></div>';

    main.innerHTML = html;
  },

  // ── Dashboard Helpers ──
  _kpi(label, value, sub, theme, icon, onclick) {
    const clickAttr = onclick ? ` onclick="${onclick}"` : '';
    const hoverCls = onclick ? ' kpi-clickable' : '';
    return `<div class="kpi ${theme}${hoverCls}"${clickAttr}>
      <div class="kpi-icon">${icon}</div>
      <div class="kpi-content">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        <div class="kpi-sub">${sub}</div>
      </div>
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
    const s = this.state;
    let count = 0;
    console.log("[Debug] _countDeals starting. Listings zones:", Object.keys(_listingsCache.byZone).length);
    for (const [zoneId, listings] of Object.entries(_listingsCache.byZone)) {
      const zone = this._findZoneData(zoneId);
      if (!zone) continue;
      
      // Filter by city only for deals
      if (s.cities.length > 0 && !s.cities.includes(zone.citySlug)) continue;

      const avgPpsqm = parsePpsqmRange(zone.prices.rows);
      if (!avgPpsqm) {
        console.log(`[Debug] Zone ${zoneId} avgPpsqm is null. Rows:`, JSON.stringify(zone.prices.rows));
        continue;
      }
      for (const l of listings) {
        const sqm = parseInt(l.sqm) || 0;
        const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;

        if (s.budget && price > s.budget) continue;

        if (sqm > 0 && price > 0) {
          const ppsqm = price / sqm;
          const ratio = ppsqm / avgPpsqm;
          if (ratio < 0.92) count++;
        }
      }
    }
    console.log("[Debug] _countDeals finished. Found:", count);
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
            const score = computeValueScore(zone);
            deals.push({ html: formatListingCard(l, avgPpsqm, score, zone), ppsqmRatio: ppsqm / avgPpsqm });
          }
        }
      }
    }
    deals.sort((a, b) => a.ppsqmRatio - b.ppsqmRatio);
    return deals.slice(0, 24);
  },

  // ═══════════════════════════════════════════════════════════════
  //  DEALS (FINDINGS)
  // ═══════════════════════════════════════════════════════════════
  renderDeals() {
    document.title = 'מציאות · התחדשות.AI';
    const main = document.getElementById('main');
    const filteredDeals = this._getFilteredDeals();
    const s = this.state;

    let html = '<div class="deals-header" style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap">';
    html += '<div><h1 style="font-size:24px;font-weight:800;margin-bottom:4px">מציאות נדל״ן</h1>';
    html += `<p style="color:var(--muted);font-size:14px">מצאנו ${filteredDeals.length} מציאות שעונות על הסינון שלך (מחיר למ״ר נמוך מ-92% מממוצע המתחם)</p></div>`;
    
    // Sort Select
    html += '<div style="display:flex; align-items:center; gap:8px">';
    html += '<span style="font-size:12px; color:var(--muted)">מיין לפי:</span>';
    html += `<select class="sb-input" style="width:140px; margin:0" onchange="App.sortDealsBy(this.value)">
      <option value="ratio" ${s.dealsSortCol==='ratio'?'selected':''}>הדיל הטוב ביותר</option>
      <option value="price" ${s.dealsSortCol==='price'?'selected':''}>המחיר הנמוך ביותר</option>
      <option value="sqm" ${s.dealsSortCol==='sqm'?'selected':''}>השטח הגדול ביותר</option>
    </select></div>`;
    html += '</div>';

    if (filteredDeals.length === 0) {
      html += '<div class="data-panel" style="padding:48px;text-align:center;color:var(--muted)">';
      html += '<div style="font-size:48px;margin-bottom:16px">🔍</div>';
      html += '<div>לא נמצאו מציאות שתואמות את התקציב או הערים שבחרת.</div>';
      html += '</div>';
    } else {
      html += '<div class="listings-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">';
      for (const d of filteredDeals) {
        html += d.html;
      }
      html += '</div>';
    }

    main.innerHTML = html;
  },

  _getFilteredDeals() {
    if (!_listingsCache || !_listingsCache.byZone) return [];
    const s = this.state;
    const deals = [];
    
    for (const [zoneId, listings] of Object.entries(_listingsCache.byZone)) {
      const zoneData = this._findZoneData(zoneId);
      if (!zoneData) continue;

      // Filter by city
      if (s.cities.length > 0 && !s.cities.includes(zoneData.citySlug)) continue;

      const avgPpsqm = parsePpsqmRange(zoneData.prices.rows);
      if (!avgPpsqm) continue;

      for (const l of listings) {
        const sqm = parseInt(l.sqm) || 0;
        const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;

        // Filter by budget
        if (s.budget && price > s.budget) continue;

        if (sqm > 0 && price > 0) {
          const ppsqm = price / sqm;
          if (ppsqm / avgPpsqm < 0.92) {
            const score = computeValueScore(zoneData);
            deals.push({ 
              html: formatListingCard(l, avgPpsqm, score, zoneData), 
              ppsqmRatio: ppsqm / avgPpsqm,
              price: price,
              sqm: sqm
            });
          }
        }
      }
    }

    // Sort based on state
    deals.sort((a, b) => {
      let va, vb;
      if (s.dealsSortCol === 'ratio') { va = a.ppsqmRatio; vb = b.ppsqmRatio; }
      else if (s.dealsSortCol === 'price') { va = a.price; vb = b.price; }
      else if (s.dealsSortCol === 'sqm') { va = b.sqm; vb = a.sqm; } // Default desc for sqm
      
      return s.dealsSortAsc ? va - vb : vb - va;
    });
    
    return deals;
  },

  _findZoneData(zoneId) {
    for (const [slug, city] of Object.entries(CITIES)) {
      const z = city.zones.find(cz => cz.id === zoneId);
      if (z) return { ...z, citySlug: slug, cityName: city.name };
    }
    return null;
  },

  _findZoneCity(zoneId) {
    for (const [, city] of Object.entries(CITIES)) {
      if (city.zones.find(cz => cz.id === zoneId)) return city;
    }
    return null;
  },

  // ── Map View Helpers ───────────────────────────────────────────
  _map: null,
  _markers: {},
  _initLeafletMap(zones) {
    // Load Leaflet CSS & JS dynamically if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => this._createMap(zones);
      document.head.appendChild(script);
    } else {
      this._createMap(zones);
    }
  },

  _createMap(zones) {
    if (this._map) this._map.remove();
    this._markers = {};
    
    // Default to center of the 3-city cluster
    this._map = L.map('map', { zoomControl: false }).setView([32.072, 34.808], 14);
    L.control.zoom({ position: 'bottomright' }).addTo(this._map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this._map);

    // Precise neighborhood center points
    const neighborhoodCoords = {
      'סיטי': [32.0835, 34.8005], 'הסתדרות': [32.0720, 34.8145], 'יבנאלי': [32.0675, 34.8175],
      'גבעת רמב"ם': [32.0745, 34.8045], 'בן גוריון': [32.0755, 34.8185], 'מזרח גבעתיים': [32.0685, 34.8225],
      'ארלוזורוב': [32.0780, 34.8105], 'בורוכוב': [32.0825, 34.8075], 'שינקין': [32.0655, 34.8115],
      'ראשונים': [32.0865, 34.8025], 'ירושלים': [32.0775, 34.8235], 'הגפן': [32.0915, 34.8145],
      'עמידר': [32.0525, 34.8275], 'רמת חן': [32.0485, 34.8175], 'קריניצי': [32.0455, 34.8215],
      'נחלת גנים': [32.0885, 34.8085], 'כפר שלם': [32.0465, 34.7945], 'יפו': [32.0425, 34.7545],
      'שפירא': [32.0505, 34.7745], 'קרית שלום': [32.0435, 34.7775], 'יד אליהו': [32.0595, 34.7925],
      'רמת אביב': [32.1145, 34.7945], 'נווה שרת': [32.1195, 34.8245]
    };

    const hoodCounts = {};

    zones.forEach(z => {
      const base = neighborhoodCoords[z.hood] || [32.072, 34.812];
      hoodCounts[z.hood] = (hoodCounts[z.hood] || 0) + 1;
      const count = hoodCounts[z.hood];
      const angle = count * 0.8;
      const radius = count * 0.0006;
      const lat = base[0] + Math.cos(angle) * radius;
      const lng = base[1] + Math.sin(angle) * radius;
      
      const color = { yes: 'var(--good)', maybe: 'var(--warn)', no: 'var(--bad)' }[z.status] || 'var(--muted)';
      const marker = L.circleMarker([lat, lng], {
        radius: 8, fillColor: color, color: '#fff', weight: 1, fillOpacity: 0.8
      }).addTo(this._map);

      this._markers[z.zoneId] = marker;

      marker.bindPopup(`
        <div style="direction:rtl; text-align:right; font-family:'Heebo'; min-width:140px">
          <strong style="color:var(--accent); font-size:13px">${z.zone}</strong><br>
          <span style="font-size:11px">${z.city} · ${z.statusLabel}</span><br>
          <div style="margin:4px 0; font-size:11px; color:var(--muted)">${z.priceLabel}</div>
          <button onclick="App.navigate('zone','${z.zoneId}')" style="width:100%; margin-top:6px; background:var(--accent); color:#000; border:0; border-radius:4px; padding:6px; cursor:pointer; font-size:11px; font-weight:800">לצפייה בפרטים</button>
        </div>
      `);

      marker.on('click', () => this.focusZoneOnMap(z.zoneId, true));
    });
  },

  focusZoneOnMap(zoneId, fromMarker) {
    const marker = this._markers[zoneId];
    if (!marker) return;

    // Highlight in list
    document.querySelectorAll('.map-list-item').forEach(el => el.classList.remove('active'));
    const item = document.getElementById(`map-item-${zoneId}`);
    if (item) {
      item.classList.add('active');
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (!fromMarker) {
      this._map.setView(marker.getLatLng(), 16);
      marker.openPopup();
    }
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
        case 'city':     va = a.cityName; vb = b.cityName; break;
        case 'price':    va = a.entryPriceMin; vb = b.entryPriceMin; break;        case 'premium':  va = a.premiumMid; vb = b.premiumMid; break;
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
    document.title = 'מתחם · התחדשות.AI';
    const main = document.getElementById('main');
    const zone = this._findZoneData(zoneId);
    const city = this._findZoneCity(zoneId);

    if (!zone || !city) {
      main.innerHTML = '<p style="color:var(--muted)">מתחם לא נמצא</p>';
      return;
    }

    // Set current checklist zone for persistence
    this._currentChecklistZone = zoneId;

    document.title = zone.name + ' · התחדשות.AI';

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
    
    // Progress Bar
    const stages = [
      { label: 'תכנון', keywords: ['תכנון', 'אב', 'הכנה'] },
      { label: 'הפקדה', keywords: ['הפקדה', 'מחוזית'] },
      { label: 'אישור', keywords: ['אישור', 'אושרה', 'תב"ע'] },
      { label: 'היתר', keywords: ['היתר', 'היתרים'] },
      { label: 'ביצוע', keywords: ['הריסה', 'בביצוע', 'בנייה'] },
      { label: 'סיום', keywords: ['סיום', 'אכלוס', 'הושלם'] }
    ];
    
    // Simple heuristic to find current stage
    let currentIdx = 0;
    const factText = JSON.stringify(zone.facts) + zone.sub + zone.desc;
    stages.forEach((s, idx) => {
      if (s.keywords.some(k => factText.includes(k))) currentIdx = idx;
    });
    // Status 'yes' usually means approved or better
    if (zone.status === 'yes' && currentIdx < 2) currentIdx = 2;

    html += '<div style="margin:20px 0 24px">';
    html += '<div style="display:flex; justify-content:space-between; margin-bottom:8px">';
    stages.forEach((s, idx) => {
      const isPast = idx <= currentIdx;
      const color = isPast ? 'var(--accent)' : 'var(--border-hi)';
      const opacity = isPast ? '1' : '0.4';
      html += `<div style="flex:1; text-align:center; font-size:10px; font-weight:700; color:${color}; opacity:${opacity}">${s.label}</div>`;
    });
    html += '</div>';
    html += '<div style="display:flex; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; gap:4px">';
    stages.forEach((s, idx) => {
      const isPast = idx <= currentIdx;
      const color = isPast ? 'var(--accent)' : 'transparent';
      html += `<div style="flex:1; background:${color}; border-radius:3px; transition:all 0.3s"></div>`;
    });
    html += '</div></div>';
    
    html += '</div>';

    // KPI chips from prices.rows
    html += '<div style="font-size:11px; color:var(--muted); font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px">📊 ניתוח מחירים</div>';
    html += '<div class="zone-kpis">';
    for (const row of zone.prices.rows) {
      const isPremium = row[0].includes('פרמיה');
      const theme = isPremium ? 'style="border-color:var(--good); background:rgba(52,211,153,0.03)"' : 'style="border-color:rgba(6,182,212,0.3)"';
      const labelIcon = isPremium ? '📈 ' : '💰 ';
      const valColor = isPremium ? 'color:var(--good)' : '';
      html += `<div class="zone-kpi" ${theme}>
        <div class="zone-kpi-label">${labelIcon}${row[0]}</div>
        <div class="zone-kpi-value" style="${valColor}">${row[1]}</div>
      </div>`;
    }
    html += '</div>';

    // Facts
    html += '<div style="font-size:11px; color:var(--muted); font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px">🏗 פרטי הפרויקט</div>';
    html += '<div class="zone-kpis">';
    for (const fact of zone.facts) {
      const isTimeline = fact[0].includes('אופק') || fact[0].includes('זמן');
      const isUnits = fact[0].includes('יחידות') || fact[0].includes('דירות');
      const theme = isTimeline ? 'style="border-color:var(--warn); background:rgba(251,191,36,0.03)"' : (isUnits ? 'style="border-color:var(--accent)"' : '');
      const labelIcon = isTimeline ? '⏳ ' : (isUnits ? '🏢 ' : '📝 ');
      html += `<div class="zone-kpi" ${theme}>
        <div class="zone-kpi-label">${labelIcon}${fact[0]}</div>
        <div class="zone-kpi-value">${fact[1]}</div>
      </div>`;
    }
    html += '</div>';

    // Investment Radar Section
    if (zone.iplan || zone.riskAnalysis) {
      html += '<div style="font-size:11px; color:var(--muted); font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px">🔍 מכ"ם השקעה (Intelligence)</div>';
      html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px">';
      
      // Planning Intelligence
      if (zone.iplan) {
        html += `<div class="data-panel" style="margin:0; padding:12px; border-left:3px solid var(--accent)">
          <div style="font-size:10px; color:var(--accent); font-weight:800; margin-bottom:6px">סטטוס תכנוני (i-plan)</div>
          <div style="font-size:12px; font-weight:700; margin-bottom:4px">תוכנית: ${zone.iplan.planNum}</div>
          <div style="font-size:11px; margin-bottom:2px">שלב: <strong>${zone.iplan.stage}</strong></div>
          <div style="font-size:11px; color:var(--faint)">פרוטוקול אחרון: ${zone.iplan.lastProtocol}</div>
          <div style="font-size:11px; margin-top:6px; font-style:italic; line-height:1.4">${zone.iplan.details}</div>
        </div>`;
      }
      
      // Risk & Legal
      if (zone.riskAnalysis) {
        const riskColor = zone.riskAnalysis.legalFlags.includes('גבוה') ? 'var(--bad)' : 'var(--good)';
        html += `<div class="data-panel" style="margin:0; padding:12px; border-left:3px solid ${riskColor}">
          <div style="font-size:10px; color:${riskColor}; font-weight:800; margin-bottom:6px">ניתוח סיכונים ומשפטי</div>
          <div style="font-size:12px; font-weight:700; margin-bottom:4px">דירוג יזם: טייר ${zone.riskAnalysis.developerTier}</div>
          <div style="font-size:11px; margin-bottom:2px">דגלים משפטיים: <span style="color:${riskColor}">${zone.riskAnalysis.legalFlags}</span></div>
          <div style="font-size:11px">מצב דיירים: ${zone.riskAnalysis.tenantStatus}</div>
        </div>`;
      }
      
      html += '</div>';
    }

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

    // ── Inline Tools ──

    // A. Inline Calculator
    const entryPrice = (zone.prices && zone.prices.rows && zone.prices.rows.length) ? parsePriceMin(zone.prices.rows[0][1]) : 3500000;
    const calcContent = `<div class="calc-layout">
      <div class="calc-inputs">
        <div class="calc-row">
          <label>מחיר הדירה (₪)</label>
          <input type="number" id="calc-price" value="${entryPrice}" step="100000" oninput="App._calcMortgage()">
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
          <label>ריבית שנתית (%)</label>
          <input type="number" id="calc-rate" value="4.5" step="0.1" oninput="App._calcMortgage()">
        </div>
        <div class="calc-row">
          <label>תקופה (שנים)</label>
          <input type="number" id="calc-years" value="25" step="5" oninput="App._calcMortgage()">
        </div>
      </div>
      <div class="calc-results">
        <div class="calc-result">
          <div class="calc-result-label">מס רכישה</div>
          <div class="calc-result-value" id="calc-res-tax">—</div>
        </div>
        <div class="calc-result">
          <div class="calc-result-label">החזר חודשי</div>
          <div class="calc-result-value" id="calc-res-monthly">—</div>
          <div class="calc-result-sub" id="calc-res-loan">—</div>
        </div>
        <div class="calc-result">
          <div class="calc-result-label">עלות כוללת (כולל ריבית)</div>
          <div class="calc-result-value" id="calc-res-total">—</div>
          <div class="calc-result-sub" id="calc-res-interest">—</div>
        </div>
      </div>
      <div class="calc-warning">מדרגות 2026: דירה יחידה 0%→3.5%→5%→8%→10%. משקיע 8%→10%→12%. היטל השבחה, עו"ד ושמאי לא כלולים.</div>
    </div>`;

    html += `<div class="tools-section" id="tool-calc">
      <button class="tools-header" onclick="App.toggleTool('calc')">מחשבון משכנתא <span class="chevron">▼</span></button>
      <div class="tools-body">${calcContent}</div>
    </div>`;

    // B. Inline Scorer
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

    html += `<div class="tools-section" id="tool-scorer">
      <button class="tools-header" onclick="App.toggleTool('scorer')">ניקוד הזדמנות <span class="chevron">▼</span></button>
      <div class="tools-body">${scoreHtml}</div>
    </div>`;

    // C. Inline Checklist
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
    const zoneName = zone.name.split('·')[0].trim();
    let checkHtml = `<div class="check-progress-bar">
      <div class="check-progress-header">
        <span><strong id="checkNum">0</strong> / ${totalItems} עבור ${zoneName}</span>
        <span id="checkPct" style="font-weight:700;color:var(--accent)">0%</span>
      </div>
      <div class="check-progress-track">
        <div class="check-progress-fill" id="checkFill" style="width:0%"></div>
      </div>
    </div>`;
    checkHtml += '<div class="check-phases">';
    for (const phase of phases) {
      checkHtml += `<div class="check-phase">
        <div class="check-phase-head">
          <div class="check-phase-num">${phase.num}</div>
          <div><div class="check-phase-title">${phase.title}</div><div class="check-phase-sub">${phase.sub}</div></div>
        </div>`;
      for (const [title, help] of phase.items) {
        checkHtml += `<label class="check-item">
          <input type="checkbox" data-idx="${itemIdx}" onchange="App._onCheckChange()">
          <div><div class="check-item-title">${title}</div><div class="check-item-help">${help}</div></div>
        </label>`;
        itemIdx++;
      }
      checkHtml += '</div>';
    }
    checkHtml += '</div>';
    checkHtml += `<div style="text-align:center;margin-top:12px"><button onclick="App._resetChecklist()" style="background:var(--bg);border:1px solid var(--border);color:var(--muted);padding:8px 20px;border-radius:var(--radius-sm);cursor:pointer;font-family:inherit;font-size:11px">איפוס</button></div>`;

    html += `<div class="tools-section" id="tool-checklist">
      <button class="tools-header" onclick="App.toggleTool('checklist')">צ'קליסט רכישה <span class="chevron">▼</span></button>
      <div class="tools-body">${checkHtml}</div>
    </div>`;

    main.innerHTML = html;

    // Post-render hooks
    this._calcMortgage();
    this._loadChecklist();

    // Pre-fill scorer based on zone data
    setTimeout(() => {
      // Stage pre-fill
      if (zone.status === 'yes') {
        const radio = document.querySelector('input[name="score_stage"][value="100"]');
        if (radio) { radio.checked = true; }
      } else if (zone.status === 'maybe') {
        const factsStr = zone.facts.map(f => f[1]).join(' ');
        if (factsStr.includes('מאושרת')) {
          const radio = document.querySelector('input[name="score_stage"][value="80"]');
          if (radio) { radio.checked = true; }
        } else if (factsStr.includes('מופקדת')) {
          const radio = document.querySelector('input[name="score_stage"][value="55"]');
          if (radio) { radio.checked = true; }
        }
      }
      // Developer pre-fill
      if (dev) {
        if (dev.tier === 'A') {
          const radio = document.querySelector('input[name="score_developer"][value="100"]');
          if (radio) { radio.checked = true; }
        } else if (dev.tier === 'B') {
          const radio = document.querySelector('input[name="score_developer"][value="70"]');
          if (radio) { radio.checked = true; }
        }
      }
      this._updateScore();
    }, 0);
  },

  _renderZoneListings(zoneId, zone) {
    if (!_listingsCache || !_listingsCache.byZone) return '';
    const list = _listingsCache.byZone[zoneId] || [];
    if (!list.length) return '';

    const avgPpsqm = parsePpsqmRange(zone.prices.rows);
    const score = computeValueScore(zone);
    const updated = _listingsCache._meta && _listingsCache._meta.updated ? ' · עודכן ' + _listingsCache._meta.updated : '';

    let html = '<div class="data-panel">';
    html += `<div class="panel-header"><span class="panel-title">דירות לדוגמה במתחם${updated}</span></div>`;
    html += '<div class="listings-grid">';
    for (const l of list) {
      html += formatListingCard(l, avgPpsqm, score, zone);
    }
    html += '</div></div>';
    return html;
  },

  // ═══════════════════════════════════════════════════════════════
  //  TOOLS (collapsible sections used in zone detail)
  // ═══════════════════════════════════════════════════════════════
  toggleTool(id) {
    document.getElementById('tool-' + id)?.classList.toggle('open');
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

    // Save to sessionStorage per-zone
    const key = this._currentChecklistZone ? 'pinui_checklist_' + this._currentChecklistZone : 'pinui_checklist';
    const states = [...boxes].map(cb => cb.checked);
    try { sessionStorage.setItem(key, JSON.stringify(states)); } catch (e) {}
  },

  _loadChecklist() {
    const key = this._currentChecklistZone ? 'pinui_checklist_' + this._currentChecklistZone : 'pinui_checklist';
    try {
      const saved = sessionStorage.getItem(key);
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
    const key = this._currentChecklistZone ? 'pinui_checklist_' + this._currentChecklistZone : 'pinui_checklist';
    try { sessionStorage.removeItem(key); } catch (e) {}
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

window.App = App;