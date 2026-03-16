import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { LookupItem } from "@/types/lookup";

const LOOKUP_PATH = "/v1/lookup";

const lookupService = {
  getRoleInEvents: async (): Promise<ApiResponse<LookupItem[]>> => {
    const res = await axiosInstance.get<ApiResponse<LookupItem[]>>(
      `${LOOKUP_PATH}/role-in-events`,
    );
    return res.data;
  },

  getMediaFileTypes: async (): Promise<ApiResponse<LookupItem[]>> => {
    const res = await axiosInstance.get<ApiResponse<LookupItem[]>>(
      `${LOOKUP_PATH}/media-file-types`,
    );
    return res.data;
  },

  getEventTypes: async (): Promise<ApiResponse<LookupItem[]>> => {
    const res = await axiosInstance.get<ApiResponse<LookupItem[]>>(
      `${LOOKUP_PATH}/event-types`,
    );
    return res.data;
  },

  getAddressTypes: async (): Promise<ApiResponse<LookupItem[]>> => {
    const res = await axiosInstance.get<ApiResponse<LookupItem[]>>(
      `${LOOKUP_PATH}/address-types`,
    );
    return res.data;
  },
};

export default lookupService;

