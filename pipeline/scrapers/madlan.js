// madlan.js — Scrape Madlan listings via Playwright (intercepts /api2 GraphQL)
const { chromium } = require('playwright');

const DELAY_MIN = 2000;
const DELAY_MAX = 5000;
const MAX_RETRIES = 2;

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function randomDelay() { return delay(DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN)); }

// Parse a listing from Madlan's DOM
function parseListingFromDOM(card) {
  return {
    title: card.title || '',
    price: card.price || '',
    rooms: card.rooms || '',
    sqm: card.sqm || '',
    floor: card.floor || '',
    hood: card.hood || '',
    url: card.url || '',
    source: 'Madlan'
  };
}

async function scrapeMadlanCity(cityConfig, browser) {
  const slug = encodeURIComponent(cityConfig.searchCodes.madlanSlug);
  const url = `https://www.madlan.co.il/for-sale/${slug}`;
  const listings = [];

  console.log(`  [Madlan] Scraping ${cityConfig.name}: ${url}`);

  let retries = 0;
  while (retries <= MAX_RETRIES) {
    const context = await browser.newContext({
      locale: 'he-IL',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
      // Intercept API responses to capture listing data
      const apiResponses = [];
      page.on('response', async (response) => {
        const reqUrl = response.url();
        if (reqUrl.includes('/api2') || reqUrl.includes('/graphql') || reqUrl.includes('getData')) {
          try {
            const data = await response.json();
            apiResponses.push(data);
          } catch (e) { /* not JSON, skip */ }
        }
      });

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await delay(3000); // Let JS render

      // Scroll to load more listings
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await delay(1500);
      }

      // Extract listings from the DOM
      const domListings = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="listing"], [class*="card"], [class*="bulletin"], [data-testid*="listing"]');
        const results = [];

        for (const card of cards) {
          try {
            // Try multiple selector patterns (Madlan changes their class names)
            const priceEl = card.querySelector('[class*="price"], [data-testid*="price"]');
            const addressEl = card.querySelector('[class*="address"], [class*="street"], [data-testid*="address"]');
            const roomsEl = card.querySelector('[class*="rooms"], [class*="room"]');
            const sqmEl = card.querySelector('[class*="area"], [class*="sqm"], [class*="size"]');
            const floorEl = card.querySelector('[class*="floor"]');
            const linkEl = card.querySelector('a[href*="/for-sale/"], a[href*="/bulletin/"]');
            const hoodEl = card.querySelector('[class*="neighborhood"], [class*="hood"], [class*="location"]');

            const price = priceEl?.textContent?.trim() || '';
            const address = addressEl?.textContent?.trim() || '';

            // Skip if no meaningful data
            if (!price && !address) continue;
            // Skip if price doesn't look like NIS
            if (price && !price.match(/[\d,]+/)) continue;

            results.push({
              title: address,
              price: price,
              rooms: roomsEl?.textContent?.match(/[\d.]+/)?.[0] || '',
              sqm: sqmEl?.textContent?.match(/\d+/)?.[0] || '',
              floor: floorEl?.textContent?.match(/\d+/)?.[0] || '',
              hood: hoodEl?.textContent?.trim() || '',
              url: linkEl?.href || ''
            });
          } catch (e) { /* skip malformed card */ }
        }
        return results;
      });

      // Also try to extract from intercepted API responses
      for (const resp of apiResponses) {
        try {
          // Navigate nested response structures
          const items = findListingsInResponse(resp);
          for (const item of items) {
            listings.push({
              title: item.address || item.street || item.streetAddress || '',
              price: formatPrice(item.price || item.askingPrice || 0),
              rooms: String(item.rooms || item.roomsCount || ''),
              sqm: String(item.area || item.sqm || item.size || ''),
              floor: String(item.floor || item.floorNumber || ''),
              hood: item.neighborhood || item.hood || item.areaName || '',
              url: item.url || item.link || (item.id ? `https://www.madlan.co.il/bulletin/${item.id}` : ''),
              source: 'Madlan'
            });
          }
        } catch (e) { /* skip malformed response */ }
      }

      // Add DOM-extracted listings
      for (const l of domListings) {
        if (l.title || l.price) {
          listings.push({ ...l, source: 'Madlan' });
        }
      }

      console.log(`  [Madlan] ${cityConfig.name}: ${listings.length} listings found (${domListings.length} DOM + ${listings.length - domListings.length} API)`);
      await context.close();
      break; // Success

    } catch (err) {
      console.warn(`  [Madlan] ${cityConfig.name} attempt ${retries + 1} failed:`, err.message);
      await context.close();
      retries++;
      if (retries <= MAX_RETRIES) await randomDelay();
    }
  }

  return listings;
}

// Recursively find listing arrays in API response
function findListingsInResponse(obj) {
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj)) {
    // Check if this array contains listing-like objects
    if (obj.length > 0 && obj[0] && (obj[0].price || obj[0].askingPrice || obj[0].address)) {
      return obj;
    }
    // Recurse into array items
    for (const item of obj) {
      const found = findListingsInResponse(item);
      if (found.length) return found;
    }
    return [];
  }
  // Recurse into object values
  for (const val of Object.values(obj)) {
    const found = findListingsInResponse(val);
    if (found.length) return found;
  }
  return [];
}

function formatPrice(num) {
  if (!num) return '';
  const n = typeof num === 'string' ? parseInt(num.replace(/[^\d]/g, '')) : num;
  return '₪ ' + n.toLocaleString('he-IL');
}

async function scrapeAll(cityConfigs) {
  console.log('[Madlan] Starting scrape...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allListings = [];
  for (const city of cityConfigs) {
    const listings = await scrapeMadlanCity(city, browser);
    for (const l of listings) {
      l._city = city.slug;
      l._cityName = city.name;
    }
    allListings.push(...listings);
    await randomDelay();
  }

  await browser.close();
  console.log(`[Madlan] Total: ${allListings.length} listings`);
  return allListings;
}

module.exports = { scrapeAll };
