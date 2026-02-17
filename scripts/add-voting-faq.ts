/**
 * Add a new "voting" FAQ to Airtable.
 * Usage: npx tsx scripts/add-voting-faq.ts
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

const shortAnswer =
  'You can register to vote in Massachusetts online at sec.state.ma.us, in person at your city/town hall, or by mail. Registration deadline is 10 days before Election Day. You must be 18+, a US citizen, and a Massachusetts resident.';

async function main() {
  const record = await base('FAQ').create(
    {
      question: 'voting',
      category: 'Voter Info',
      short_answer: shortAnswer,
      long_answer: shortAnswer,
      keywords: ['vote', 'voting', 'register', 'registration', 'ballot', 'election'],
      cta_label: 'Register to Vote',
      cta_url: 'https://www.sec.state.ma.us/divisions/elections/voter-resources/registering-to-vote.htm',
      status: 'LIVE',
      priority: 51,
    },
    { typecast: true }
  );

  await cacheUtils.del(CACHE_KEYS.faqs());
  console.log('Created FAQ:', record.id);
  console.log('Cleared FAQ cache.');
  console.log('');
  console.log('Next: run "npm run sync-embeddings" to generate an embedding for this FAQ so it can match queries.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
