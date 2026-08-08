const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const pool = require('./db-mysql');
const { optionalAuth } = require('./middleware/auth');
const { auditLog } = require('./services/audit-service');
const { createRateLimiter } = require('./services/rate-limiter');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const MAX_MESSAGE_CHARS = Number(process.env.AI_MAX_MESSAGE_CHARS || 1000);
const RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS || 20);
const OPENAI_VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID || '';
const ENABLE_OPENAI_MODERATION = process.env.ENABLE_OPENAI_MODERATION === 'true';

const aiRateLimit = createRateLimiter({
  prefix: 'ai-chatbot',
  maxRequests: RATE_LIMIT_MAX_REQUESTS,
  windowMs: RATE_LIMIT_WINDOW_MS
});

let chatTableInitialized = false;

const BANKING_ASSISTANT_INSTRUCTIONS = `
You are a secure banking support assistant for an HSBC-style demo banking portal.
Answer only banking-product, account-navigation, card, transfer, security, and support questions.
Use the FAQ/file-search context when it is relevant. If context is not enough, explain what the user can do in the app or ask them to contact support.

Safety rules:
- Never ask for or reveal passwords, full card numbers, CVV, PIN, OTP, private keys, or security answers.
- Never perform transactions, card blocking, profile edits, or admin actions. You may only explain how the user can do them in the app.
- Never claim that a transfer, login, refund, loan, or card action has been completed.
- If the user reports fraud, lost card, unauthorized transaction, or account takeover, tell them to contact bank support immediately and secure their account.

Return only JSON with this exact shape:
{
  "answer": "short user-facing answer",
  "intent": "balance|transfer|cards|loans|security|support|admin|general|unknown",
  "escalate": false,
  "confidence": 0.0,
  "safetyCategory": "safe|sensitive_data|fraud_or_account_takeover|out_of_scope"
}
`.trim();

const rulesPath = path.join(__dirname, 'chatbot-responses.json');
const rules = fs.existsSync(rulesPath) ? JSON.parse(fs.readFileSync(rulesPath, 'utf8')) : {};

let faqEmbeddings = [];
const embeddingsPath = path.join(__dirname, 'faq-embeddings.json');
if (fs.existsSync(embeddingsPath)) {
  try {
    faqEmbeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
    console.log(`Loaded ${faqEmbeddings.length} FAQ embeddings`);
  } catch (err) {
    console.warn('Could not load embeddings:', err.message);
  }
}

