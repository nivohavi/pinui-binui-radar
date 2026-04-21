# Pinui-Binui Radar 🏙️

An interactive dashboard for tracking urban renewal (Pinui-Binui) projects and real estate listings in Givatayim, Ramat Gan, and Tel Aviv.

## 🚀 Updating Listings

The listing data is stored in `givatayim-pinui-radar/data_v1.json`. To refresh it with fresh data from Yad2 (our primary source), follow these steps:

### 1. Manual Refresh (Fast)
To update just the listings from Yad2 and see them in your dashboard immediately:
```bash
cd pipeline
node run.js --source=yad2 --output-file=data_v1.json
```

### 2. Automated Daily Refresh
To run the full cycle (Scrape, Merge, Build, Commit, and Push):
```bash
bash scripts/local-cron.sh
```

---

## 🏗️ Architecture

- **Dashboard:** Located in `givatayim-pinui-radar/`. A single-page application (`index.html`, `app.js`, `cities.js`) that visualizes project zones and available apartments.
- **Pipeline:** Located in `pipeline/`. A Node.js application that scrapes Yad2 and Madlan, matches listings to zones, and builds the `data_v1.json` data file.
- **Automation:** Located in `scripts/`. Contains a `local-cron.sh` script and a Mac `launchd` plist for daily automated updates.

## 🛠️ Key Files

- `givatayim-pinui-radar/data_v1.json`: The production data file containing all project and listing information.
- `pipeline/scrapers/yad2.js`: The high-yield Playwright scraper for Yad2 listings (~1,000+ extracted per run).
- `pipeline/outputs/build-listings.js`: Handles "Smart Merging" of new listings with existing ones.

## 📜 License
Private project. All rights reserved.
