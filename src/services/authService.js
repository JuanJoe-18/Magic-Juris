import { config } from '../config/env';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Credenciales invalidas')
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      return data
    } catch (error) {
      console.warn('Backend login failed, using demo fallback if applicable.', error)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      const response = await fetch(`${config.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Token invalido')
      return await response.json()
    } catch (error) {
      return null
    }
  },

  logout: () => {
    localStorage.removeItem('token')
  },
}