async function ensureChatMessagesTable() {
  if (chatTableInitialized) return;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NULL,
        sessionId VARCHAR(100),
        messageText TEXT NOT NULL,
        messageType ENUM('user', 'bot', 'agent') DEFAULT 'user',
        isAiResponse BOOLEAN DEFAULT FALSE,
        sentiment VARCHAR(50),
        intent VARCHAR(100),
        responseTime INT DEFAULT 0,
        isResolved BOOLEAN DEFAULT FALSE,
        escalated BOOLEAN DEFAULT FALSE,
        rating INT DEFAULT 0,
        feedback TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_userId (userId),
        INDEX idx_sessionId (sessionId),
        INDEX idx_date (createdAt),
        INDEX idx_messageType (messageType)
      )
    `);
    chatTableInitialized = true;
  } catch (error) {
    console.error('Chat table initialization failed:', error.message);
  } finally {
    if (connection) connection.release();
  }
}

async function logChatMessage({ req, sessionId, messageText, messageType, isAiResponse, intent, responseTime, escalated }) {
  try {
    await ensureChatMessagesTable();
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO chat_messages
       (userId, sessionId, messageText, messageType, isAiResponse, intent, responseTime, escalated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.auth?.id || null,
        sessionId || `web-${req.ip || 'local'}`,
        messageText,
        messageType,
        isAiResponse ? 1 : 0,
        intent || null,
        responseTime || 0,
        escalated ? 1 : 0
      ]
    );
    connection.release();
  } catch (error) {
    console.error('Chat log failed:', error.message);
  }
}

function sanitizeMessage(message) {
  return String(message || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE_CHARS);
}

function reviewBankingSafety(message) {
  const lower = message.toLowerCase();
  const sensitivePatterns = [
    /password/,
    /\bcvv\b/,
    /\bpin\b/,
    /\botp\b/,
    /full card/,
    /card number/,
    /security answer/,
    /private key/
  ];
  const fraudPatterns = [
    /fraud/,
    /unauthori[sz]ed/,
    /stolen/,
    /lost card/,
    /account hacked/,
    /takeover/,
    /scam/
  ];

  if (sensitivePatterns.some((pattern) => pattern.test(lower))) {
    return {
      blocked: true,
      category: 'sensitive_data',
      answer: 'For security, never share passwords, OTPs, PINs, CVV, or full card numbers. If you think your account is at risk, contact support immediately and change your password.',
      escalate: true
    };
  }

  if (fraudPatterns.some((pattern) => pattern.test(lower))) {
    return {
      blocked: false,
      category: 'fraud_or_account_takeover',
      answer: null,
      escalate: true
    };
  }

  return {
    blocked: false,
    category: 'safe',
    answer: null,
    escalate: false
  };
}

async function runModerationReview(message) {
  const localReview = reviewBankingSafety(message);
  if (localReview.blocked || !ENABLE_OPENAI_MODERATION || !process.env.OPENAI_API_KEY) {
    return localReview;
  }

  try {
    const moderation = await openai.moderations.create({
      model: process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest',
      input: message
    });
    const flagged = Boolean(moderation.results?.[0]?.flagged);
    return flagged
      ? {
          blocked: true,
          category: 'moderation_flagged',
          answer: 'I cannot help with that request. Please contact support for safe banking assistance.',
          escalate: true
        }
      : localReview;
  } catch (error) {
    console.warn('Moderation API failed, using local safety review:', error.message);
    return localReview;
  }
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

function buildStructuredFallback(userMessage, safetyReview = reviewBankingSafety(userMessage)) {
  const lower = (userMessage || '').toLowerCase().trim();
  let answer = safetyReview.answer;
  let intent = 'unknown';

  if (!answer && rules[lower]) answer = rules[lower];
  if (!answer) {
    for (const key of Object.keys(rules)) {
      if (lower.includes(key)) {
        answer = rules[key];
        intent = key === 'loan' || key === 'loans' ? 'loans' : key;
        break;
      }
    }
  }

  if (!answer) {
    answer = 'I am not sure from the current FAQ. Try asking about balance, transfer, cards, loans, contact, or request a support agent.';
  }

  if (intent === 'unknown') {
    if (lower.includes('transfer')) intent = 'transfer';
    else if (lower.includes('card')) intent = 'cards';
    else if (lower.includes('balance')) intent = 'balance';
    else if (lower.includes('loan')) intent = 'loans';
    else if (lower.includes('help') || lower.includes('contact') || lower.includes('agent')) intent = 'support';
    else if (lower.includes('admin')) intent = 'admin';
  }

  return {
    answer,
    intent,
    escalate: safetyReview.escalate || lower.includes('agent') || lower.includes('contact'),
    confidence: answer === rules[lower] ? 0.9 : 0.65,
    safetyCategory: safetyReview.category || 'safe'
  };
}

async function getRelevantFaqContext(message) {
  if (faqEmbeddings.length === 0 || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-xx') || process.env.OPENAI_API_KEY.includes('your-')) {
    return { context: '', sourceMatches: [] };
  }

  const embResp = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: message
  });

  const qEmb = embResp.data[0].embedding;
  const scored = faqEmbeddings
    .map((item) => ({ ...item, score: cosineSimilarity(qEmb, item.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    context: scored.map((s) => `- ${s.text}`).join('\n'),
    sourceMatches: scored.map((s) => ({ id: s.id, score: Number(s.score.toFixed(4)) }))
  };
}

function parseStructuredAi(text, fallback) {
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim());
    return {
      answer: String(parsed.answer || fallback.answer),
      intent: String(parsed.intent || fallback.intent),
      escalate: Boolean(parsed.escalate),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence || fallback.confidence))),
      safetyCategory: String(parsed.safetyCategory || fallback.safetyCategory)
    };
  } catch (_error) {
    return { ...fallback, answer: text };
  }
}

async function generateOpenAiResponse(message, context, fallback) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-xx') || process.env.OPENAI_API_KEY.includes('your-')) return null;

  const input = [
    { role: 'system', content: BANKING_ASSISTANT_INSTRUCTIONS },
    {
      role: 'user',
      content: `FAQ context:\n${context || 'No local FAQ context available.'}\n\nUser question: ${message}`
    }
  ];

  if (openai.responses?.create) {
    const request = {
      model: AI_MODEL,
      input,
      max_output_tokens: 450
    };

    if (OPENAI_VECTOR_STORE_ID) {
      request.tools = [{ type: 'file_search', vector_store_ids: [OPENAI_VECTOR_STORE_ID] }];
    }

    const response = await openai.responses.create(request);
    return {
      provider: 'openai',
      structured: parseStructuredAi(response.output_text, fallback)
    };
  }

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_FALLBACK_MODEL || 'gpt-4o-mini',
    messages: input,
    max_tokens: 450,
    temperature: 0.2
  });

  return {
    provider: 'openai-chat',
    structured: parseStructuredAi(completion.choices?.[0]?.message?.content, fallback)
  };
}

async function generateGeminiResponse(message, context, fallback) {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = `${BANKING_ASSISTANT_INSTRUCTIONS}

