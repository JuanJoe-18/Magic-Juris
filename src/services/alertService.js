import { apiClient } from './apiClient';

export const alertService = {
  getAlerts: async () => {
    return apiClient.get('/alerts');
  }
};
