/**
 * Update Michelle Config in Airtable (brand_name, welcome_message, contact_cta_label).
 * Usage: npx tsx scripts/update-michelle-config.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import Airtable from 'airtable';
import { cacheUtils, CACHE_KEYS } from '../src/lib/redis';
import { MICHELLE_BASE_ID } from './airtable-base';

const apiKey = process.env.AIRTABLE_API_KEY;

if (!apiKey) {
  console.error('AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(MICHELLE_BASE_ID);

const MICHELLE_CONFIG: Record<string, string> = {
  brand_name: 'Michelle McCormack',
  welcome_message:
    "Hi! I'm here to help you learn about Michelle and the AI Agent Assistant she built. How can I help?",
  contact_cta_label: 'Schedule a Call',
};

async function upsertConfig(key: string, value: string) {
  const records: { id: string }[] = [];
  await base('Config')
    .select({ filterByFormula: `{key} = "${key}"` })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) records.push({ id: r.id });
      fetchNextPage();
    });

  if (records.length > 0) {
    await base('Config').update(records[0].id, { value });
    console.log(`  Updated ${key}`);
  } else {
    await base('Config').create({ key, value });
    console.log(`  Created ${key}`);
  }
}

async function main() {
  console.log('Updating Michelle Config in Airtable...\n');

  for (const [key, value] of Object.entries(MICHELLE_CONFIG)) {
    await upsertConfig(key, value);
  }

  await cacheUtils.del(CACHE_KEYS.config());
  console.log('\nCleared config cache. Changes will appear immediately.');
  console.log('\nNew values:');
  for (const [key, value] of Object.entries(MICHELLE_CONFIG)) {
    console.log(`  ${key}: ${value}`);
  }
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
