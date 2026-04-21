const fs = require('fs');
const path = require('path');

const OLD_DATA_PATH = path.join(__dirname, 'givatayim-pinui-radar', 'data_v1.json');
const NEW_DATA_PATH = path.join(__dirname, 'givatayim-pinui-radar', 'listings-test.json');
const OUTPUT_PATH = path.join(__dirname, 'givatayim-pinui-radar', 'data_v1.json');

function merge() {
  if (!fs.existsSync(OLD_DATA_PATH)) {
    console.error('Old data file not found at:', OLD_DATA_PATH);
    return;
  }
  if (!fs.existsSync(NEW_DATA_PATH)) {
    console.error('New data file not found at:', NEW_DATA_PATH);
    return;
  }

  const oldData = JSON.parse(fs.readFileSync(OLD_DATA_PATH, 'utf8'));
  const newData = JSON.parse(fs.readFileSync(NEW_DATA_PATH, 'utf8'));

  const combinedByZone = { ...oldData.byZone };

  for (const [zoneId, listings] of Object.entries(newData.byZone)) {
    if (!combinedByZone[zoneId]) {
      combinedByZone[zoneId] = [];
    }
    
    // Add new listings to the existing ones
    combinedByZone[zoneId] = [...combinedByZone[zoneId], ...listings];

    // Simple dedupe by URL
    const seenUrls = new Set();
    combinedByZone[zoneId] = combinedByZone[zoneId].filter(l => {
      if (seenUrls.has(l.url)) return false;
      seenUrls.add(l.url);
      return true;
    });

    // Limit to 40 per zone (increased to show more)
    combinedByZone[zoneId] = combinedByZone[zoneId].slice(0, 40);
  }

  const output = {
    ...oldData,
    byZone: combinedByZone,
    _meta: {
      ...oldData._meta,
      updated: new Date().toISOString().slice(0, 10),
      note: 'Merged with new Yad2 results (1000+ extracted).'
    }
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Successfully merged listings into ${OUTPUT_PATH}`);
}

merge();
