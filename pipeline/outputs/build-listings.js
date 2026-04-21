// build-listings.js — Merge, dedupe, format listings → write listings.json
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', '..', 'givatayim-pinui-radar', 'listings.json');
const MAX_PER_ZONE = 20;
const MIN_TOTAL_LISTINGS = 5; // Safety threshold — abort if below this

function formatListing(raw) {
  // Normalize price format: "₪ X,XXX,XXX" or "₪X,XXX,XXX" → "₪ X,XXX,XXX"
  let price = raw.price || '';
  if (price && !price.startsWith('₪')) {
    const num = parseInt(price.replace(/[^\d]/g, ''));
    if (num) price = '₪ ' + num.toLocaleString('he-IL');
  }
  price = price.replace(/₪\s*/, '₪ ').trim();

  const rooms = raw.rooms || '';
  const sqm = raw.sqm || '';
  const floor = raw.floor || '';

  // Build meta string
  const metaParts = [];
  if (rooms) metaParts.push(rooms + " ח'");
  if (sqm) metaParts.push(sqm + ' מ״ר');
  if (floor) metaParts.push("ק' " + floor);
  const meta = metaParts.join(' · ');

  return {
    title: raw.title || '',
    price,
    rooms,
    sqm,
    floor,
    hood: raw.hood || raw._hood || '',
    source: raw.source || 'Unknown',
    url: raw.url || '',
    meta
  };
}

function dedupe(listings) {
  // Dedupe by: same street name (normalized) + price within 5%
  const seen = new Map();
  const result = [];

  for (const l of listings) {
    const normalizedTitle = (l.title || '').replace(/\d+/g, '').trim();
    const price = parseInt((l.price || '').replace(/[^\d]/g, '')) || 0;

    let isDupe = false;
    for (const [key, existing] of seen) {
      if (key === normalizedTitle && existing.price) {
        const priceDiff = Math.abs(price - existing.price) / existing.price;
        if (priceDiff < 0.05) {
          isDupe = true;
          // Keep the one with more data
          if ((l.sqm || '') > (existing.listing.sqm || '')) {
            const idx = result.indexOf(existing.listing);
            if (idx >= 0) result[idx] = l;
          }
          break;
        }
      }
    }

    if (!isDupe) {
      seen.set(normalizedTitle, { price, listing: l });
      result.push(l);
    }
  }

  return result;
}

function build(byZone, sources, fileName = 'data_v1.json') {
  const outputPath = path.join(__dirname, '..', '..', 'givatayim-pinui-radar', fileName);
  
  // 1. Load existing data if available
  let existingData = { byZone: {}, _meta: {} };
  if (fs.existsSync(outputPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    } catch (e) {
      console.warn(`[Build] Could not parse existing ${fileName}, starting fresh.`);
    }
  }

  const finalByZone = { ...existingData.byZone };

  // 2. Process each zone
  const allZoneIds = new Set([...Object.keys(finalByZone), ...Object.keys(byZone)]);
  let totalListings = 0;

  for (const zoneId of allZoneIds) {
    const existingListings = finalByZone[zoneId] || [];
    const newListings = byZone[zoneId] || [];

    // Filter out old listings from the sources we just scraped
    const preservedListings = existingListings.filter(l => !sources.includes(l.source));
    
    // Format and combine
    const formattedNew = newListings.map(formatListing).filter(l => l.title || l.price);
    const combined = [...preservedListings, ...formattedNew];

    // Dedupe by URL
    const seenUrls = new Set();
    const unique = combined.filter(l => {
      if (!l.url || seenUrls.has(l.url)) return false;
      seenUrls.add(l.url);
      return true;
    });

    // Sort by price
    unique.sort((a, b) => {
      const pa = parseInt((a.price || '').replace(/[^\d]/g, '')) || 0;
      const pb = parseInt((b.price || '').replace(/[^\d]/g, '')) || 0;
      return pa - pb;
    });

    finalByZone[zoneId] = unique.slice(0, 50); // Increased cap
    totalListings += finalByZone[zoneId].length;
  }

  // 3. Prepare output
  const output = {
    ...existingData,
    _meta: {
      updated: new Date().toISOString().slice(0, 10),
      source: [...new Set([...(existingData._meta?.source?.split(' + ') || []), ...sources])].join(' + '),
      note: 'עודכן אוטומטית. דירות ממופות לפי שכונה לאזורי פינוי-בינוי הרלוונטיים.'
    },
    byZone: finalByZone
  };

  // Safety check
  if (totalListings < MIN_TOTAL_LISTINGS) {
    console.error(`[Build] ABORT: Only ${totalListings} listings. Keeping previous ${fileName}.`);
    return false;
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[Build] Updated ${fileName}: Total ${totalListings} listings across ${Object.keys(finalByZone).length} zones.`);
  return true;
}

module.exports = { build };
