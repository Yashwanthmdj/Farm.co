import client from './client';

export const getExpenses = (userId) =>
  client.get(`/api/expenses/user/${userId}`).then((r) => r.data);

export const addExpense = ({ userId, category, amount, note }) =>
  client
    .post('/api/expenses/add', { userId, category, amount, note })
    .then((r) => r.data);

export const getRevenues = (userId) =>
  client.get(`/api/expenses/revenue/user/${userId}`).then((r) => r.data);

export const addRevenue = ({ userId, category, amount, note, date }) =>
  client
    .post('/api/expenses/revenue/add', { userId, category, amount, note, date })
    .then((r) => r.data);

export const clearFinancials = (userId) =>
  client.delete(`/api/expenses/clear/user/${userId}`).then((r) => r.data);
