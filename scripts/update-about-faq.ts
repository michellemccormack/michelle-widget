/**
 * Update "Tell me about About" FAQ short_answer.
 * Usage: npx tsx scripts/update-about-faq.ts
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

const NEW_SHORT_ANSWER =
  'Michelle McCormack is a media consultant with 20+ years shaping how brands and ideas show up publicly. Based in New York and Boston, she works across culture, brands, and politics.';

async function main() {
  const records: { id: string; question: string }[] = [];

  await base('FAQ')
    .select({
      filterByFormula: "AND({status} = 'LIVE', LOWER({question}) = 'tell me about about')",
      maxRecords: 5,
    })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        records.push({ id: r.id, question: (r.fields as { question?: string }).question || '' });
      }
      fetchNextPage();
    });

  if (records.length === 0) {
    console.error('No "Tell me about About" FAQ found.');
    process.exit(1);
  }

  for (const rec of records) {
    await base('FAQ').update(rec.id, { short_answer: NEW_SHORT_ANSWER });
    console.log(`Updated: "${rec.question}"`);
  }

  await cacheUtils.del(CACHE_KEYS.faqs());
  console.log('\nUpdated short_answer. Cleared FAQ cache.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
