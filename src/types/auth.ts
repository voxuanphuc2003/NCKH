export interface AuthState {
  isAuthenticated: boolean
  user: any | null
  token: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}
