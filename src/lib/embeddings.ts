/**
 * Vector similarity functions for semantic search.
 * Uses cosine similarity with 0.75 threshold for match.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  if (a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

export interface FAQWithEmbedding {
  id: string;
  embedding: number[];
  [key: string]: unknown;
}

export function findMostSimilar<T extends FAQWithEmbedding>(
  queryEmbedding: number[],
  faqs: T[],
  threshold = 0.75
): { faq: T; similarity: number } | null {
  if (faqs.length === 0) return null;

  let bestMatch: { faq: T; similarity: number } | null = null;

  for (const faq of faqs) {
    const embedding = faq.embedding;
    if (!embedding || !Array.isArray(embedding)) continue;

    const similarity = cosineSimilarity(queryEmbedding, embedding);
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { faq, similarity };
    }
  }

  return bestMatch;
}
