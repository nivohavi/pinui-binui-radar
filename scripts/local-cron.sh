#!/bin/bash
# local-cron.sh — Daily scrape runner for Mac launchd
# Runs the pipeline and commits changes if any

set -e
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

REPO_DIR="/Users/nivo/Documents/pinui-binui-radar"
PIPELINE_DIR="$REPO_DIR/pipeline"
LOG_FILE="/tmp/pinui-scrape-$(date +%Y%m%d).log"

echo "=== Pinui-Binui Scrape: $(date) ===" >> "$LOG_FILE"

cd "$PIPELINE_DIR"

# Pull latest
cd "$REPO_DIR"
git pull --rebase >> "$LOG_FILE" 2>&1

# Install deps if needed
cd "$PIPELINE_DIR"
npm ci --silent >> "$LOG_FILE" 2>&1

# Run pipeline
node run.js >> "$LOG_FILE" 2>&1

# Commit if changed
cd "$REPO_DIR"
if ! git diff --quiet givatayim-pinui-radar/listings.json; then
  git add givatayim-pinui-radar/listings.json
  git commit -m "daily: update listings $(date +%Y-%m-%d) [local]" >> "$LOG_FILE" 2>&1
  git push >> "$LOG_FILE" 2>&1
  echo "✓ Committed and pushed" >> "$LOG_FILE"
else
  echo "No changes detected" >> "$LOG_FILE"
fi

echo "=== Done: $(date) ===" >> "$LOG_FILE"
