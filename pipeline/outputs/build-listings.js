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

function build(byZone, sources) {
  const output = {
    _meta: {
      updated: new Date().toISOString().slice(0, 10),
      source: sources.join(' + '),
      note: 'עודכן אוטומטית. דירות ממופות לפי שכונה לאזורי פינוי-בינוי הרלוונטיים. לא כל דירה היא מועמדת לפינוי-בינוי.'
    },
    byZone: {}
  };

  let totalListings = 0;

  for (const [zoneId, listings] of Object.entries(byZone)) {
    // Format all listings
    const formatted = listings.map(formatListing).filter(l => l.title || l.price);

    // Dedupe within zone
    const unique = dedupe(formatted);

    // Sort by price ascending
    unique.sort((a, b) => {
      const pa = parseInt((a.price || '').replace(/[^\d]/g, '')) || 0;
      const pb = parseInt((b.price || '').replace(/[^\d]/g, '')) || 0;
      return pa - pb;
    });

    // Cap per zone
    output.byZone[zoneId] = unique.slice(0, MAX_PER_ZONE);
    totalListings += output.byZone[zoneId].length;
  }

  // Safety check
  if (totalListings < MIN_TOTAL_LISTINGS) {
    console.error(`[Build] ABORT: Only ${totalListings} listings (threshold: ${MIN_TOTAL_LISTINGS}). Something is wrong. Keeping previous listings.json.`);
    return false;
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[Build] Wrote ${totalListings} listings across ${Object.keys(output.byZone).length} zones to listings.json`);
  return true;
}

module.exports = { build };
