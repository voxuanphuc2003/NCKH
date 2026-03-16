import axiosInstance from "../config/axios";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";


const AUTH_PATH = "/v1/auth";

const authService = {

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
  
    const response = await axiosInstance.post<AuthResponse>(`${AUTH_PATH}/register`, data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(`${AUTH_PATH}/login`, data);
    return response.data;
  },


  getGoogleAuthorizeUrl: (): string => {
    const base = axiosInstance.defaults.baseURL || "";
    return `${base.replace(/\/$/, "")}/v1/auth/oauth2/authorize/google`;
  },


  getGoogleCallbackPath: (): string => `${AUTH_PATH}/oauth2/callback/google`,
};

export default authService;