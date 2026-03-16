import axios from 'axios';
import { config } from './env';

const envBase =
  import.meta.env.MODE === "production"
    ? config.apiUrlProduction
    : config.apiUrl;
const baseURL = envBase.replace(/\/$/, "");

const instance = axios.create({
  baseURL,
})

instance.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers = req.headers ?? {};
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default instance
