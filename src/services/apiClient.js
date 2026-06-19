import { config } from '../config/env';

export const apiClient = {
  get: async (endpoint) => {
    // const response = await fetch(`${config.apiUrl}${endpoint}`);
    // return response.json();
    console.log(`Mock GET ${endpoint}`);
    return {};
  },
  post: async (endpoint, data) => {
    // const response = await fetch(`${config.apiUrl}${endpoint}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();
    console.log(`Mock POST ${endpoint}`, data);
    return {};
  }
};
