/**
 * GET widget config from Airtable.
 * Returns brand settings, welcome message, quick buttons, theme.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConfig, getFAQs } from '@/lib/airtable';
import { checkRateLimit } from '@/lib/rate-limit';
import { cacheUtils, CACHE_KEYS } from '@/lib/redis';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const cached = await cacheUtils.get<object>(CACHE_KEYS.config());
    if (cached && typeof cached === 'object' && 'brand_name' in cached) {
      return NextResponse.json(cached);
    }

    const [config, faqs] = await Promise.all([getConfig(), getFAQs()]);

    const quickButtonsLimit = parseInt(config.quick_buttons_limit || '6', 10);
    const categoryCounts = new Map<string, string>();
    for (const faq of faqs) {
      if (!categoryCounts.has(faq.category)) {
        categoryCounts.set(faq.category, faq.category);
      }
    }
    const categories = Array.from(categoryCounts.keys())
      .slice(0, quickButtonsLimit)
      .map((category) => ({ label: category, category }));

    let theme: { primary_color?: string; font_family?: string } | undefined;
    if (config.theme) {
      try {
        theme = JSON.parse(config.theme) as { primary_color?: string; font_family?: string };
      } catch {
        theme = undefined;
      }
    }

    let contact_ctas: Array<{ label: string; url?: string; action?: 'lead_capture' | 'external_link' }> | undefined;
    if (config.contact_ctas) {
      try {
        const parsed = JSON.parse(config.contact_ctas) as Array<{ label: string; url?: string }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          contact_ctas = parsed.map((c) => ({
            label: c.label || 'Contact',
            url: c.url,
            action: c.url ? ('external_link' as const) : ('lead_capture' as const),
          }));
        }
      } catch {
        contact_ctas = undefined;
      }
    }

    const response = {
      brand_name: config.brand_name || 'Support',
      welcome_message: config.welcome_message || 'Hi! How can I help you today?',
      quick_buttons: categories,
      theme,
      fallback_message:
        config.fallback_message || "I'm not sure about that. Would you like to speak with someone?",
      contact_cta_label: config.contact_cta_label || 'Contact Us',
      contact_cta_url: config.contact_cta_url,
      contact_ctas,
      require_email_to_chat:
        config.require_email_to_chat === 'true' || config.require_email_to_chat === '1',
    };

    await cacheUtils.set(CACHE_KEYS.config(), response, cacheUtils.TTL.CONFIG);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Config endpoint error', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
