/**
 * Debug script: Test if "How can I register to vote?" matches the voter FAQ
 */

import { getFAQs } from '../src/lib/airtable';
import { generateEmbedding } from '../src/lib/openai';
import { findMostSimilar } from '../src/lib/embeddings';

async function testVoterFAQ() {
  console.log('🔍 Testing voter FAQ matching...\n');

  // Get all FAQs
  const faqs = await getFAQs();
  console.log(`📊 Total FAQs: ${faqs.length}`);

  // Find voter FAQ
  const voterFAQ = faqs.find(f => 
    f.question.toLowerCase().includes('register') && 
    f.question.toLowerCase().includes('vote')
  );

  if (!voterFAQ) {
    console.log('❌ No voter registration FAQ found in Airtable!');
    console.log('\nAll FAQ questions:');
    faqs.forEach(f => console.log(`  - ${f.question}`));
    return;
  }

  console.log(`✅ Found voter FAQ: "${voterFAQ.question}"`);
  console.log(`   Category: ${voterFAQ.category}`);
  console.log(`   CTA Label: ${voterFAQ.cta_label}`);
  conso   CTA URL: ${voterFAQ.cta_url}`);
  console.log(`   Has embedding: ${voterFAQ.embedding ? 'YES' : 'NO'}`);
  console.log(`   Keywords: ${voterFAQ.keywords || 'none'}\n`);

  if (!voterFAQ.embedding || voterFAQ.embedding.length === 0) {
    console.log('❌ FAQ has no embedding! Run: npm run sync-embeddings');
    return;
  }

  // Test queries
  const testQueries = [
    'How can I register to vote?',
    'voting',
    'register to vote',
    'where do i vote',
    'how to register',
  ];

  console.log('🧪 Testing similarity scores:\n');

  for (const query of testQueries) {
    const queryEmbedding = await generateEmbedding(query);
    const faqsWithEmbedding = faqs
      .filter(f => f.embedding && f.embedding.length > 0)
      .map(f => ({ ...f, embedding: f.embedding! }));

    const match = findMostSimilar(queryEmbedding, faqsWithEmbedding, 0.01);

    if (match) {
      const isVoterFAQ = match.faq.id === voterFAQ.id;
      const emoji = isVoterFAQ ? '✅' : '⚠️';
      const status = match.si= 0.65 ? 'MATCH' : 'TOO LOW';
      
      console.log(`${emoji} "${query}"`);
      console.log(`   Best match: "${match.faq.question}"`);
      console.log(`   Similarity: ${match.similarity.toFixed(4)} (${status})`);
      console.log(`   Threshold: 0.65`);
      
      if (!isVoterFAQ) {
        console.log(`   ⚠️  Matched different FAQ instead of voter FAQ!`);
      }
      console.log();
    }
  }

  console.log('\n📝 Recommendations:');
  if (voterFAQ.embedding && voterFAQ.embedding.length > 0) {
    console.log('✅ FAQ has embedding - similarity search should work');
  }
  console.log('💡 If scores are below 0.65, try adding more keywords to the FAQ');
  console.log('💡 Or update the FAQ question to match common user queries');
}

testVoterFAQ().catch(console.error);
