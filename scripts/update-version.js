const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '../src/version.json');
const versionData = require(versionFilePath);

// Increment patch version (x.y.Z)
const versionParts = versionData.version.replace('v', '').split('.').map(Number);
versionParts[2] += 1;
const newVersion = `v${versionParts.join('.')}`;

// Get current time
const now = new Date();
const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// Update data
versionData.version = newVersion;
versionData.buildDate = dateStr;
versionData.buildTime = timeStr;

// Write back
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 4));

console.log(`Updated version to ${newVersion} at ${dateStr} ${timeStr}`);
