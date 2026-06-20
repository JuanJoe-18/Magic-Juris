import { apiClient } from './apiClient';

export const auditService = {
  getAuditLogs: async (processId = null, actionType = null) => {
    let endpoint = '/audit/';
    const params = [];
    if (processId) params.push(`process_id=${processId}`);
    if (actionType) params.push(`action_type=${actionType}`);
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    return apiClient.get(endpoint);
  },

  getAuditLogsByProcess: async (processId) => {
    return apiClient.get(`/audit/process/${processId}`);
  },

  getCommunicationsByProcess: async (processId) => {
    return apiClient.get(`/audit/communications/process/${processId}`);
  },

  createCommunication: async (communication) => {
    return apiClient.post('/audit/communications', communication);
  },

  exportCsv: async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/audit/export.csv`, { headers });
    if (!response.ok) throw new Error('Failed to export');
    return response.blob();
  }
};
