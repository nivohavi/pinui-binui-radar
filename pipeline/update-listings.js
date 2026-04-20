#!/usr/bin/env node
// update-listings.js — Agent-driven listing updater
// Run via: node pipeline/update-listings.js
// Or via Claude Code: ! node pipeline/update-listings.js
//
// This script is meant to be called BY a Claude Code agent that will:
// 1. Read the zone configs from this script's output
// 2. Use WebFetch/WebSearch to gather listings per zone
// 3. Write results back to listings.json
//
// This file just provides the zone configs and the output writer.

const fs = require('fs');
const path = require('path');
const { getAllZones, getCityConfigs } = require('./config');

const OUTPUT_PATH = path.join(__dirname, '..', 'givatayim-pinui-radar', 'listings.json');

// Print zone search instructions for the agent
function printSearchPlan() {
  const zones = getAllZones();
  const cities = getCityConfigs();

  console.log(JSON.stringify({
    instruction: 'SEARCH_PLAN',
    totalZones: zones.length,
    cities: cities.map(c => ({
      slug: c.slug,
      name: c.name,
      madlanSlug: c.searchCodes.madlanSlug,
      yad2CityId: c.searchCodes.yad2CityId,
      nadlanCity: c.searchCodes.nadlanCity
    })),
    zones: zones.map(z => ({
      zoneId: z.zoneId,
      citySlug: z.citySlug,
      cityName: z.cityName,
      hood: z.hood,
      address: z.address,
      name: z.name,
      yad2HoodId: z.yad2HoodId
    }))
  }, null, 2));
}

// Write listings.json from agent-provided data
function writeListings(data) {
  const output = {
    _meta: {
      updated: new Date().toISOString().slice(0, 10),
      source: 'Claude Code agents (WebFetch + WebSearch)',
      note: 'עודכן אוטומטית באמצעות סוכני AI. דירות ממופות לפי שכונה לאזורי פינוי-בינוי.'
    },
    byZone: data
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

  let total = 0;
  for (const listings of Object.values(data)) total += listings.length;
  console.log(`Wrote ${total} listings across ${Object.keys(data).length} zones to listings.json`);
}

// CLI
const cmd = process.argv[2];
if (cmd === 'plan') {
  printSearchPlan();
} else if (cmd === 'write') {
  const inputFile = process.argv[3];
  if (!inputFile) { console.error('Usage: node update-listings.js write <input.json>'); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  writeListings(data);
} else {
  console.log('Usage:');
  console.log('  node update-listings.js plan    — Print search plan for agent');
  console.log('  node update-listings.js write <file.json> — Write listings from agent results');
}
