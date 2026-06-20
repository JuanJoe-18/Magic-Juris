import { apiClient } from './apiClient';

export const actuationService = {
  getActuations: async (processId = null) => {
    const endpoint = processId 
      ? `/actuaciones/process/${processId}`
      : '/actuaciones/';
    return apiClient.get(endpoint);
  },

  syncMockActuations: async (processId) => {
    return apiClient.post(`/actuaciones/${processId}/sync`, {});
  },

  createActuation: async (actuation) => {
    return apiClient.post('/actuaciones/', actuation);
  }
};
