/**
 * Import Michelle Config and FAQ data into the Michelle Widget Airtable base.
 * Before running: Add category options to FAQ table in Airtable (see IMPORT_INSTRUCTIONS.md)
 * Usage: npx tsx scripts/import-michelle-data.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import Airtable from 'airtable';
import { MICHELLE_BASE_ID } from './airtable-base';

const apiKey = process.env.AIRTABLE_API_KEY;
const CSV_DIR = '/Users/michellem/Desktop/files';

// Only these 6 categories - map all others to the closest match
const ALLOWED_CATEGORIES = ['About', 'Services', 'AI Assistant', 'Portfolio', 'Features', 'Contact'];
const CATEGORY_MAP: Record<string, string> = {
  About: 'About',
  Services: 'Services',
  'AI Assistant': 'AI Assistant',
  Portfolio: 'Portfolio',
  Features: 'Features',
  Contact: 'Contact',
  Value: 'Services',
  Industries: 'Services',
  Customization: 'Features',
  Differentiation: 'Features',
  'Get Started': 'Contact',
  Background: 'About',
  Technology: 'AI Assistant',
  Integration: 'Features',
  Compatibility: 'Features',
  Support: 'Features',
  Pricing: 'Contact',
};

// Exclude campaign/voter-specific FAQs - Michelle's widget is about her consulting, not campaign features
const SKIP_QUESTIONS = new Set([
  'Can voters donate through the widget?',
  'Can it handle negative questions or attacks?',
  'Does it integrate with my CRM or email list?',
  'What platforms does it work on?',
  'How does the AI know about my candidate?',
]);

if (!apiKey) {
  console.error('AIRTABLE_API_KEY required in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(MICHELLE_BASE_ID);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
  return result;
}

interface ConfigRow {
  key: string;
  value: string;
}

interface FAQRow {
  question: string;
  category: string;
  short_answer: string;
  long_answer: string;
  keywords: string;
  cta_label: string;
  cta_url: string;
  priority: number;
  status: string;
}

function loadConfig(): ConfigRow[] {
  const content = fs.readFileSync(path.join(CSV_DIR, 'Michelle_Config.csv'), 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const rows: ConfigRow[] = [];
  const headers = parseCSVLine(lines[0]);
  const keyIdx = headers.indexOf('field') >= 0 ? headers.indexOf('field') : headers.indexOf('key');
  const valIdx = headers.indexOf('value');
  if (keyIdx < 0 || valIdx < 0) return [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals[keyIdx] && vals[valIdx] !== undefined) {
      rows.push({ key: vals[keyIdx], value: vals[valIdx] });
    }
  }
  return rows;
}

function loadFAQs(filePath: string): FAQRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows: FAQRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    const row: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? '';
    });
    const priority = typeof row.priority === 'number' ? row.priority : parseInt(String(row.priority || 0), 10) || 10;
    rows.push({
      question: String(row.question ?? ''),
      category: String(row.category ?? ''),
      short_answer: String(row.short_answer ?? ''),
      long_answer: String(row.long_answer ?? ''),
      keywords: String(row.keywords ?? ''),
      cta_label: String(row.cta_label ?? ''),
      cta_url: String(row.cta_url ?? ''),
      priority: isNaN(priority) ? 10 : priority,
      status: String(row.status ?? 'LIVE'),
    });
  }
  return rows;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`Importing Michelle data to Airtable (${MICHELLE_BASE_ID})...\n`);

  // 1. Config
  const configRows = loadConfig();
  console.log(`Importing ${configRows.length} Config rows...`);
  for (const row of configRows) {
    try {
      await base('Config').create({ key: row.key, value: row.value });
      await sleep(250);
    } catch (e) {
      console.error(`  Config "${row.key}":`, (e as Error).message);
    }
  }
  console.log('  Config done.\n');

  // 2. FAQs - merge both files, dedupe by question (QuickButton first for priority)
  const faq1 = loadFAQs(path.join(CSV_DIR, 'Michelle_FAQ.csv'));
  const faq2 = loadFAQs(path.join(CSV_DIR, 'Michelle_QuickButton_FAQs.csv'));
  const seen = new Set<string>();
  const allFAQs: FAQRow[] = [];
  for (const row of [...faq2, ...faq1]) {
    const q = row.question.trim().toLowerCase();
    if (seen.has(q)) continue;
    if (SKIP_QUESTIONS.has(row.question.trim())) continue;
    seen.add(q);
    allFAQs.push(row);
  }

  console.log(`Importing ${allFAQs.length} FAQ rows...`);
  for (const row of allFAQs) {
    try {
      const category = CATEGORY_MAP[row.category] || 'Features';
      const shortAnswer = row.short_answer;
      const longAnswer = row.long_answer;
      const fields: Record<string, unknown> = {
        question: row.question,
        category,
        short_answer: shortAnswer,
        status: (row.status || 'LIVE') as 'LIVE' | 'DRAFT',
        priority: row.priority,
      };
      if (longAnswer) fields.long_answer = longAnswer;
      if (row.cta_label) fields.cta_label = row.cta_label;
      if (row.cta_url) fields.cta_url = row.cta_url;
      await base('FAQ').create(fields);
      await sleep(250);
    } catch (e) {
      console.error(`  FAQ "${row.question.slice(0, 50)}...":`, (e as Error).message);
    }
  }
  console.log('  FAQs done.\n');

  console.log('Import complete. Run "npm run sync-embeddings" to generate embeddings.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
