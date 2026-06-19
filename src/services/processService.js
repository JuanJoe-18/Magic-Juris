import { apiClient } from './apiClient';

export const processService = {
  getProcesses: async (skip = 0, limit = 100) => {
    return apiClient.get(`/processes?skip=${skip}&limit=${limit}`);
  },

  getProcess: async (id) => {
    return apiClient.get(`/processes/${id}`);
  },

  getProcessByRadicado: async (radicado) => {
    return apiClient.get(`/processes/radicado/${radicado}`);
  },

  createProcess: async (processData) => {
    return apiClient.post('/processes', processData);
  },

  updateProcess: async (id, processData) => {
    return apiClient.put(`/processes/${id}`, processData);
  },

  deleteProcess: async (id) => {
    return apiClient.delete(`/processes/${id}`);
  },

  syncAllProcesses: async () => {
    return apiClient.post('/processes/sync-all', {});
  }
};
