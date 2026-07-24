import client from './client';

export const getCart = (userId) =>
  client.get(`/api/cart/${userId}`).then((r) => r.data);

export const addToCart = ({ userId, productId, quantity }) =>
  client.post('/api/cart/add', { userId, productId, quantity }).then((r) => r.data);

export const updateCartItem = ({ userId, productId, quantity }) =>
  client.put('/api/cart/update', { userId, productId, quantity }).then((r) => r.data);

export const removeFromCart = ({ userId, productId }) =>
  client
    .delete('/api/cart/remove', { data: { userId, productId } })
    .then((r) => r.data);

export const clearCart = (userId) =>
  client.delete(`/api/cart/clear/${userId}`).then((r) => r.data);
