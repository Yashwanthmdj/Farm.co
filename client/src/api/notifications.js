import client from './client';

export const getNotifications = (userId) =>
  client.get(`/api/notifications/user/${userId}`).then((r) => r.data);

export const markNotificationsRead = (userId) =>
  client.post('/api/notifications/mark-read', { userId }).then((r) => r.data);
