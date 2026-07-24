import client from './client';

export const createOrder = (userId) =>
  client.post('/api/orders/create', { userId }).then((r) => r.data);

export const getUserOrders = (userId) =>
  client.get(`/api/orders/user/${userId}`).then((r) => r.data);

export const cancelOrder = (orderId) =>
  client.put(`/api/orders/${orderId}/cancel`).then((r) => r.data);
