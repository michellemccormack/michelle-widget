/**
 * Serper.dev Google Search API client.
 * Used when no FAQ match - searches web for basic info (e.g. age, bio facts).
 */

import { logger } from './logger';

const SERPER_API_URL = 'https://google.serper.dev/search';

export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet?: string;
  position?: number;
}

export interface SerperKnowledgeGraph {
  title?: string;
  type?: string;
  description?: string;
  attributes?: Record<string, string>;
}

export interface SerperSearchResponse {
  organic?: SerperOrganicResult[];
  knowledgeGraph?: SerperKnowledgeGraph;
  searchParameters?: { q: string };
}

export async function searchWeb(query: string): Promise<SerperSearchResponse | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    logger.warn('SERPER_API_KEY not set, web search disabled');
    return null;
  }

  try {
    const res = await fetch(SERPER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ q: query, num: 10 }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error('Serper API error', {
        status: res.status,
        statusText: res.statusText,
        body: errText?.slice(0, 200),
      });
      return null;
    }

    const data = (await res.json()) as SerperSearchResponse;
    logger.info('Web search succeeded', { query, organicCount: data.organic?.length ?? 0 });
    return data;
  } catch (error) {
    logger.error('Web search failed', error);
    return null;
  }
}
