import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { MediaFile } from "@/types/media";

const TREES_PATH = "/v1/trees";

const mediaService = {
  getPersonMedia: async (treeId: string, personId: string): Promise<ApiResponse<MediaFile[]>> => {
    const res = await axiosInstance.get<ApiResponse<MediaFile[]>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/media`,
    );
    return res.data;
  },

  uploadPersonMedia: async (
    treeId: string,
    personId: string,
    file: File,
    mediaFileTypeId: string,
    description?: string,
  ): Promise<ApiResponse<MediaFile>> => {
    const formData = new FormData();
    formData.append("file", file);
    const params: Record<string, string> = { mediaFileTypeId };
    if (description) params.description = description;

    const res = await axiosInstance.post<ApiResponse<MediaFile>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/media`,
      formData,
      {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  getTreeMedia: async (treeId: string): Promise<ApiResponse<MediaFile[]>> => {
    const res = await axiosInstance.get<ApiResponse<MediaFile[]>>(
      `${TREES_PATH}/${treeId}/media`,
    );
    return res.data;
  },

  uploadTreeMedia: async (
    treeId: string,
    file: File,
    mediaFileTypeId: string,
    description?: string,
  ): Promise<ApiResponse<MediaFile>> => {
    const formData = new FormData();
    formData.append("file", file);
    const params: Record<string, string> = { mediaFileTypeId };
    if (description) params.description = description;

    const res = await axiosInstance.post<ApiResponse<MediaFile>>(
      `${TREES_PATH}/${treeId}/media`,
      formData,
      {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  deleteTreeMedia: async (treeId: string, mediaFileId: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/media/${mediaFileId}`,
    );
    return res.data;
  },
};

export default mediaService;

