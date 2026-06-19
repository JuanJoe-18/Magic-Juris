import { apiClient } from './apiClient';

export const auditService = {
  getAuditLogs: async () => {
    return apiClient.get('/audit');
  }
};
