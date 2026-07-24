const express = require('express');
const router = express.Router();
const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');

// Same local Ollama configuration used by multilingualChat.js.
const LOCAL_LLM_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const SYSTEM_PROMPT = 'You are a helpful farming assistant for Indian farmers. Answer clearly and concisely.';

// POST /api/chat
// Backwards compatible: if `answer` is provided directly, it is stored as-is
// (original behavior). If only `question`/`message` is provided (no answer),
// this now also proxies the question to the local Ollama model and stores/
// returns the generated answer - full multilingual translation handling
// still lives in multilingualChat.js for language-aware requests.
router.post('/', async (req, res) => {
  const { userId, question, answer, message } = req.body;
  const effectiveQuestion = question || message;

  try {
    if (answer) {
      // Original behavior: caller already has an answer to persist.
      const chat = await ChatHistory.create({ userId, question: effectiveQuestion, answer });
      return res.json(chat);
    }

    if (!effectiveQuestion) {
      return res.status(400).json({ error: 'question (or message) is required' });
    }

    // No answer supplied - generate one via the local Ollama model.
    const response = await axios.post(LOCAL_LLM_API_URL, {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: effectiveQuestion }
      ],
      stream: false
    });

    const generatedAnswer = response.data && response.data.message && response.data.message.content;
    if (!generatedAnswer) {
      throw new Error('Empty response from Ollama');
    }

    const chat = await ChatHistory.create({ userId, question: effectiveQuestion, answer: generatedAnswer });
    res.json(chat);
  } catch (error) {
    console.error('Chat route error:', error.response ? error.response.data : error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Could not connect to the local Ollama server. Please ensure Ollama is running.' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// GET /api/chat/user/:userId - chat history for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Kept for backwards compatibility with any existing callers that used the
// original `/chat` sub-path on this router.
router.post('/chat', async (req, res) => {
  const { userId, question, answer } = req.body;
  try {
    const chat = await ChatHistory.create({ userId, question, answer });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
