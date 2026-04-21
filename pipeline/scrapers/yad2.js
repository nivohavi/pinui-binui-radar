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
          const results = [];
          
          // DEBUG: Find all elements containing ₪ and no children
          const potentialPrices = [...document.querySelectorAll('*')].filter(el => 
            el.textContent.includes('₪') && el.children.length === 0 && el.textContent.length < 20
          );
          
          if (potentialPrices.length > 0) {
            for (const priceEl of potentialPrices) {
              const priceText = priceEl.textContent.trim();
              const priceVal = parseInt(priceText.replace(/[^\d]/g, ''));
              
              // Skip very low prices (likely parking or storage)
              if (priceVal < 500000) continue;

              let container = priceEl.parentElement;
              for (let i = 0; i < 10 && container; i++) {
                const link = container.querySelector('a[href*="/realestate/item/"]');
                if (link) {
                  // Try many ways to find a title
                  const titleEl = container.querySelector('[data-testid="feed-item-title"], [class*="title"], [class*="address"], b, strong');
                  const title = titleEl?.textContent?.trim() || 'דירה למכירה';
                  const url = link.href;
                  
                  // Try to find rooms, sqm, floor
                  let rooms = '', sqm = '', floor = '';
                  
                  // Look for specific testids first
                  const rEl = container.querySelector('[data-testid*="rooms"]');
                  const sEl = container.querySelector('[data-testid*="size"]');
                  const fEl = container.querySelector('[data-testid*="floor"]');
                  
                  if (rEl) rooms = rEl.textContent.trim();
                  if (sEl) sqm = sEl.textContent.trim().replace('מ"ר', '').trim();
                  if (fEl) floor = fEl.textContent.trim().replace('קומה', '').replace("ק'", "").trim();
                  
                  // Fallback: look for elements with specific text
                  if (!rooms || !sqm) {
                    const allEls = [...container.querySelectorAll('span, div')].filter(el => el.children.length === 0);
                    for (const el of allEls) {
                      const txt = el.textContent.trim();
                      if (txt.match(/^\d+\.?\d*$/) && !rooms && txt.length < 3) rooms = txt;
                      else if (txt.includes('מ"ר') && !sqm) sqm = txt.replace('מ"ר', '').trim();
                      else if ((txt.includes('קומה') || txt.includes("ק'")) && !floor) {
                        floor = txt.replace('קומה', '').replace("ק'", "").trim();
                      }
                    }
                  }

                  results.push({
                    title,
                    price: priceText,
                    rooms,
                    sqm,
                    floor,
                    url,
                    isAd: title.includes('נכס דומה') || url.includes('spot=')
                  });
                  break;
                }
                container = container.parentElement;
              }
            }
          }
          
          return results;
        });

        // Dedupe results by URL
        const uniqueResults = [];
        const seenUrls = new Set();
        for (const r of pageListings) {
          if (!seenUrls.has(r.url)) {
            seenUrls.add(r.url);
            uniqueResults.push(r);
          }
        }

        const organic = uniqueResults.filter(l => !l.isAd);
        const finalPageListings = organic.length > 0 ? organic : uniqueResults;

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
