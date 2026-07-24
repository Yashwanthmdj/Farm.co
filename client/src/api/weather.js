import client from './client';

export const getForecast = ({ city, lat, lon, lang }) =>
  client.post('/api/weather/forecast', { city, lat, lon, lang }).then((r) => r.data);
