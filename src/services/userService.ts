import axiosInstance from "@/config/axios";
import { ApiResponse } from "@/types/api";
import { ChangePasswordRequest, UpdateMeRequest, UserMe, User } from "@/types/user";

const USERS_PATH = "/v1/users";

const userService = {
  getMe: async (): Promise<ApiResponse<UserMe>> => {
    const res = await axiosInstance.get<ApiResponse<UserMe>>(`${USERS_PATH}/me`);
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const res = await axiosInstance.get<ApiResponse<User>>(`${USERS_PATH}/${id}`);
    return res.data;
  },

  updateMe: async (data: UpdateMeRequest): Promise<ApiResponse<UserMe>> => {
    const res = await axiosInstance.put<ApiResponse<UserMe>>(`${USERS_PATH}/me`, data);
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.patch<ApiResponse<string>>(`${USERS_PATH}/me/password`, data);
    return res.data;
  },
};

export default userService;
