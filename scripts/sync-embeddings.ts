/**
 * CLI script to batch-generate embeddings for all FAQs.
 * Usage: npm run sync-embeddings
 * Requires: SYNC_TOKEN env var. Set in .env.local or pass inline.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SYNC_TOKEN = process.env.SYNC_TOKEN;

async function main() {
  if (!SYNC_TOKEN) {
    console.error('SYNC_TOKEN is required. Set it in .env.local');
    process.exit(1);
  }

  console.log('Syncing embeddings...');
  const res = await fetch(`${API_URL}/api/embeddings/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SYNC_TOKEN}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Error:', data.error || res.statusText);
    process.exit(1);
  }

  console.log('Success:', data);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
