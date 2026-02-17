/**
 * Update the "How can I register to vote?" FAQ row in Airtable.
 * Usage: npx tsx scripts/update-voter-faq.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import Airtable from 'airtable';
import { cacheUtils, CACHE_KEYS } from '../src/lib/redis';

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;

if (!baseId || !apiKey) {
  console.error('AIRTABLE_BASE_ID and AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function main() {
  const records = await base('FAQ')
    .select({
      filterByFormula: "{question} = 'How can I register to vote?'",
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) {
    console.error('No FAQ found with question "How can I register to vote?"');
    process.exit(1);
  }

  const record = records[0];
  const keywords = [
    'vote',
    'voting',
    'register',
    'registration',
    'ballot',
    'election',
    'polling',
    'voter',
    'how to vote',
    'where to vote',
  ];
  await base('FAQ').update(
    record.id,
    {
      cta_label: 'Register to Vote',
      cta_url: 'https://www.sec.state.ma.us/divisions/elections/voter-resources/registering-to-vote.htm',
      keywords,
    },
    { typecast: true }
  );

  await cacheUtils.del(CACHE_KEYS.faqs());
  console.log('Updated FAQ:', record.id);
  console.log('Cleared FAQ cache - fresh data will load on next request.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
