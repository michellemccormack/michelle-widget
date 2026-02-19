/**
 * List all FAQ questions in Airtable.
 * Usage: npx tsx scripts/list-faqs.ts
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

async function main() {
  const records: { id: string; question: string; category: string }[] = [];
  await base('FAQ')
    .select({ filterByFormula: '{status} = "LIVE"', fields: ['question', 'category'] })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        const f = r.fields as { question?: string; category?: string };
        records.push({
          id: r.id,
          question: f.question || '',
          category: f.category || '',
        });
      }
      fetchNextPage();
    });

  console.log(`Found ${records.length} LIVE FAQs:\n`);
  records.forEach((r, i) => {
    console.log(`${i + 1}. "${r.question}" (${r.category}) [${r.id}]`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
