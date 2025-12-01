#!/usr/bin/env node
/**
 * Generates build info JSON file with timestamp, hostname, and git SHA.
 * Run this before building to embed build metadata in the app.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const buildInfo = {
  timestamp: new Date().toISOString(),
  host: os.hostname(),
  gitSha: 'unknown',
  gitShaShort: 'unknown',
};

try {
  buildInfo.gitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  buildInfo.gitShaShort = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  console.warn('Could not get git SHA:', e.message);
}

const outputPath = path.join(__dirname, '..', 'app', 'buildInfo.json');
fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2) + '\n');
console.log('Build info generated:', outputPath);
console.log(JSON.stringify(buildInfo, null, 2));
