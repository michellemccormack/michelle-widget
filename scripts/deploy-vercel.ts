/**
 * Deploy to Vercel production.
 * Env vars should already be set in Vercel Dashboard (one-time setup).
 *
 * Usage: npx tsx scripts/deploy-vercel.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const projectRoot = path.join(__dirname, '..');

function main() {
  console.log('Deploying to Vercel...\n');

  try {
    const output = execSync('vercel --prod --yes', {
      encoding: 'utf-8',
      cwd: projectRoot,
    });
    console.log(output);
    console.log('Done.');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('token') || msg.includes('login')) {
      console.error('Run "vercel login" first.');
      process.exit(1);
    }
    throw err;
  }
}

try {
  main();
} catch (err) {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
}
