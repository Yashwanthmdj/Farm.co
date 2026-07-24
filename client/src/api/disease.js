import client from './client';

export const analyzeDisease = (formData) =>
  client
    .post('/api/disease-detection/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
