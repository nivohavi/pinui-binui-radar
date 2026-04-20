// config.js — Load zone definitions from cities.js via Node's vm sandbox
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CITIES_PATH = path.join(__dirname, '..', 'givatayim-pinui-radar', 'cities.js');

function loadCitiesData() {
  const src = fs.readFileSync(CITIES_PATH, 'utf8');

  // Minimal browser-like globals so cities.js doesn't throw
  const sandbox = {
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    window: { location: { href: 'http://localhost', hash: '' } },
    location: { hash: '' },
    document: {
      addEventListener: () => {},
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => null,
      title: ''
    },
    fetch: () => Promise.resolve({ ok: false, json: () => ({}) }),
    setTimeout: () => {},
    clearTimeout: () => {},
    console,
    URL,
    encodeURIComponent,
    Promise
  };

  vm.createContext(sandbox);
  // cities.js uses `const` which doesn't attach to sandbox globals.
  // Wrap in a function that returns the objects we need.
  const wrapped = `(function() { ${src}; return { CITIES, YAD2_HOOD_IDS, DEVELOPERS }; })()`;
  const result = vm.runInContext(wrapped, sandbox);

  return {
    CITIES: result.CITIES,
    YAD2_HOOD_IDS: result.YAD2_HOOD_IDS,
    DEVELOPERS: result.DEVELOPERS
  };
}

// Build a flat list of all zones with their city context
function getAllZones() {
  const { CITIES, YAD2_HOOD_IDS } = loadCitiesData();
  const zones = [];

  for (const [citySlug, city] of Object.entries(CITIES)) {
    const hoodIds = YAD2_HOOD_IDS[citySlug] || {};
    for (const z of city.zones) {
      zones.push({
        citySlug,
        cityName: city.name,
        citySearchCodes: city.searchCodes,
        zoneId: z.id,
        hood: z.hood,
        address: z.address || '',
        name: z.name,
        status: z.status,
        yad2HoodId: hoodIds[z.hood] || null
      });
    }
  }

  return zones;
}

// Extract unique city configs for scraping
function getCityConfigs() {
  const { CITIES } = loadCitiesData();
  return Object.entries(CITIES).map(([slug, city]) => ({
    slug,
    name: city.name,
    searchCodes: city.searchCodes,
    hoods: [...new Set(city.zones.map(z => z.hood).filter(Boolean))]
  }));
}

module.exports = { loadCitiesData, getAllZones, getCityConfigs };
