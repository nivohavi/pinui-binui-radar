#!/usr/bin/env node
// run.js — Orchestrator for the daily scraping pipeline

const { getCityConfigs, getAllZones } = require('./config');
const madlan = require('./scrapers/madlan');
const yad2 = require('./scrapers/yad2');
const { ZoneMatcher } = require('./matchers/zone-matcher');
const { build } = require('./outputs/build-listings');

const args = process.argv.slice(2);
const sourceFlag = args.find(a => a.startsWith('--source='));
const source = sourceFlag ? sourceFlag.split('=')[1] : 'all';
const outputFileFlag = args.find(a => a.startsWith('--output-file='));
const outputFile = outputFileFlag ? outputFileFlag.split('=')[1] : 'listings.json';
const dryRun = args.includes('--dry-run');

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  התחדשות.AI — Daily Scrape Pipeline');
  console.log('  ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════\n');

  const cityConfigs = getCityConfigs();
  const allZones = getAllZones();
  console.log(`Loaded ${allZones.length} zones across ${cityConfigs.length} cities\n`);

  const allListings = [];
  const sources = [];

  // Madlan scrape
  if (source === 'all' || source === 'madlan') {
    try {
      const madlanListings = await madlan.scrapeAll(cityConfigs);
      allListings.push(...madlanListings);
      if (madlanListings.length > 0) sources.push('Madlan');
    } catch (err) {
      console.error('[Madlan] FAILED:', err.message);
    }
    console.log('');
  }

  // Yad2 scrape
  if (source === 'all' || source === 'yad2') {
    try {
      const yad2Listings = await yad2.scrapeAll(cityConfigs, allZones);
      allListings.push(...yad2Listings);
      if (yad2Listings.length > 0) sources.push('Yad2');
    } catch (err) {
      console.error('[Yad2] FAILED:', err.message);
    }
    console.log('');
  }

  console.log(`\nTotal scraped: ${allListings.length} listings from ${sources.join(' + ') || 'no sources'}\n`);

  if (allListings.length === 0) {
    console.error('No listings scraped. Aborting.');
    process.exit(1);
  }

  // Match to zones
  const matcher = new ZoneMatcher();
  const byZone = matcher.matchAll(allListings);

  if (dryRun) {
    console.log('\n[DRY RUN] Would write:');
    for (const [zoneId, listings] of Object.entries(byZone)) {
      console.log(`  ${zoneId}: ${listings.length} listings`);
    }
    console.log('\nDry run complete. No files written.');
    return;
  }

  // Build and write listings.json
  const success = build(byZone, sources, outputFile);
  if (!success) {
    console.error('Build failed. Aborting.');
    process.exit(1);
  }

  console.log('\n✓ Pipeline complete.');
}

main().catch(err => {
  console.error('Pipeline crashed:', err);
  process.exit(1);
});
