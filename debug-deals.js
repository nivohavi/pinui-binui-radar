
const fs = require('fs');

// 1. Load Listings
const listingsData = JSON.parse(fs.readFileSync('./givatayim-pinui-radar/listings.json', 'utf8'));

// 2. Mock parsePpsqmRange (copied from cities.js)
function parsePpsqmRange(rows) {
  const row = rows.find(r => r[0].includes('מחיר למ'));
  if (!row) return null;
  const m = row[1].match(/(\d+)K[–\-](\d+)K/);
  if (m) return ((parseInt(m[1]) + parseInt(m[2])) / 2) * 1000;
  const s = row[1].match(/(\d+)K/);
  if (s) return parseInt(s[1]) * 1000;
  return null;
}

// 3. Extract CITIES from cities.js (brute force regex)
const citiesContent = fs.readFileSync('./givatayim-pinui-radar/cities.js', 'utf8');
// This is a bit hacky but works for a quick local test
const zonesMatch = citiesContent.match(/id:\u0027(.*?)\u0027, hood:(.*?)prices:\{(.*?)\}/gs);

const zoneMap = {};
// We only need id and prices for this test
const zonesRaw = [];
const zoneRegex = /id:\u0027(.*?)\u0027,.*?, prices:\{(.*?)\}/gs;
let m;
while ((m = zoneRegex.exec(citiesContent)) !== null) {
    const id = m[1];
    const pricesStr = m[2];
    const rowsMatch = pricesStr.match(/\[\u0027(.*?)\u0027,\u0027(.*?)\u0027\]/g);
    const rows = rowsMatch ? rowsMatch.map(r => {
        const parts = r.match(/\[\u0027(.*?)\u0027,\u0027(.*?)\u0027\]/);
        return [parts[1], parts[2]];
    }) : [];
    zoneMap[id] = { id, prices: { rows } };
}

console.log(`Loaded ${Object.keys(zoneMap).length} zones from cities.js`);
const firstId = Object.keys(zoneMap)[0];
console.log(`Sample zone (${firstId}) ppsqm: ${parsePpsqmRange(zoneMap[firstId].prices.rows)}`);

// 4. Run Deal Detection
console.log("--- DEAL DETECTION DEBUG ---");
let totalFound = 0;
let totalAboveBudget = 0;
const budget = 3000000; // default
const bigBudget = 10000000;

for (const [zoneId, listings] of Object.entries(listingsData.byZone)) {
    const zone = zoneMap[zoneId];
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
