import axios from '../config/axios'

// Authentication service
export const authService = {
  login: async (email: string, password: string) => {
    return axios.post('/auth/login', { email, password })
  },
  logout: async () => {
    return axios.post('/auth/logout')
  },
}
