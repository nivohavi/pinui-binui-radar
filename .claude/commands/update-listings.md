# Update Listings

Fetch fresh real estate listings for all 54 zones across Givatayim, Ramat Gan, and Tel Aviv. Uses WebFetch and WebSearch to gather data from Yad2, Madlan, and other sources.

## Instructions

You are updating the listings data for the התחדשות.AI dashboard.

### Step 1: Load zone configs

Run `node pipeline/update-listings.js plan` to get the full list of zones with their search parameters.

### Step 2: Scrape listings for each city

Dispatch 3 parallel agents (one per city) to gather listings. Each agent should:

For each zone in their city:
1. **WebFetch** the Yad2 search URL: `https://www.yad2.co.il/realestate/forsale?topArea={topAreaId}&area={areaId}&city={cityId}&neighborhood={hoodId}&property=1`
   - Parse the `__NEXT_DATA__` JSON from the HTML (inside `<script id="__NEXT_DATA__">`)
   - Extract listings from the dehydrated React Query state
   - If WebFetch fails or returns CAPTCHA, fall back to WebSearch

2. **WebSearch** for `"דירות למכירה {hood} {cityName} yad2"` as fallback
   - Also search `"דירות למכירה {hood} {cityName} madlan"`
   - Extract listing details from search result snippets

3. For each listing found, extract:
   - `title`: street address (Hebrew)
   - `price`: in format "₪ X,XXX,XXX"
   - `rooms`: number
   - `sqm`: square meters
   - `floor`: floor number
   - `hood`: neighborhood name (Hebrew)
   - `source`: "Yad2" or "Madlan"
   - `url`: link to the listing
   - `meta`: formatted string like "3 ח' · 75 מ״ר · ק' 2"

4. Return results as JSON: `{ "zoneId": [listing, listing, ...], ... }`

### Step 3: Merge and write

Collect results from all 3 agents, merge into one object, and write to a temp file. Then run:
```
node pipeline/update-listings.js write /tmp/fresh-listings.json
```

### Step 4: Commit and push

```
git add givatayim-pinui-radar/listings.json
git commit -m "daily: update listings $(date +%Y-%m-%d)"
git push
```

### Important notes

- Aim for 5-20 listings per zone. Some zones may have 0 (that's OK for less active areas).
- Deduplicate: same address + same price = same listing (keep the one with more data).
- If a source is completely blocked, skip it and use others. Partial data > no data.
- The total should be 100+ listings across all zones. If less than 50, something is wrong.
