import { apiClient } from './apiClient';

export const processService = {
  getProcesses: async () => {
    return apiClient.get('/processes');
  },
  getProcessByRadicado: async (radicado) => {
    return apiClient.get(`/processes/${radicado}`);
  }
};
