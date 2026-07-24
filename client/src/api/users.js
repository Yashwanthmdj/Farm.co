import client from './client';

// Combined register/login flow used by the backend: if the phone already
// exists this behaves as a login (requires `pin`), otherwise it registers a
// brand new account (requires `role` + `pin`).
export const registerOrLogin = (payload) =>
  client.post('/api/users/register', payload).then((r) => r.data);

export const checkPhoneExists = (phone) =>
  client.get('/api/users/check', { params: { phone } }).then((r) => r.data);

export const getMyProfile = () =>
  client.get('/api/users/me').then((r) => r.data);

export const updateProfile = (payload) =>
  client.put('/api/users/profile', payload).then((r) => r.data);
