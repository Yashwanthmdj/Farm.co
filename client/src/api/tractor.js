import client from './client';

export const getTractorLogs = (userId) =>
  client.get(`/api/tractor/user/${userId}`).then((r) => r.data);

export const addTractorLog = ({ userId, usageHours, fuelUsed, maintenanceNote }) =>
  client
    .post('/api/tractor/add', { userId, usageHours, fuelUsed, maintenanceNote })
    .then((r) => r.data);
