import client from './client';

// Marketplace-wide listing (all farmers' available products)
export const getMarketplaceProducts = () =>
  client.get('/api/farmer-products').then((r) => r.data);

// Products belonging to one farmer (their own "My Farm Store")
export const getFarmerProducts = (farmerId) =>
  client.get(`/api/farmer-products/farmer/${farmerId}`).then((r) => r.data);

export const createFarmerProduct = (formData) =>
  client
    .post('/api/farmer-products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const updateFarmerProduct = (productId, formData) =>
  client
    .put(`/api/farmer-products/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const deleteFarmerProduct = (productId) =>
  client.delete(`/api/farmer-products/${productId}`).then((r) => r.data);
