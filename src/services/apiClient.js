import { config } from '../config/env';

export const apiClient = {
  get: async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.apiUrl}${endpoint}`, { headers });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.warn(`[Fallback] Mock GET ${endpoint}`);
      return { _mock: true };
    }
  },
  post: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.warn(`[Fallback] Mock POST ${endpoint}`, data);
      return { _mock: true };
    }
  }
};
