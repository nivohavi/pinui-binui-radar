
const fs = require('fs');

// 1. Create a CommonJS version of cities.js
let citiesContent = fs.readFileSync('./givatayim-pinui-radar/cities.js', 'utf8');
citiesContent = citiesContent.replace('const CITIES =', 'const CITIES_VAL =');
citiesContent += '\nmodule.exports = { CITIES: CITIES_VAL, parsePpsqmRange };';

// We also need to mock or include parsePpsqmRange if it is not already in the file
// Looking at the file, it is there.
const tempPath = './temp-cities.js';
fs.writeFileSync(tempPath, citiesContent);

const { CITIES, parsePpsqmRange } = require(tempPath);
const listingsData = JSON.parse(fs.readFileSync('./givatayim-pinui-radar/listings.json', 'utf8'));

console.log("--- DEAL DETECTION DEBUG (ROBUST) ---");
let totalFound = 0;
let totalAboveBudget = 0;
const budget = 3000000;

// Flatten all zones for easier lookup
const allZones = [];
for (const city of Object.values(CITIES)) {
    allZones.push(...city.zones);
}
console.log(`Loaded ${allZones.length} zones from CITIES`);

for (const [zoneId, listings] of Object.entries(listingsData.byZone)) {
    const zone = allZones.find(z => z.id === zoneId);
    if (!zone) continue;

    const avgPpsqm = parsePpsqmRange(zone.prices.rows);
    if (!avgPpsqm) continue;

    listings.forEach(l => {
        const sqm = parseInt(l.sqm) || 0;
        const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;
        if (sqm > 0 && price > 0) {
            const ppsqm = price / sqm;
            const ratio = ppsqm / avgPpsqm;
            if (ratio < 0.92) {
                if (price <= budget) {
                    totalFound++;
                } else {
                    totalAboveBudget++;
                }
            }
        }
    });
}

console.log("----------------------------");
console.log("Total Deals in budget (3M): " + totalFound);
console.log("Total Deals above budget (3M): " + totalAboveBudget);
console.log("Grand Total potential findings: " + (totalFound + totalAboveBudget));

fs.unlinkSync(tempPath);
