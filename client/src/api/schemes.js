import client from './client';

export const getSchemes = () => client.get('/api/schemes').then((r) => r.data);

export const getScheme = (id) => client.get(`/api/schemes/${id}`).then((r) => r.data);
