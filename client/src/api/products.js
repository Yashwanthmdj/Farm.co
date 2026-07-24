import client from './client';

export const getProducts = (filters = {}) =>
  client.get('/api/products', { params: filters }).then((r) => r.data);

export const getProduct = (id) =>
  client.get(`/api/products/${id}`).then((r) => r.data);
