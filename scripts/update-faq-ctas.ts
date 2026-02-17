/**
 * Update FAQ CTA labels and URLs from CSV.
 * Usage: npx tsx scripts/update-faq-ctas.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import Airtable from 'airtable';

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;

if (!baseId || !apiKey) {
  console.error('AIRTABLE_BASE_ID and AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

const CSV_PATH = path.join(
  process.cwd(),
  '..',
  '..',
  'Shortsleeve_CTA_Updates.csv'
);

function parseCSV(content: string): { question: string; cta_label: string; cta_url: string }[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const rows: { question: string; cta_label: string; cta_url: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parsed: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' && !inQuotes) || char === '\r') {
        parsed.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parsed.push(current.trim());

    if (parsed.length >= 3) {
      rows.push({
        question: parsed[0],
        cta_label: parsed[1],
        cta_url: parsed[2] || '',
      });
    }
  }
  return rows;
}

async function getAllFAQs(): Promise<{ id: string; question: string }[]> {
  const records: { id: string; question: string }[] = [];
  await base('FAQ')
    .select({ fields: ['question'] })
    .eachPage((pageRecords, fetchNextPage) => {
      for (const r of pageRecords) {
        const f = r.fields as Record<string, unknown>;
        records.push({
          id: r.id,
          question: (f.question as string) ?? '',
        });
      }
      fetchNextPage();
    });
  return records;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found at:', CSV_PATH);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const updates = parseCSV(csvContent);
  console.log(`Loaded ${updates.length} rows from CSV`);

  const faqs = await getAllFAQs();
  console.log(`Fetched ${faqs.length} FAQs from Airtable`);

  const questionToIds = new Map<string, string[]>();
  for (const faq of faqs) {
    const q = faq.question.trim();
    if (!questionToIds.has(q)) questionToIds.set(q, []);
    questionToIds.get(q)!.push(faq.id);
  }

  let updated = 0;
  let notFound = 0;

  for (const row of updates) {
    const ids = questionToIds.get(row.question.trim());
    if (!ids || ids.length === 0) {
      console.log(`  Not found: "${row.question.slice(0, 50)}..."`);
      notFound++;
      continue;
    }

    const fields: Record<string, string> = {
      cta_label: row.cta_label,
      cta_url: row.cta_url,
    };

    for (const id of ids) {
      await base('FAQ').update(id, fields);
      console.log(`  Updated: "${row.question.slice(0, 50)}..." -> ${row.cta_label}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated} record(s), ${notFound} not found.`);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
