/**
 * Update FAQs with blank cta_url (email capture) to cta_label = 'Stay Updated'.
 * Keeps other CTAs unchanged (Donate Now, Sign Up to Volunteer, Register to Vote, etc.)
 * Usage: npx tsx scripts/update-stay-updated-ctas.ts
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
  const records: { id: string; question: string; cta_label?: string; cta_url?: string }[] = [];

  await base('FAQ')
    .select({ fields: ['question', 'cta_label', 'cta_url'] })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        const f = r.fields as Record<string, unknown>;
        const ctaUrl = f.cta_url;
        const isBlank = ctaUrl === undefined || ctaUrl === null || String(ctaUrl).trim() === '';
        if (isBlank) {
          records.push({
            id: r.id,
            question: (f.question as string) ?? '',
            cta_label: f.cta_label as string | undefined,
            cta_url: f.cta_url as string | undefined,
          });
        }
      }
      fetchNextPage();
    });

  console.log(`Found ${records.length} FAQ(s) with blank cta_url (email capture)`);

  let updated = 0;
  for (const rec of records) {
    await base('FAQ').update(rec.id, { cta_label: 'Stay Updated' });
    console.log(`  Updated: "${rec.question.slice(0, 50)}${rec.question.length > 50 ? '...' : ''}" -> Stay Updated`);
    updated++;
  }

  await cacheUtils.del(CACHE_KEYS.faqs());
  console.log(`\nDone. Updated ${updated} record(s). Cleared FAQ cache.`);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
