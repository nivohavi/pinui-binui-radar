// zone-matcher.js — Map scraped listings to zone IDs by hood + address
const { getAllZones } = require('../config');

class ZoneMatcher {
  constructor() {
    this.zones = getAllZones();
    this.index = this._buildIndex();
    this.unmatched = [];
  }

  _buildIndex() {
    // Index: citySlug/hood → [{ zoneId, addressKeywords, isBroad }]
    const idx = {};
    for (const z of this.zones) {
      const key = `${z.citySlug}/${z.hood}`;
      if (!idx[key]) idx[key] = [];

      // Extract street name keywords from address
      const keywords = this._extractStreetKeywords(z.address);
      const isBroad = !z.address || z.address.includes('דונם') || z.address.includes('שכונת') || z.address.includes('מתחם');

      idx[key].push({
        zoneId: z.zoneId,
        hood: z.hood,
        address: z.address,
        keywords,
        isBroad,
        status: z.status
      });
    }
    return idx;
  }

  _extractStreetKeywords(address) {
    if (!address) return [];
    // Remove common prefixes and split by separators
    return address
      .replace(/רחוב|שדרות|דרך|שכונת|מתחם|ליד/g, '')
      .replace(/\(.*?\)/g, '') // remove parentheticals like "(340 דונם)"
      .split(/[,\/·\-–]/)
      .map(s => s.trim())
      .filter(s => s.length > 1);
  }

  // Match a single listing to a zone ID
  match(listing) {
    const citySlug = listing._city;
    const hood = listing.hood || listing._hood || '';
    const title = listing.title || '';

    if (!citySlug) return null;

    // Strategy 1: Exact hood match
    const key = `${citySlug}/${hood}`;
    let candidates = this.index[key] || [];

    // Strategy 2: Fuzzy hood match (listing hood might be slightly different from zone hood)
    if (!candidates.length) {
      for (const [k, zones] of Object.entries(this.index)) {
        if (!k.startsWith(citySlug + '/')) continue;
        const zoneHood = k.split('/')[1];
        if (hood.includes(zoneHood) || zoneHood.includes(hood)) {
          candidates = zones;
          break;
        }
      }
    }

    // Strategy 3: City-wide fallback — match by address keywords
    if (!candidates.length) {
      const allCityZones = Object.entries(this.index)
        .filter(([k]) => k.startsWith(citySlug + '/'))
        .flatMap(([, zones]) => zones);

      for (const z of allCityZones) {
        for (const kw of z.keywords) {
          if (title.includes(kw)) {
            return z.zoneId;
          }
        }
      }

      // Truly unmatched
      this.unmatched.push({ title, hood, city: citySlug });
      return null;
    }

    // Single candidate — easy
    if (candidates.length === 1) return candidates[0].zoneId;

    // Multiple candidates in same hood — match by street name
    for (const c of candidates) {
      for (const kw of c.keywords) {
        if (title.includes(kw)) return c.zoneId;
      }
    }

    // Fallback: pick the broadest zone (catch-all for the hood)
    const broad = candidates.find(c => c.isBroad);
    if (broad) return broad.zoneId;

    // Last resort: first candidate
    return candidates[0].zoneId;
  }

  // Match all listings, return grouped by zoneId
  matchAll(listings) {
    const byZone = {};

    for (const listing of listings) {
      const zoneId = this.match(listing);
      if (!zoneId) continue;

      if (!byZone[zoneId]) byZone[zoneId] = [];
      byZone[zoneId].push(listing);
    }

    console.log(`[Matcher] ${listings.length} listings → ${Object.keys(byZone).length} zones matched, ${this.unmatched.length} unmatched`);
    if (this.unmatched.length > 0) {
      console.log(`[Matcher] Sample unmatched:`, this.unmatched.slice(0, 5).map(u => `${u.title} (${u.hood})`));
    }

    return byZone;
  }
}

module.exports = { ZoneMatcher };
