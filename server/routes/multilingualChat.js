const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const axios = require('axios');

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL =
  process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';

const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  es: 'Spanish',
  fr: 'French',
  zh: 'Chinese',
};

function buildSystemPrompt(language) {
  const langName = LANGUAGE_NAMES[language] || 'English';
  return [
    'You are Farm.co, a helpful AI farming assistant for farmers.',
    'Provide practical advice about crops, soil, weather, pests, irrigation, fertilizers, and agricultural best practices.',
    'Keep answers clear, concise, and actionable.',
    `Always reply in ${langName} (${language}).`,
    'If the user writes in another language, still answer in the requested reply language unless they explicitly ask otherwise.',
  ].join(' ');
}

router.post('/', async (req, res) => {
  const { userId, message, language } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  if (!NVIDIA_API_KEY) {
    return res.status(503).json({
      error:
        'Chatbot is not configured. Set NVIDIA_API_KEY in the server .env file.',
    });
  }

  const lang = language || 'en';

  try {
    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(lang) },
          { role: 'user', content: String(message).trim() },
        ],
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 1024,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 60000,
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content?.trim() ||
      response.data?.choices?.[0]?.delta?.content?.trim();

    if (!reply) {
      throw new Error('Empty response from NVIDIA API');
    }

    if (userId) {
      try {
        await ChatHistory.create({
          userId,
          question: message,
          answer: reply,
        });
      } catch (dbErr) {
        console.error('Failed to save chat history:', dbErr.message);
      }
    }

    res.json({
      translated_response: reply,
      original_question: message,
      model: NVIDIA_MODEL,
      provider: 'nvidia',
    });
  } catch (err) {
    console.error(
      'NVIDIA chat error:',
      err.response ? err.response.data : err.message
    );

    const status = err.response?.status;
    if (status === 401 || status === 403) {
      return res.status(503).json({
        error: 'NVIDIA API authentication failed. Check NVIDIA_API_KEY.',
      });
    }
    if (status === 429) {
      return res.status(429).json({
        error:
          'NVIDIA rate limit reached. Please wait ~20 seconds and try again.',
      });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'NVIDIA API request timed out.' });
    }

    const detail =
      err.response?.data?.detail ||
      err.response?.data?.error?.message ||
      (typeof err.response?.data === 'string' ? err.response.data : null) ||
      err.message;

    // Surface NVIDIA "too many requests" clearly
    if (/too many requests|rate limit/i.test(String(detail))) {
      return res.status(429).json({
        error:
          'NVIDIA rate limit reached. Please wait ~20 seconds and try again.',
        details: detail,
      });
    }

    res.status(500).json({
      error: 'Chatbot failed. Please try again.',
      details: detail,
    });
  }
});

module.exports = router;
