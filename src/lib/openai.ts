/**
 * OpenAI API wrapper for embeddings and fallback LLM.
 * Server-side only - never expose API key to client.
 */

import OpenAI from 'openai';
import { logger } from './logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const FALLBACK_MODEL = 'gpt-4o-mini';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export async function generateFallbackResponse(
  userMessage: string,
  fallbackMessage: string,
  contactCtaLabel: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. The user asked something you don't have a specific answer for. 
Respond in 2-4 sentences max. Be helpful but never invent information. 
If the default fallback message fits, you may use it. Otherwise provide a brief, safe, generic response.
Never make up policies, facts, or details. Keep tone: confident, calm, concise.`,
        },
        {
          role: 'user',
          content: `User asked: "${userMessage}"\n\nDefault fallback: "${fallbackMessage}"\n\nContact CTA: "${contactCtaLabel}"`,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    return content || fallbackMessage;
  } catch (error) {
    logger.error('Fallback LLM failed', error);
    return fallbackMessage;
  }
}
