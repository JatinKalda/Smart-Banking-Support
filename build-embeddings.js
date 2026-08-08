#!/usr/bin/env node
// build-embeddings.js
// Runs once to create embeddings from FAQ responses and save to faq-embeddings.json

const fs = require('fs');
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const responses = require('./chatbot-responses.json');

(async () => {
  console.log('🔨 Building embeddings from FAQ responses...');
  
  const items = Object.entries(responses).map(([id, text]) => ({ id, text }));
  const embeddings = [];

  for (const item of items) {
    try {
      console.log(`  📝 Embedding "${item.id}"...`);
      const r = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: item.text
      });
      embeddings.push({
        id: item.id,
        text: item.text,
        embedding: r.data[0].embedding
      });
    } catch (err) {
      console.error(`  ❌ Error embedding "${item.id}":`, err.message);
    }
  }

  if (embeddings.length === 0) {
    console.error('❌ No embeddings created. Check API key and responses.');
    process.exit(1);
  }

  fs.writeFileSync('faq-embeddings.json', JSON.stringify(embeddings, null, 2));
  console.log(`\n✅ Created faq-embeddings.json with ${embeddings.length} entries`);
})();
