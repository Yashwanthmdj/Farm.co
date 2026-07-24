import client from './client';

export const uploadSoilReport = (formData, onUploadProgress) =>
  client
    .post('/api/soil-analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    .then((r) => r.data);

export const getSoilAnalysis = (id) =>
  client.get(`/api/soil-analysis/${id}`).then((r) => r.data);

export const getSoilHistory = (userId) =>
  client.get(`/api/soil-analysis/user/${userId}`).then((r) => r.data);

export const deleteSoilAnalysis = (id) =>
  client.delete(`/api/soil-analysis/${id}`).then((r) => r.data);
