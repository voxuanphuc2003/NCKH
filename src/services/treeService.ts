import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { TreeDetail, TreeSummary, TreeUpsertRequest } from "@/types/tree";

const TREES_PATH = "/v1/trees";

const treeService = {
  getMyTrees: async (): Promise<ApiResponse<TreeSummary[]>> => {
    const res = await axiosInstance.get<ApiResponse<TreeSummary[]>>(`${TREES_PATH}/my`);
    return res.data;
  },

  getById: async (treeId: string): Promise<ApiResponse<TreeDetail>> => {
    const res = await axiosInstance.get<ApiResponse<TreeDetail>>(`${TREES_PATH}/${treeId}`);
    return res.data;
  },

  create: async (payload: TreeUpsertRequest): Promise<ApiResponse<TreeDetail>> => {
    const res = await axiosInstance.post<ApiResponse<TreeDetail>>(TREES_PATH, payload);
    return res.data;
  },

  update: async (treeId: string, payload: TreeUpsertRequest): Promise<ApiResponse<TreeDetail>> => {
    const res = await axiosInstance.put<ApiResponse<TreeDetail>>(`${TREES_PATH}/${treeId}`, payload);
    return res.data;
  },

  remove: async (treeId: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(`${TREES_PATH}/${treeId}`);
    return res.data;
  },

  leave: async (treeId: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.post<ApiResponse<string>>(`${TREES_PATH}/${treeId}/leave`);
    return res.data;
  },
};

export default treeService;

