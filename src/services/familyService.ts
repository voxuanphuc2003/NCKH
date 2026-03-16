import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type {
  CreateRelativeRequest,
  Family,
  GraphData,
  PersonFamilyDetail,
} from "@/types/family";

const TREES_PATH = "/v1/trees";

const familyService = {
  /** POST /api/v1/trees/{treeId}/persons/{personId}/spouse */
  addSpouse: async (
    treeId: string,
    personId: string,
    payload: CreateRelativeRequest,
  ): Promise<ApiResponse<Family>> => {
    const res = await axiosInstance.post<ApiResponse<Family>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/spouse`,
      payload,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/persons/{personId}/parent */
  addParent: async (
    treeId: string,
    personId: string,
    payload: CreateRelativeRequest,
  ): Promise<ApiResponse<Family>> => {
    const res = await axiosInstance.post<ApiResponse<Family>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/parent`,
      payload,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/persons/first */
  createFirstPerson: async (
    treeId: string,
    payload: CreateRelativeRequest,
  ): Promise<ApiResponse<Family>> => {
    const res = await axiosInstance.post<ApiResponse<Family>>(
      `${TREES_PATH}/${treeId}/persons/first`,
      payload,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/families/{familyId}/child */
  addChild: async (
    treeId: string,
    familyId: string,
    payload: CreateRelativeRequest,
  ): Promise<ApiResponse<Family>> => {
    const res = await axiosInstance.post<ApiResponse<Family>>(
      `${TREES_PATH}/${treeId}/families/${familyId}/child`,
      payload,
    );
    return res.data;
  },

  /** GET /api/v1/trees/{treeId}/persons/{personId}/family */
  getPersonFamily: async (
    treeId: string,
    personId: string,
  ): Promise<ApiResponse<PersonFamilyDetail>> => {
    const res = await axiosInstance.get<ApiResponse<PersonFamilyDetail>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/family`,
    );
    return res.data;
  },

  /** GET /api/v1/trees/{treeId}/graph */
  getGraph: async (treeId: string): Promise<ApiResponse<GraphData>> => {
    const res = await axiosInstance.get<ApiResponse<GraphData>>(
      `${TREES_PATH}/${treeId}/graph`,
    );
    return res.data;
  },

  /** DELETE /api/v1/trees/{treeId}/families/{familyId} */
  deleteFamily: async (treeId: string, familyId: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/families/${familyId}`,
    );
    return res.data;
  },

  /** DELETE /api/v1/trees/{treeId}/families/{familyId}/children/{personId} */
  removeChildFromFamily: async (
    treeId: string,
    familyId: string,
    personId: string,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/families/${familyId}/children/${personId}`,
    );
    return res.data;
  },
};

export default familyService;
