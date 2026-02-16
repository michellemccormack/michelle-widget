/**
 * POST generate embeddings for all FAQs.
 * Protected by SYNC_TOKEN. Updates Airtable with embedding vectors.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFAQs, getConfig } from '@/lib/airtable';
import { generateEmbeddings } from '@/lib/openai';
import { cacheUtils, CACHE_KEYS } from '@/lib/redis';
import { logger } from '@/lib/logger';
import Airtable from 'airtable';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const baseId = process.env.AIRTABLE_BASE_ID;
const apiKey = process.env.AIRTABLE_API_KEY;

function getBase() {
  if (!baseId || !apiKey) throw new Error('Airtable not configured');
  return new Airtable({ apiKey }).base(baseId);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.SYNC_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const faqs = await getFAQs();
    const toProcess = faqs.filter((f) => !f.embedding || f.embedding.length === 0);

    if (toProcess.length === 0) {
      await cacheUtils.del(CACHE_KEYS.faqs());
      await cacheUtils.del(CACHE_KEYS.embeddings());
      return NextResponse.json({
        success: true,
        message: 'All FAQs already have embeddings',
        total: faqs.length,
      });
    }

    const texts = toProcess.map((f) => f.question);
    const embeddings = await generateEmbeddings(texts);

    const base = getBase();
    for (let i = 0; i < toProcess.length; i++) {
      const faq = toProcess[i];
      const embedding = embeddings[i];
      if (embedding) {
        await base('FAQ').update(faq.id, {
          embedding: JSON.stringify(embedding),
        });
      }
    }

    await cacheUtils.del(CACHE_KEYS.faqs());
    await cacheUtils.del(CACHE_KEYS.embeddings());

    return NextResponse.json({
      success: true,
      updated: toProcess.length,
      total: faqs.length,
    });
  } catch (error) {
    logger.error('Embeddings sync error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
