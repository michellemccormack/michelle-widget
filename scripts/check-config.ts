/**
 * Debug script: fetch config from Airtable and print it.
 * Usage: npx tsx scripts/check-config.ts
 * Verifies Airtable connection and Config table data.
 * Uses raw fetch first to show exact API response, then tries SDK.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MICHELLE_BASE_ID } from './airtable-base';

const apiKey = process.env.AIRTABLE_API_KEY;

if (!apiKey) {
  console.error('AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}

console.log('Token type:', apiKey.startsWith('pat') ? 'PAT' : apiKey.startsWith('key') ? 'Legacy key' : 'Other');
console.log('Base ID:', MICHELLE_BASE_ID);

async function main() {
  // Try meta API first - lists bases the token can access
  console.log('\n1. Testing token (list bases)...');
  const metaRes = await fetch('https://api.airtable.com/v0/meta/bases', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const metaText = await metaRes.text();
  console.log('   Meta Status:', metaRes.status);
  if (metaRes.ok) {
    const meta = JSON.parse(metaText);
    const bases = meta.bases || [];
    console.log('   Bases accessible:', bases.length);
    const match = bases.find((b: { id: string }) => b.id === MICHELLE_BASE_ID);
    console.log('   Base', MICHELLE_BASE_ID, 'in list?', match ? 'YES' : 'NO');
  } else {
    console.log('   Meta Response:', metaText.slice(0, 300));
  }

  // Try FAQ table
  const faqUrl = `https://api.airtable.com/v0/${MICHELLE_BASE_ID}/FAQ?maxRecords=3`;
  console.log('\n2. Testing FAQ table...');
  const faqRes = await fetch(faqUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const faqText = await faqRes.text();
  console.log('   FAQ Status:', faqRes.status, faqRes.statusText);
  if (!faqRes.ok) {
    console.log('   FAQ Response:', faqText.slice(0, 300));
  } else {
    const faqData = JSON.parse(faqText);
    console.log('   FAQ records:', faqData.records?.length ?? 0);
  }

  // Try Config table
  const url = `https://api.airtable.com/v0/${MICHELLE_BASE_ID}/Config?maxRecords=50`;
  console.log('\n3. Testing Config table...');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  console.log('   Config Status:', res.status, res.statusText);
  if (!res.ok) {
    console.log('   Config Response:', text.slice(0, 500));
    throw new Error(`Airtable API returned ${res.status}`);
  }
  const data = JSON.parse(text);
  const records = data.records || [];
  console.log('   Config records:', records.length);

  const config: Record<string, string> = {};
  for (const r of records) {
    const f = r.fields || {};
    config[f.key ?? ''] = f.value ?? '';
  }

  console.log('\n4. Config table contents:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\nKey fields:');
  console.log('  brand_name:', config.brand_name || '(missing)');
  console.log('  welcome_message:', config.welcome_message || '(missing)');
  console.log('  theme:', config.theme || '(missing)');
}

main().catch((err: Error) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
