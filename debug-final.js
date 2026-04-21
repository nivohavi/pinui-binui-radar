
const fs = require('fs');

// Mock localStorage
const storage = {
    pinui_budget: '3000000',
    pinui_cities: '["givatayim","ramat-gan","tel-aviv"]',
    pinui_statuses: '["yes","maybe"]'
};
const localStorage = {
    getItem: (key) => storage[key],
    setItem: (key, val) => { storage[key] = val; }
};

// 1. Mock State (copied from app.js)
const state = {
    view: 'dashboard',
    zoneId: null,
    budget: parseInt(localStorage.getItem('pinui_budget')) || 3000000,
    cities: JSON.parse(localStorage.getItem('pinui_cities') || '["givatayim","ramat-gan","tel-aviv"]'),
    statuses: JSON.parse(localStorage.getItem('pinui_statuses') || '["yes","maybe"]'),
    sortCol: 'score',
    sortAsc: false,
    dealsSortCol: 'ratio',
    dealsSortAsc: true,
    toolsOpen: {}
};

// 2. Load Data
let citiesContent = fs.readFileSync('./givatayim-pinui-radar/cities.js', 'utf8');
citiesContent = citiesContent.replace('const CITIES =', 'const CITIES_VAL =');
citiesContent += '\nmodule.exports = { CITIES: CITIES_VAL, parsePpsqmRange };';
fs.writeFileSync('./temp-cities-debug.js', citiesContent);

const { CITIES, parsePpsqmRange } = require('./temp-cities-debug.js');
const _listingsCache = JSON.parse(fs.readFileSync('./givatayim-pinui-radar/listings.json', 'utf8'));

// 3. Helper (copied from app.js)
function _findZoneData(zoneId) {
    for (const [slug, city] of Object.entries(CITIES)) {
      const z = city.zones.find(cz => cz.id === zoneId);
      if (z) return { ...z, citySlug: slug };
    }
    return null;
}

// 4. Debug countDeals
console.log("--- BROWSER-MOCK DEBUG ---");
console.log("Current State Cities:", state.cities);
console.log("Current State Budget:", state.budget);

let count = 0;
let totalListingsSeen = 0;

for (const [zoneId, listings] of Object.entries(_listingsCache.byZone)) {
    const zone = _findZoneData(zoneId);
    if (!zone) {
        // console.log(`Skipping zone ${zoneId} - not found`);
        continue;
    }
    
    totalListingsSeen += listings.length;

    // Filter by city only for deals
    if (state.cities.length > 0 && !state.cities.includes(zone.citySlug)) {
        // console.log(`Skipping zone ${zoneId} - city ${zone.citySlug} not in filter`);
        continue;
    }

    const avgPpsqm = parsePpsqmRange(zone.prices.rows);
    if (!avgPpsqm) continue;

    listings.forEach(l => {
        const sqm = parseInt(l.sqm) || 0;
        const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;

        if (state.budget && price > state.budget) return;

        if (sqm > 0 && price > 0) {
            const ppsqm = price / sqm;
            if (ppsqm / avgPpsqm < 0.92) count++;
        }
    });
}

console.log("Total Listings Checked:", totalListingsSeen);
console.log("Total Deals found:", count);

fs.unlinkSync('./temp-cities-debug.js');
