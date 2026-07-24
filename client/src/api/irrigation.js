import client from './client';

export const getIrrigationAdvice = ({ soilMoisture, weatherSummary, cropType, lastRainMm }) =>
  client
    .post('/api/irrigation/advise', { soilMoisture, weatherSummary, cropType, lastRainMm })
    .then((r) => r.data);
