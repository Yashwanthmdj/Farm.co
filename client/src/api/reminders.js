import client from './client';

export const getReminders = (userId) =>
  client.get(`/api/reminders/user/${userId}`).then((r) => r.data);

export const addReminder = ({ userId, message, date }) =>
  client.post('/api/reminders/add', { userId, message, date }).then((r) => r.data);

export const markReminderSent = (id) =>
  client.put(`/api/reminders/${id}/sent`).then((r) => r.data);

export const sendReminderSmsNow = (id) =>
  client.post(`/api/reminders/${id}/send-sms`).then((r) => r.data);

export const getCrops = () => client.get('/api/reminders/crops').then((r) => r.data);

export const getCropInfo = (cropType) =>
  client.get(`/api/reminders/crop/${cropType}`).then((r) => r.data);

export const createCropSchedule = ({ userId, cropType, plantingDate }) =>
  client
    .post('/api/reminders/crop-schedule', { userId, cropType, plantingDate })
    .then((r) => r.data);
