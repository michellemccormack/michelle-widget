/**
 * Remove campaign/voter-specific FAQs from Michelle Widget Airtable.
 * Usage: npx tsx scripts/remove-campaign-faqs.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import Airtable from 'airtable';
import { MICHELLE_BASE_ID } from './airtable-base';

const apiKey = process.env.AIRTABLE_API_KEY;

if (!apiKey) {
  console.error('AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(MICHELLE_BASE_ID);

const TO_REMOVE = [
  'Can voters donate through the widget?',
  'Can it handle negative questions or attacks?',
  'Does it integrate with my CRM or email list?',
  'What platforms does it work on?',
  'How does the AI know about my candidate?',
];

async function main() {
  const toDelete: string[] = [];
  await base('FAQ')
    .select()
    .eachPage((records, fetchNextPage) => {
      for (const r of records) {
        const q = (r.fields as Record<string, unknown>).question as string;
        if (q && TO_REMOVE.includes(q.trim())) toDelete.push(r.id);
      }
      fetchNextPage();
    });
  console.log(`Removing ${toDelete.length} campaign-specific FAQs...`);
  for (const id of toDelete) {
    await base('FAQ').destroy(id);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
