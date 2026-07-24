import client from './client';

export const getCropPrices = () => client.get('/api/crop-prices').then((r) => r.data);
