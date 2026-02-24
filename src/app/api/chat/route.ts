/**
 * POST question, get answer via semantic search.
 * Primary: embeddings + cosine similarity (threshold 0.60).
 * Fallback: generateFallbackResponse (GPT-4o-mini with Michelle context).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFAQs, getConfig, updateFAQ, createLog } from '@/lib/airtable';
import { getCorsHeaders } from '@/lib/cors';
import { generateEmbedding, generateFallbackResponse, synthesizeAnswerFromFAQ } from '@/lib/openai';
import { findMostSimilar } from '@/lib/embeddings';
import { checkRateLimit } from '@/lib/rate-limit';
import { chatRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import type { ChatResponse } from '@/types/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIMILARITY_THRESHOLD = 0.50;
const SYNTHESIS_THRESHOLD = 0.70;

type CtaItem = { label: string; url?: string; action: 'lead_capture' | 'external_link' };

const EMAIL_MICHELLE_CTA: CtaItem = {
  label: 'Email Michelle',
  url: 'mailto:michellemarion@gmail.com',
  action: 'external_link',
};

/** Ensure we always have [primary, secondary] - primary from source, secondary always Email Michelle (unless primary is already that). */
function ensureTwoCtas(primaryCtas: CtaItem[]): CtaItem[] {
  const primary = primaryCtas[0] || { label: 'Contact', url: undefined, action: 'lead_capture' as const };
  const isAlreadyEmail = primary.url === EMAIL_MICHELLE_CTA.url;
  if (isAlreadyEmail) return [primary];
  return [primary, EMAIL_MICHELLE_CTA];
}

function parseContactCtas(
  contactCtas: string | Array<{ label: string; url?: string }> | undefined,
  fallbackLabel: string,
  fallbackUrl?: string
): CtaItem[] {
  if (contactCtas) {
    let parsed: Array<{ label: string; url?: string }>;
    if (typeof contactCtas === 'string') {
      try {
        parsed = JSON.parse(contactCtas) as Array<{ label: string; url?: string }>;
      } catch {
        parsed = [];
      }
    } else if (Array.isArray(contactCtas)) {
      parsed = contactCtas;
    } else {
      parsed = [];
    }
    if (parsed.length > 0) {
      return parsed.map((c): CtaItem => ({
        label: c.label || 'Contact',
        url: c.url,
        action: c.url ? 'external_link' : 'lead_capture',
      }));
    }
  }
  if (fallbackLabel) {
    return [
      {
        label: fallbackLabel,
        url: fallbackUrl,
        action: fallbackUrl ? 'external_link' : 'lead_capture',
      },
    ];
  }
  return [];
}

function buildFaqCtas(
  faq: { cta_label?: string; cta_url?: string; ctas?: string },
  defaultCtas: CtaItem[]
): CtaItem[] {
  if (faq.ctas) {
    try {
      const parsed = JSON.parse(faq.ctas) as Array<{ label: string; url?: string }>;
      if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c): CtaItem => ({
        label: c.label || 'Learn More',
        url: c.url,
        action: c.url ? 'external_link' : 'lead_capture',
      }));
      }
    } catch {
      // fall through to single CTA
    }
  }
  if (faq.cta_label) {
    return [
      {
        label: faq.cta_label,
        url: faq.cta_url,
        action: faq.cta_url ? 'external_link' : 'lead_capture',
      },
    ];
  }
  return defaultCtas;
}

