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
        await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
        await delay(3000);

        // Human-like scrolling to trigger lazy loading
        console.log(`    [Yad2] Scrolling to load feed...`);
        for (let i = 0; i < 15; i++) {
          const scrollHeight = 400 + Math.floor(Math.random() * 400);
          await page.evaluate((y) => window.scrollBy(0, y), scrollHeight);
          await delay(800 + Math.random() * 1000);
          
          // Occasionally scroll up a bit
          if (i % 5 === 0) {
            await page.evaluate(() => window.scrollBy(0, -200));
            await delay(500);
          }
        }

        // Wait for at least one listing to appear
        try {
          await page.waitForSelector('[class*="feeditem"], [class*="feed_item"], [class*="listing"], [data-testid*="feed"]', { timeout: 10000 });
        } catch (e) {
          console.warn(`    [Yad2] No listings appeared after scrolling.`);
        }

        // Extract listings from Yad2 DOM
        const pageListings = await page.evaluate(() => {
          // Yad2 uses various classes for feed items
          const items = document.querySelectorAll('[data-testid="feed-item"], [class*="feeditem"], [class*="feed_item"], [class*="listing"], [class*="FeedItem"]');
          const results = [];

          for (const item of items) {
            try {
              // Try many common selector patterns for price and title
              const priceEl = item.querySelector('[data-testid*="price"], [class*="price"], .price, [class*="Price"]');
              const titleEl = item.querySelector('[data-testid*="title"], [class*="title"], [class*="address"], .title, [class*="Title"]');
              const linkEl = item.querySelector('a[href*="/realestate/item/"]');
              const hoodEl = item.querySelector('[class*="subtitle"], [class*="neighborhood"], .subtitle');
              
              const price = priceEl?.textContent?.trim() || '';
              const title = titleEl?.textContent?.trim() || '';
              const url = linkEl?.href || '';

              if (!price || !title) continue;
              
              // Skip generic "Ad" items but be less strict if we're getting zero results
              const isAd = title.includes('נכס דומה') || url.includes('spot=') || url.includes('component-type=main_feed');
              
              // Parse info
              let rooms = '', sqm = '', floor = '';
              const roomsEl = item.querySelector('[data-testid*="rooms"], [class*="rooms"]');
              const floorEl = item.querySelector('[data-testid*="floor"], [class*="floor"]');
              const sizeEl = item.querySelector('[data-testid*="size"], [class*="size"], [class*="sqm"]');
              
              if (roomsEl) rooms = roomsEl.textContent.trim();
              if (floorEl) floor = floorEl.textContent.trim().replace('קומה', '').replace("ק'", "").trim();
              if (sizeEl) sqm = sizeEl.textContent.trim().replace('מ"ר', '').trim();

              // Fallback for info
              if (!rooms || !sqm) {
                const infoEls = item.querySelectorAll('[class*="info"], [class*="detail"], [class*="row_val"], .info_item');
                const infoTexts = [...infoEls].map(el => el.textContent.trim());
                for (const t of infoTexts) {
                  if (t.match(/^\d+\.?\d*$/) && !rooms) rooms = t;
                  else if (t.match(/\d+\s*מ/) && !sqm) sqm = t.match(/(\d+)/)?.[1] || '';
                  else if (t.match(/קומה|ק'/) && !floor) floor = t.match(/(\d+)/)?.[1] || '';
                }
              }

              results.push({
                title,
                price,
                rooms,
                sqm,
                floor,
                hood: hoodEl?.textContent?.trim() || '',
                url,
                isAd
              });
            } catch (e) { /* skip */ }
          }
          return results;
        });

        // Filter ads if we have organic results, otherwise keep them but mark them
        const organic = pageListings.filter(l => !l.isAd);
        const finalPageListings = organic.length > 0 ? organic : pageListings;

        for (const l of finalPageListings) {
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
