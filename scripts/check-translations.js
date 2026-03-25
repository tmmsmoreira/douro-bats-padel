#!/usr/bin/env node

/**
 * Script to check for unused translation keys in the codebase
 * Usage: node scripts/check-translations.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load translation files
const enPath = path.join(__dirname, '../apps/web/src/i18n/dictionaries/en.json');
const ptPath = path.join(__dirname, '../apps/web/src/i18n/dictionaries/pt.json');

const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ptTranslations = JSON.parse(fs.readFileSync(ptPath, 'utf8'));

// Function to get all keys from nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get all translation keys
const enKeys = getAllKeys(enTranslations);
const ptKeys = getAllKeys(ptTranslations);

console.log(`\n📊 Translation Keys Analysis\n`);
console.log(`Total EN keys: ${enKeys.length}`);
console.log(`Total PT keys: ${ptKeys.length}`);

// Check for keys in EN but not in PT
const missingInPt = enKeys.filter((key) => !ptKeys.includes(key));
if (missingInPt.length > 0) {
  console.log(`\n⚠️  Keys in EN but missing in PT (${missingInPt.length}):`);
  missingInPt.forEach((key) => console.log(`  - ${key}`));
}

// Check for keys in PT but not in EN
const missingInEn = ptKeys.filter((key) => !enKeys.includes(key));
if (missingInEn.length > 0) {
  console.log(`\n⚠️  Keys in PT but missing in EN (${missingInEn.length}):`);
  missingInEn.forEach((key) => console.log(`  - ${key}`));
}

// Check for unused keys
console.log(`\n🔍 Checking for unused translation keys...\n`);

const srcPath = path.join(__dirname, '../apps/web/src');
const unusedKeys = [];

for (const key of enKeys) {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];

  try {
    // Search for the key usage in the codebase
    const result = execSync(
      `grep -r "t('${lastPart}')" "${srcPath}" --include="*.tsx" --include="*.ts" || true`,
      { encoding: 'utf8' }
    );

    if (!result.trim()) {
      unusedKeys.push(key);
    }
  } catch (error) {
    // If grep fails, consider it unused
    unusedKeys.push(key);
  }
}

if (unusedKeys.length > 0) {
  console.log(`❌ Potentially unused keys (${unusedKeys.length}):\n`);

  // Group by namespace
  const grouped = {};
  unusedKeys.forEach((key) => {
    const namespace = key.split('.')[0];
    if (!grouped[namespace]) {
      grouped[namespace] = [];
    }
    grouped[namespace].push(key);
  });

  Object.entries(grouped).forEach(([namespace, keys]) => {
    console.log(`\n  ${namespace} (${keys.length}):`);
    keys.forEach((key) => console.log(`    - ${key}`));
  });
} else {
  console.log(`✅ All translation keys appear to be in use!`);
}

console.log(`\n✨ Analysis complete!\n`);
