/**
 * CLI script to batch-generate embeddings for all FAQs.
 * Runs standalone - no dev server needed.
 * Usage: npm run sync-embeddings
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import Airtable from 'airtable';
import OpenAI from 'openai';
import { cacheUtils, CACHE_KEYS } from '../src/lib/redis';

import { MICHELLE_BASE_ID } from './airtable-base';

const apiKey = process.env.AIRTABLE_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}
if (!openaiKey) {
  console.error('OPENAI_API_KEY required in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(MICHELLE_BASE_ID);
const openai = new OpenAI({ apiKey: openaiKey });

async function getFAQs() {
  const records: { id: string; question: string; embedding?: unknown }[] = [];
  await base('FAQ')
    .select({ filterByFormula: '{status} = "LIVE"', sort: [{ field: 'priority', direction: 'desc' }] })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        const f = r.fields as Record<string, unknown>;
        records.push({
          id: r.id,
          question: (f.question as string) ?? '',
          embedding: f.embedding,
        });
      }
      fetchNextPage();
    });
  return records;
}

function hasEmbedding(embedding: unknown): boolean {
  if (typeof embedding === 'string') {
    try {
      const arr = JSON.parse(embedding);
      return Array.isArray(arr) && arr.length > 0;
    } catch {
      return false;
    }
  }
  return Array.isArray(embedding) && embedding.length > 0;
}

async function main() {
  console.log('Syncing embeddings...');

  const faqs = await getFAQs();
  const toProcess = faqs.filter((f) => !hasEmbedding(f.embedding));

  if (toProcess.length === 0) {
    console.log('All FAQs already have embeddings. Total:', faqs.length);
    await cacheUtils.del(CACHE_KEYS.faqs());
    console.log('Cleared FAQ cache.');
    return;
  }

  console.log(`Generating embeddings for ${toProcess.length} FAQs...`);

  const texts = toProcess.map((f) => f.question);
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map((t) => t.slice(0, 8000)),
  });

  const embeddings = response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);

  for (let i = 0; i < toProcess.length; i++) {
    const faq = toProcess[i];
    const embedding = embeddings[i];
    if (embedding) {
      await base('FAQ').update(faq.id, { embedding: JSON.stringify(embedding) });
      console.log(`  Updated: ${faq.question.slice(0, 50)}...`);
    }
  }

  await cacheUtils.del(CACHE_KEYS.faqs());
  console.log('Success! Updated', toProcess.length, 'FAQs. Total:', faqs.length);
  console.log('Cleared FAQ cache.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
