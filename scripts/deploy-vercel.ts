/**
 * Deploy to Vercel production and add env vars from .env.local
 * Prerequisite: Run `vercel login` first
 *
 * Usage: npx tsx scripts/deploy-vercel.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');

const ENV_KEYS = [
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'OPENAI_API_KEY',
  'SERPER_API_KEY',
  'WEB_SEARCH_ENABLED',
  'ALLOWED_ORIGINS',
  'RATE_LIMIT_MAX',
  'RATE_LIMIT_WINDOW_MS',
  'SYNC_TOKEN',
  'NEXT_PUBLIC_WIDGET_URL',
  'NEXT_PUBLIC_API_URL',
  'LOG_LEVEL',
];

function run(cmd: string, options?: { cwd?: string }): string {
  return execSync(cmd, {
    encoding: 'utf-8',
    cwd: options?.cwd ?? projectRoot,
  });
}

function main() {
  console.log('=== Step 1: Deploying to Vercel ===\n');

  let deployOutput: string;
  try {
    deployOutput = run('vercel --prod --yes');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('token') || msg.includes('login')) {
      console.error('Please run "vercel login" first to authenticate.\n');
      process.exit(1);
    }
    throw err;
  }

  console.log(deployOutput);

  const urlMatch = deployOutput.match(/https:\/\/[a-zA-Z0-9.-]+\.vercel\.app/g);
  const prodUrl = urlMatch ? urlMatch[urlMatch.length - 1] : null;

  if (!prodUrl) {
    console.error('Could not detect deployment URL from output.');
    process.exit(1);
  }

  console.log('\nProduction URL:', prodUrl);

  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found. Add env vars manually in Vercel Dashboard.');
    process.exit(1);
  }

  console.log('\n=== Step 2: Adding environment variables ===\n');

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^["']|["']$/g, '');
    env[key] = value;
  }

  env['NEXT_PUBLIC_WIDGET_URL'] = prodUrl;
  env['NEXT_PUBLIC_API_URL'] = `${prodUrl}/api`;

  for (const key of ENV_KEYS) {
    const value = env[key] ?? process.env[key];
    if (!value) continue;

    try {
      const result = spawnSync('vercel', ['env', 'add', key, 'production', '--force'], {
        cwd: projectRoot,
        input: value,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (result.status === 0) {
        console.log(`  Added: ${key}`);
      }
    } catch {
      // May already exist or fail
    }
  }

  console.log('\n=== Step 3: Redeploying with env vars ===\n');
  run('vercel --prod --yes');

  console.log('\n=== Done! Your app is live at:', prodUrl, '===\n');
}

try {
  main();
} catch (err) {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
}
