// yad2.js — Scrape Yad2 listings via Playwright
const { chromium } = require('playwright');

const DELAY_MIN = 3000;
const DELAY_MAX = 8000;
const MAX_RETRIES = 2;
const MAX_PAGES = 3; // pages per hood search

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function randomDelay() { return delay(DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN)); }

async function scrapeYad2City(cityConfig, zones, browser) {
  const listings = [];
  const codes = cityConfig.searchCodes;

  // Group zones by unique Yad2 hood IDs to avoid duplicate searches
  const hoodSearches = new Map();
  for (const z of zones) {
    if (z.yad2HoodId) {
      if (!hoodSearches.has(z.yad2HoodId)) {
        hoodSearches.set(z.yad2HoodId, { hoodId: z.yad2HoodId, hood: z.hood, zones: [] });
      }
      hoodSearches.get(z.yad2HoodId).zones.push(z);
    }
  }

  // Also do a city-level search for zones without hood IDs
  hoodSearches.set('city', { hoodId: null, hood: cityConfig.name, zones: zones.filter(z => !z.yad2HoodId) });

  console.log(`  [Yad2] ${cityConfig.name}: ${hoodSearches.size} searches`);

  for (const [key, search] of hoodSearches) {
    if (key === 'city' && search.zones.length === 0) continue;

    const url = new URL('https://www.yad2.co.il/realestate/forsale');
    if (codes.yad2TopAreaId) url.searchParams.set('topArea', codes.yad2TopAreaId);
    if (codes.yad2AreaId) url.searchParams.set('area', codes.yad2AreaId);
    url.searchParams.set('city', codes.yad2CityId);
    if (search.hoodId) url.searchParams.set('neighborhood', search.hoodId);
    url.searchParams.set('property', '1'); // apartments only

    console.log(`    [Yad2] Hood "${search.hood}" (${search.hoodId || 'city-level'})`);

    let retries = 0;
    while (retries <= MAX_RETRIES) {
      const context = await browser.newContext({
        locale: 'he-IL',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();

      try {
        await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30000 });
        await delay(3000);

        // Scroll to load listings
        for (let i = 0; i < 5; i++) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight));
          await delay(1000);
        }

        // Extract listings from Yad2 DOM
        const pageListings = await page.evaluate(() => {
          // Yad2 uses feed-item cards
          const items = document.querySelectorAll('[class*="feeditem"], [class*="feed_item"], [class*="listing"], [data-testid*="feed"]');
          const results = [];

          for (const item of items) {
            try {
              const priceEl = item.querySelector('[class*="price"], [data-testid*="price"]');
              const titleEl = item.querySelector('[class*="title"], [class*="address"], [data-testid*="title"]');
              const infoEls = item.querySelectorAll('[class*="info"], [class*="detail"], [class*="row_val"]');
              const linkEl = item.querySelector('a[href*="/realestate/item/"]');
              const hoodEl = item.querySelector('[class*="subtitle"], [class*="neighborhood"]');

              const price = priceEl?.textContent?.trim() || '';
              const title = titleEl?.textContent?.trim() || '';

              if (!price || !title) continue;
              if (!price.match(/[\d,]+/)) continue;

              // Parse info cells (rooms, sqm, floor)
              let rooms = '', sqm = '', floor = '';
              const infoTexts = [...infoEls].map(el => el.textContent.trim());
              for (const t of infoTexts) {
                if (t.match(/^\d+\.?\d*$/) && !rooms) rooms = t;
                else if (t.match(/\d+\s*מ/) && !sqm) sqm = t.match(/(\d+)/)?.[1] || '';
                else if (t.match(/קומה|ק'/) && !floor) floor = t.match(/(\d+)/)?.[1] || '';
              }

              results.push({
                title,
                price,
                rooms,
                sqm,
                floor,
                hood: hoodEl?.textContent?.trim() || '',
                url: linkEl?.href || ''
              });
            } catch (e) { /* skip */ }
          }
          return results;
        });

        for (const l of pageListings) {
          listings.push({
            ...l,
            source: 'Yad2',
            _hood: search.hood,
            _city: cityConfig.slug,
            _cityName: cityConfig.name
          });
        }

        console.log(`    [Yad2] "${search.hood}": ${pageListings.length} listings`);
        await context.close();
        break;

      } catch (err) {
        console.warn(`    [Yad2] "${search.hood}" attempt ${retries + 1} failed:`, err.message);
        await context.close();
        retries++;
        if (retries <= MAX_RETRIES) await randomDelay();
      }
    }

    await randomDelay();
  }

  return listings;
}

async function scrapeAll(cityConfigs, allZones) {
  console.log('[Yad2] Starting scrape...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allListings = [];
  for (const city of cityConfigs) {
    const cityZones = allZones.filter(z => z.citySlug === city.slug);
    try {
      const listings = await scrapeYad2City(city, cityZones, browser);
      allListings.push(...listings);
    } catch (err) {
      console.error(`[Yad2] ${city.name} failed entirely:`, err.message);
    }
    await randomDelay();
  }

  await browser.close();
  console.log(`[Yad2] Total: ${allListings.length} listings`);
  return allListings;
}

module.exports = { scrapeAll };
