import axios from '../config/axios'

// User service
export const userService = {
  getProfile: async () => {
    return axios.get('/user/profile')
  },
  updateProfile: async (data: any) => {
    return axios.put('/user/profile', data)
  },
}