async function logAnswerServed(
  sessionId: string,
  payload: { faq_id?: string; confidence?: number; source: string },
  userAgent?: string,
  referrer?: string
) {
  try {
    await createLog({
      event_name: 'answer_served',
      session_id: sessionId,
      payload_json: JSON.stringify(payload),
      user_agent: userAgent,
      referrer,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Log answer_served failed', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, {
        status: 429,
        headers: getCorsHeaders(request),
      });
    }

    const body = await request.json();
    console.log(`[Chat] Request received: "${(body as { message?: string }).message ?? '(no message)'}"`);
    const validated = chatRequestSchema.parse(body);

    const [config, faqs] = await Promise.all([getConfig(), getFAQs()]);

    const categoryFromQuickButton = validated.context?.previous_category;

    // Quick button: return highest-priority FAQ in that category (category-based, not question search)
    if (categoryFromQuickButton) {
      const inCategory = faqs
        .filter((f) => f.category === categoryFromQuickButton)
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      if (inCategory.length > 0) {
        const faq = inCategory[0];
        console.log(`FAQ match (quick button): "${faq.question}" | category: ${categoryFromQuickButton}`);
        updateFAQ(faq.id, { view_count: (faq.view_count ?? 0) + 1 }).catch((e) =>
          logger.error('updateFAQ failed', e)
        );

        const defaultContactCtas = parseContactCtas(config.contact_ctas, config.contact_cta_label || 'Contact Us', config.contact_cta_url);
        const faqCtas = buildFaqCtas(faq, defaultContactCtas);
        const ctas = ensureTwoCtas(faqCtas);

        const response: ChatResponse = {
          answer: faq.short_answer,
          category: faq.category,
          faq_id: faq.id,
          ctas: ctas.length > 0 ? ctas : undefined,
          cta: ctas.length === 1 ? ctas[0] : undefined,
          confidence: 1,
          source: 'faq_match',
        };

        logAnswerServed(
          validated.session_id,
          { faq_id: faq.id, confidence: 1, source: 'faq_match' },
          request.headers.get('user-agent') || undefined,
          request.headers.get('referrer') || undefined
        ).catch(() => {});

        return NextResponse.json(response, { headers: getCorsHeaders(request) });
      }
    }

    const query = validated.message.trim();
    const queryLower = query.toLowerCase();

    // Exact match - when question matches an FAQ exactly
    const exactMatch = faqs.find((f) => f.question.trim().toLowerCase() === queryLower);
    if (exactMatch) {
      console.log(`FAQ match (exact): "${exactMatch.question}" | similarity: 1`);
      updateFAQ(exactMatch.id, { view_count: (exactMatch.view_count ?? 0) + 1 }).catch((e) =>
        logger.error('updateFAQ failed', e)
      );

      const defaultContactCtas = parseContactCtas(config.contact_ctas, config.contact_cta_label || 'Contact Us', config.contact_cta_url);
      const faqCtas = buildFaqCtas(exactMatch, defaultContactCtas);
      const ctas = ensureTwoCtas(faqCtas);

      const response: ChatResponse = {
        answer: exactMatch.short_answer,
        category: exactMatch.category,
        faq_id: exactMatch.id,
        ctas: ctas.length > 0 ? ctas : undefined,
        cta: ctas.length === 1 ? ctas[0] : ctas.length === 0 ? { label: config.contact_cta_label || 'Learn More', url: exactMatch.cta_url, action: exactMatch.cta_url ? 'external_link' : 'lead_capture' } : undefined,
        confidence: 1,
        source: 'faq_match',
      };

      logAnswerServed(
        validated.session_id,
        { faq_id: exactMatch.id, confidence: 1, source: 'faq_match' },
        request.headers.get('user-agent') || undefined,
        request.headers.get('referrer') || undefined
      ).catch(() => {});

      return NextResponse.json(response, { headers: getCorsHeaders(request) });
    }

    const queryEmbedding = await generateEmbedding(validated.message);

    const faqsWithEmbedding = faqs
      .filter((f) => f.embedding && f.embedding.length > 0)
      .map((f) => ({ ...f, embedding: f.embedding! }));

    const match = findMostSimilar(queryEmbedding, faqsWithEmbedding, SIMILARITY_THRESHOLD);

    if (match) {
      const { faq, similarity } = match;
      console.log(`FAQ match (semantic): "${faq.question}" | similarity: ${similarity}`);
      updateFAQ(faq.id, { view_count: (faq.view_count ?? 0) + 1 }).catch((e) =>
        logger.error('updateFAQ failed', e)
      );

      const shouldSynthesize = (faq as { force_synthesis?: boolean }).force_synthesis === true || similarity < SYNTHESIS_THRESHOLD;
      const answer = shouldSynthesize
        ? await synthesizeAnswerFromFAQ(
            validated.message,
            faq.short_answer,
            config.fallback_message || "I'm not sure about that. Would you like to schedule a call?"
          )
        : faq.short_answer;

      const defaultContactCtas = parseContactCtas(config.contact_ctas, config.contact_cta_label || 'Contact Us', config.contact_cta_url);
      const faqCtas = buildFaqCtas(faq, defaultContactCtas);
      const ctas = ensureTwoCtas(faqCtas);

      const response: ChatResponse = {
        answer,
        category: faq.category,
        faq_id: faq.id,
        ctas: ctas.length > 0 ? ctas : undefined,
        cta: ctas.length === 1 ? ctas[0] : ctas.length === 0 ? { label: config.contact_cta_label || 'Learn More', url: faq.cta_url, action: faq.cta_url ? 'external_link' : 'lead_capture' } : undefined,
        confidence: similarity,
        source: 'faq_match',
      };

      logAnswerServed(
        validated.session_id,
        { faq_id: faq.id, confidence: similarity, source: 'faq_match' },
        request.headers.get('user-agent') || undefined,
        request.headers.get('referrer') || undefined
      ).catch(() => {});

      return NextResponse.json(response, { headers: getCorsHeaders(request) });
    }

    // No FAQ match - use AI fallback with Michelle context
    console.log(`FAQ: no match, using AI fallback | query: "${validated.message}"`);
    const fallbackMessage =
      config.fallback_message || "I'm not sure about that. Would you like to schedule a call to learn more?";

    const answer = await generateFallbackResponse(
      validated.message,
      fallbackMessage,
      config.contact_cta_label || 'Contact Us'
    );

    const noMatchCtas = parseContactCtas(config.contact_ctas, config.contact_cta_label || 'Contact Us', config.contact_cta_url);
    const ctas = ensureTwoCtas(noMatchCtas);
    const response: ChatResponse = {
      answer,
      ctas: ctas.length > 0 ? ctas : undefined,
      cta: ctas.length === 1 ? ctas[0] : {
        label: config.contact_cta_label || 'Contact Us',
        url: config.contact_cta_url,
        action: config.contact_cta_url ? 'external_link' : 'lead_capture',
      },
      confidence: 0,
      source: 'no_match',
    };

    logAnswerServed(
      validated.session_id,
      { source: 'no_match' },
      request.headers.get('user-agent') || undefined,
      request.headers.get('referrer') || undefined
    ).catch(() => {});

    return NextResponse.json(response, { headers: getCorsHeaders(request) });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request' }, {
        status: 400,
        headers: getCorsHeaders(request),
      });
    }
    logger.error('Chat endpoint error', error);
    return NextResponse.json({ error: 'Something went wrong' }, {
      status: 500,
      headers: getCorsHeaders(request),
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
