/**
 * POST clear all Redis cache (config, faqs, embeddings).
 * Protected by SYNC_TOKEN. Use after Airtable updates when data seems stale.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheUtils, CACHE_KEYS } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.SYNC_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await cacheUtils.del(CACHE_KEYS.config());
    await cacheUtils.del(CACHE_KEYS.faqs());
    await cacheUtils.del(CACHE_KEYS.embeddings());

    return NextResponse.json({
      success: true,
      message: 'Cleared config, FAQ, and embeddings cache.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}
