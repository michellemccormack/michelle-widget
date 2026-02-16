/**
 * POST event logging to Airtable Logs table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLog } from '@/lib/airtable';
import { checkRateLimit } from '@/lib/rate-limit';
import { logEventSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) return ['*'];
  return origins.split(',').map((o) => o.trim()).filter(Boolean);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const validated = logEventSchema.parse(body);

    const userAgent = request.headers.get('user-agent') || body.user_agent || '';
    const referrer = request.headers.get('referrer') || body.referrer || '';

    await createLog({
      event_name: validated.event_name,
      session_id: validated.session_id,
      payload_json: JSON.stringify(validated.payload),
      user_agent: userAgent,
      referrer,
      created_at: new Date().toISOString(),
    });

    const origins = getAllowedOrigins();
    const origin = request.headers.get('origin');
    const allowOrigin = origins.includes('*') || (origin && origins.includes(origin)) ? (origin || '*') : origins[0];

    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    logger.error('Log endpoint error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const origins = getAllowedOrigins();
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origins.includes('*') ? '*' : origins[0] || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
