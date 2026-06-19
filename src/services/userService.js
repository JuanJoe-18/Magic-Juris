import { apiClient } from './apiClient';

export const userService = {
  getUsers: async (skip = 0, limit = 100) => {
    return apiClient.get(`/users?skip=${skip}&limit=${limit}`);
  },

  getUser: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (userData) => {
    return apiClient.post('/users', userData);
  },

  updateUser: async (id, userData) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  updateUserRole: async (id, role) => {
    return apiClient.patch(`/users/${id}/role`, { role });
  }
};
