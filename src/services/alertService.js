import { apiClient } from './apiClient';

export const alertService = {
  getAlerts: async (leida = null) => {
    let endpoint = '/alerts/';
    if (leida !== null) {
      endpoint += `?leida=${leida}`;
    }
    return apiClient.get(endpoint);
  },

  getAlertsByProcess: async (processId) => {
    return apiClient.get(`/alerts/process/${processId}`);
  },

  markAsRead: async (alertId) => {
    return apiClient.patch(`/alerts/${alertId}/read`, {});
  },

  getUnreadCount: async () => {
    return apiClient.get('/alerts/unread/count');
  }
};
