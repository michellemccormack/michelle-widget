/**
 * OpenAI API wrapper for embeddings and LLM synthesis.
 * Server-side only - never expose API key to client.
 */

import OpenAI from 'openai';
import { logger } from './logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const FALLBACK_MODEL = 'gpt-4o-mini';

// Knowledge base for the AI fallback - Michelle McCormack consulting
const MICHELLE_CONTEXT = `
You are a friendly, knowledgeable assistant for Michelle McCormack, a media consultant with 20+ years shaping how brands and ideas show up publicly. You represent Michelle's consulting practice.

ABOUT MICHELLE MCCORMACK:
- Based in New York City
- Works across culture, brands, and politics - positioning, messaging, strategic visibility
- Founded Casting Coin (talent marketplace used by Estée Lauder, Bobbi Brown)
- Runs Secret Boston (reaching 200K+ people)
- Worked with Live Nation, REI, SiriusXM/Pandora, political campaigns
- Former fashion photographer (Clinique, Aveda, Vanity Fair, Cosmopolitan)
- Political Messaging Strategist for Josh Kraft's 2025 mayoral campaign
- Studied at School of Visual Arts NYC and Parsons Paris

SERVICES:
- Positioning: Clarifying what something is, who it's for, why it matters
- Messaging: Shaping language, framing, emphasis for consistency and resonance
- Visibility & Distribution: Advising on channels, timing, amplification
- Strategic Advisory: Ongoing guidance for launches, campaigns, transitions
- AI Agent Assistant: 24/7 chatbot she builds for brands and campaigns - answers questions, captures leads, customizable

CONTACT:
- Email: michellemarion@gmail.com
- Phone/Text: 917-873-2215
- Website: michellemccormack.com
- Schedule a call: calendly.com/michellemarion/new-meeting
`;

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
  userQuestion: string,
  fallbackMessage: string,
  contactCtaLabel: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        {
          role: 'system',
          content: `${MICHELLE_CONTEXT}

INSTRUCTIONS:
- ALWAYS write in first person (I, my, me) — never third person (she, her, they, Michelle's)
- You ARE Michelle speaking directly to the visitor, not an assistant talking about her
- Answer ONLY what was asked. Do not add extra context, elaboration, or related information that was not specifically requested. If someone asks where you live, just say where you live.
- You are a warm, friendly assistant representing Michelle - answer naturally and conversationally
- Keep answers to 1-2 sentences maximum — under 200 characters
- Never use exclamation points
- For questions about Michelle: answer warmly based on her background and services above
- For questions about the AI Agent Assistant: describe it as a product she builds for brands and campaigns
- For completely off-topic questions: warmly redirect to Michelle's work
- NEVER say "search results", "I don't have information", "please provide more context", or "I cannot find"
- NEVER mention that you are an AI or that you are looking anything up
- NEVER make up specific details not listed above
- NEVER end your response with a question — no 'Want to know more?', 'What else can I help with?', 'Would you like to discuss this further?' or any similar closing question
- Do NOT include URLs in your response - the UI handles CTAs separately`,
        },
        {
          role: 'user',
          content: userQuestion,
        },
      ],
      max_tokens: 100,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content?.trim();
    // Enforce 200 char cap
    if (content && content.length > 200) {
      const cut = content.slice(0, 200);
      const lastSpace = cut.lastIndexOf(' ');
      return lastSpace > 80 ? cut.slice(0, lastSpace).trim() : cut.trim();
    }
    return content || fallbackMessage;
  } catch (error) {
    logger.error('generateFallbackResponse failed', error);
    return fallbackMessage;
  }
}

export async function synthesizeAnswerFromFAQ(
  question: string,
  faqAnswer: string,
  fallbackMessage: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: FALLBACK_MODEL,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `You are Michelle McCormack's personal AI assistant. Your job is to answer questions naturally and conversationally using the provided FAQ answer as your source material.

Rules:
- ALWAYS write in first person (I, my, we) — never third person (she, her, they)
- Michelle is speaking directly to the visitor
- Keep answers concise and direct — 1-2 sentences maximum, under 200 characters
- Never use exclamation points
- Never start with filler phrases like "Great question!", "I understand", "Certainly!", or "Of course!"
- Get straight to the answer
- Answer ONLY what was asked. Do not add extra context, elaboration, or related information that was not specifically requested. If someone asks where you live, just say where you live.
- If the FAQ answer starts with "Yes" or is clearly affirmative, always begin your response with "Yes."
- NEVER end your response with a question — no 'Want to know more?', 'What else can I help with?', 'Would you like to discuss this further?' or any similar closing question
- If the FAQ answer doesn't directly address the question, use it as context to give the most helpful response possible`,
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nFAQ Answer to use as source: ${faqAnswer}\n\nProvide a natural, conversational answer to the question using the FAQ answer as your source material.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    // Enforce 200 char cap
    if (content && content.length > 200) {
      const cut = content.slice(0, 200);
      const lastSpace = cut.lastIndexOf(' ');
      return lastSpace > 80 ? cut.slice(0, lastSpace).trim() : cut.trim();
    }
    return content || fallbackMessage;
  } catch (error) {
    logger.error('synthesizeAnswerFromFAQ failed', error);
    return fallbackMessage;
  }
}

export async function synthesizeAnswerFromSearch(
  userQuestion: string,
  searchContext: string,
  fallbackMessage: string,
  brandContext?: string
): Promise<string> {
  try {
    const rejectDeathRule = `- REJECT any result that mentions death, obituary, "passed away", "died", or "at the time of his/her passing". Multiple people share names - such results refer to a different person. Use fallback instead.`;
    const brandRule = brandContext
      ? `- This is about a political candidate (${brandContext}). Only use info that clearly refers to this candidate (e.g. governor, Massachusetts, MBTA). Ignore info about other people with the same name.`
      : '';

    const response = await openai.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. The user asked a question. Below are web search results.

CRITICAL RULES:
${rejectDeathRule}
${brandRule}
- Answer ONLY if the results explicitly contain the specific fact requested AND it clearly refers to the living candidate.
- Be concise: 1-2 sentences.
- Never invent, guess, or substitute a biography when a specific fact was asked.`,
        },
        {
          role: 'user',
          content: `Question: "${userQuestion}"\n\nSearch results:\n${searchContext}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim();
    return content || fallbackMessage;
  } catch (error) {
    logger.error('Synthesize from search failed', error);
    return fallbackMessage;
  }
}
