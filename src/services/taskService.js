import { apiClient } from './apiClient'

export const taskService = {
  getTasks: async () => apiClient.get('/tasks/'),
  getTasksByProcess: async (processId) => apiClient.get(`/tasks/process/${processId}`),
  getTasksByRadicado: async (radicado) => apiClient.get(`/tasks/radicado/${radicado}`),
  createTask: async (payload) => apiClient.post('/tasks/', payload),
  updateTaskStatus: async (taskId, status) =>
    apiClient.patch(`/tasks/${taskId}/status`, { status }),
}
