/**
 * Update welcome_message in Airtable Config table.
 * Usage: npx tsx scripts/update-welcome-message.ts
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

const NEW_WELCOME_MESSAGE =
  "Hi! I'm here to help you learn about Michelle and the AI Agent Assistant she built. How can I help?";

async function main() {
  let recordId: string | null = null;

  await base('Config')
    .select({ filterByFormula: '{key} = "welcome_message"' })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        recordId = r.id;
      }
      fetchNextPage();
    });

  if (!recordId) {
    console.error('No welcome_message row found in Config table. Create one with key="welcome_message".');
    process.exit(1);
  }

  await base('Config').update(recordId, { value: NEW_WELCOME_MESSAGE });
  console.log('Updated welcome_message in Config table.');
  console.log('New value:', NEW_WELCOME_MESSAGE);

  await cacheUtils.del(CACHE_KEYS.config());
  console.log('Cleared config cache so changes appear immediately.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
