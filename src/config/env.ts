
/// <reference types="vite/client" />

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  apiUrlProduction: import.meta.env.VITE_API_URL_PRODUCTION || 'https://geneology-web-be-tke0.onrender.com/api',
  environment: import.meta.env.MODE,
}
