import { config } from '../config/env';

const getErrorMessage = (errorData, status) => {
  if (errorData.detail) {
    if (typeof errorData.detail === 'string') return errorData.detail;
    if (Array.isArray(errorData.detail)) return errorData.detail.map(e => e.msg || JSON.stringify(e)).join(', ');
    return JSON.stringify(errorData.detail);
  }
  if (errorData.error) return errorData.error;
  if (errorData.message) return errorData.message;
  return `HTTP ${status}`;
};

export const apiClient = {
  get: async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.apiUrl}${endpoint}`, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET ${endpoint}:`, error.message);
      throw error;
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API POST ${endpoint}:`, error.message);
      throw error;
    }
  },
  put: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API PUT ${endpoint}:`, error.message);
      throw error;
    }
  },
  patch: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API PATCH ${endpoint}:`, error.message);
      throw error;
    }
  },
  delete: async (endpoint) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(errorData, response.status));
      }
      return await response.json();
    } catch (error) {
      console.error(`API DELETE ${endpoint}:`, error.message);
      throw error;
    }
  }
};
