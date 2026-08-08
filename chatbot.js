const express = require('express');
const router = express.Router();

// Simple rule-based responses. Extend this object with more keys.
const chatbotResponses = {
  'hello': 'Hello! Welcome to HSBC Support. How can I help you today?',
  'hi': 'Hi there! How can I assist with your HSBC account?',
  'balance': 'To check your balance, login to your account dashboard or call our support line. Would you like steps to view it online?',
  'transfer': 'To transfer money: 1) Login 2) Go to Transfers 3) Enter recipient details 4) Confirm. Do you want a transfer walkthrough?',
  'cards': 'We offer debit, credit, and virtual cards. Which card would you like to know about?',
  'loan': 'HSBC offers personal, home and auto loans. Which one interests you?',
  'loans': 'HSBC offers personal, home and auto loans. Which one interests you?',
  'help': 'You can ask me about balance, transfers, cards, loans, or say "agent" to request a live agent.',
  'agent': 'Connecting you to a live agent. Please provide a short summary of your issue so we can route you correctly.',
  'contact': 'You can email support@hsbc.com or call 1-800-HSBC-USA for immediate assistance.'
};

function getChatbotResponse(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return "Sorry, I didn't understand that.";
  const message = userMessage.toLowerCase().trim();

  // Exact keyword match
  if (chatbotResponses[message]) return chatbotResponses[message];

  // Partial/keyword matching
  for (const key of Object.keys(chatbotResponses)) {
    if (message.includes(key)) return chatbotResponses[key];
  }

  // Default fallback
  return "I'm sorry — I couldn't find an answer. Try: balance, transfer, cards, loans, contact.";
}

// POST /api/chatbot - simple rule-based endpoint used by the frontend
router.post('/api/chatbot', (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ success: false, message: 'No message provided' });

    const botResponse = getChatbotResponse(message);
    return res.json({ success: true, botResponse });
  } catch (err) {
    console.error('Chatbot error:', err);
    return res.status(500).json({ success: false, message: 'Chatbot internal error' });
  }
});

module.exports = { router, getChatbotResponse };