FAQ context:
${context || 'No local FAQ context available.'}

User question: ${message}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 450,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API failed with ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return {
    provider: 'gemini',
    structured: parseStructuredAi(text, fallback)
  };
}

router.post('/api/ai-chatbot', optionalAuth, aiRateLimit, async (req, res) => {
  const startedAt = Date.now();
  try {
    const rawMessage = req.body?.message;
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || null;
    if (!rawMessage || typeof rawMessage !== 'string') {
      return res.status(400).json({ success: false, message: 'No message provided' });
    }

    if (rawMessage.length > MAX_MESSAGE_CHARS) {
      return res.status(400).json({
        success: false,
        message: `Message is too long. Please keep it under ${MAX_MESSAGE_CHARS} characters.`
      });
    }

    const message = sanitizeMessage(rawMessage);
    await logChatMessage({
      req,
      sessionId,
      messageText: message,
      messageType: 'user',
      isAiResponse: false
    });

    const safetyReview = await runModerationReview(message);
    const fallback = buildStructuredFallback(message, safetyReview);

    let provider = 'rule-based';
    let structured = fallback;
    let sourceMatches = [];

    if (!safetyReview.blocked) {
      let context = '';
      try {
        const contextResult = await getRelevantFaqContext(message);
        context = contextResult.context;
        sourceMatches = contextResult.sourceMatches;
      } catch (embError) {
        console.warn('FAQ context embedding failed, proceeding without context:', embError.message);
      }

      // Try Gemini first
      try {
        const geminiResult = await generateGeminiResponse(message, context, fallback);
        if (geminiResult) {
          provider = geminiResult.provider;
          structured = geminiResult.structured;
        } else {
          // If Gemini returned null, try OpenAI as secondary fallback
          const openAiResult = await generateOpenAiResponse(message, context, fallback);
          if (openAiResult) {
            provider = openAiResult.provider;
            structured = openAiResult.structured;
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API failed, attempting OpenAI:', geminiError.message);
        try {
          const openAiResult = await generateOpenAiResponse(message, context, fallback);
          if (openAiResult) {
            provider = openAiResult.provider;
            structured = openAiResult.structured;
          }
        } catch (openaiError) {
          console.warn('OpenAI API failed, using rule-based fallback:', openaiError.message);
        }
      }
    }

    if (safetyReview.escalate) {
      structured.escalate = true;
      structured.safetyCategory = safetyReview.category;
    }

    const responseTime = Date.now() - startedAt;
    await logChatMessage({
      req,
      sessionId,
      messageText: structured.answer,
      messageType: 'bot',
      isAiResponse: provider !== 'rule-based',
      intent: structured.intent,
      responseTime,
      escalated: structured.escalate
    });

    await auditLog(req, {
      action: 'AI_CHATBOT_MESSAGE',
      actionType: 'AI_CHAT',
      module: 'genai',
      resourceType: 'chat_message',
      status: safetyReview.blocked ? 'blocked' : 'success',
      details: {
        intent: structured.intent,
        provider,
        confidence: structured.confidence,
        safetyCategory: structured.safetyCategory,
        escalate: structured.escalate
      }
    });

    return res.json({
      success: true,
      botResponse: structured.answer,
      mode: provider,
      provider,
      intent: structured.intent,
      escalate: structured.escalate,
      confidence: structured.confidence,
      safetyCategory: structured.safetyCategory,
      sourceMatches,
      fallback: provider === 'rule-based'
    });
  } catch (err) {
    console.error('AI Chatbot error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = {
  router,
  buildStructuredFallback,
  sanitizeMessage,
  reviewBankingSafety
};
