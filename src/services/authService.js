import { apiClient } from './apiClient';

export const authService = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  }
};
