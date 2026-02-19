/**
 * Update Airtable for multiple CTAs support.
 * 1. Adds contact_ctas to Config table (JSON array of {label, url})
 * 2. Updates "Tell me about Pricing" (or similar) FAQ with two CTAs via ctas JSON field
 *
 * Prerequisites: Add "ctas" column (Long text) to FAQ table in Airtable.
 * Usage: npx tsx scripts/update-multiple-ctas.ts
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

const CONTACT_CTAS = [
  { label: 'Schedule a Call', url: 'https://calendly.com/michellemarion/new-meeting' },
  { label: 'Email Michelle', url: 'mailto:michellemarion@gmail.com' },
];

async function upsertConfigContactCtas() {
  let recordId: string | null = null;

  await base('Config')
    .select({ filterByFormula: '{key} = "contact_ctas"' })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) recordId = r.id;
      fetchNextPage();
    });

  const value = JSON.stringify(CONTACT_CTAS);

  if (recordId) {
    await base('Config').update(recordId, { value });
    console.log('Updated existing contact_ctas in Config.');
  } else {
    await base('Config').create({ key: 'contact_ctas', value });
    console.log('Created contact_ctas in Config.');
  }
  console.log('Value:', value);
}

async function updateHowDoIGetStartedFaq() {
  const records: { id: string; question: string }[] = [];

  await base('FAQ')
    .select({
      filterByFormula: "OR(LOWER({question}) = 'how do i get started?', FIND('get started', LOWER({question})) > 0, {question} = 'Tell me about Contact', {question} = 'Tell me about Pricing')",
      maxRecords: 10,
    })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        records.push({ id: r.id, question: (r.fields as { question?: string }).question || '' });
      }
      fetchNextPage();
    });

  const exact = records.find((r) => r.question.toLowerCase() === 'how do i get started?');
  const target = exact || records[0];

  if (!target) {
    console.warn('FAQ "How do I get started?" or "Tell me about Pricing" not found. Add "ctas" column (Long text) to FAQ table, then re-run.');
    return;
  }

  const ctasValue = JSON.stringify([
    { label: 'Schedule a Call', url: 'https://calendly.com/michellemarion/new-meeting' },
    { label: 'Email Michelle', url: 'mailto:michellemarion@gmail.com' },
  ]);

  try {
    await base('FAQ').update(target.id, { ctas: ctasValue });
    console.log(`Updated "${target.question}" FAQ with two CTAs.`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ctas')) {
      console.warn('\n"ctas" column not found. Add a "ctas" column (Long text) to the FAQ table in Airtable, then re-run.');
      console.warn('For now, setting single CTA (Schedule a Call)...');
      await base('FAQ').update(target.id, {
        cta_label: 'Schedule a Call',
        cta_url: 'https://calendly.com/michellemarion/new-meeting',
      });
      console.log(`Updated "${target.question}" with single CTA. Add "ctas" column for two buttons.`);
    } else {
      throw err;
    }
  }
}

async function main() {
  console.log('Before running: Add "ctas" column (Long text) to FAQ table in Airtable.\n');

  console.log('Updating Config contact_ctas...');
  await upsertConfigContactCtas();

  console.log('\nUpdating "How do I get started?" FAQ...');
  await updateHowDoIGetStartedFaq();

  await cacheUtils.del(CACHE_KEYS.config());
  console.log('\nCleared config cache. Restart dev server to see changes.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
