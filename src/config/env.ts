
/// <reference types="vite/client" />

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  environment: import.meta.env.MODE,
}
