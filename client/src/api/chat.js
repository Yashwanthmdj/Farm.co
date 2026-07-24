import client from './client';

export const getChatHistory = (userId) =>
  client.get(`/api/chat/user/${userId}`).then((r) => r.data);

// Preferred multilingual endpoint - translates in both directions and
// stores the exchange server-side.
export const sendMultilingualChat = ({ userId, message, language }) =>
  client
    .post('/api/multilingual-chat', { userId, message, language })
    .then((r) => r.data);

export const transcribeSpeech = (formData) =>
  client
    .post('/api/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
