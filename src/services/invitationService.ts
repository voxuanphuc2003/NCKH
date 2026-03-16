import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { InvitationCreateRequest, ShareLink, ShareLinkCreateRequest } from "@/types/invitation";
import type { TreeDetail } from "@/types/tree";
import type { GraphData } from "@/types/family";

const TREES_PATH = "/v1/trees";

const invitationService = {
  /** GET /api/v1/trees/{treeId}/share-links */
  getShareLinks: async (treeId: string): Promise<ApiResponse<ShareLink[]>> => {
    const res = await axiosInstance.get<ApiResponse<ShareLink[]>>(
      `${TREES_PATH}/${treeId}/share-links`,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/share-links */
  createShareLink: async (
    treeId: string,
    payload: ShareLinkCreateRequest,
  ): Promise<ApiResponse<ShareLink>> => {
    const res = await axiosInstance.post<ApiResponse<ShareLink>>(
      `${TREES_PATH}/${treeId}/share-links`,
      payload,
    );
    return res.data;
  },

  /** DELETE /api/v1/trees/{treeId}/share-links/{shareLinkId} */
  revokeShareLink: async (
    treeId: string,
    shareLinkId: string,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/share-links/${shareLinkId}`,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/invitations */
  sendInvitation: async (
    treeId: string,
    payload: InvitationCreateRequest,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.post<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/invitations`,
      payload,
    );
    return res.data;
  },

  /** POST /api/v1/invitations/accept?token=... */
  acceptInvitation: async (token: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.post<ApiResponse<string>>(`/v1/invitations/accept`, null, {
      params: { token },
    });
    return res.data;
  },

  /** GET /api/v1/share?token=... */
  getTreeByShareToken: async (token: string): Promise<ApiResponse<TreeDetail>> => {
    const res = await axiosInstance.get<ApiResponse<TreeDetail>>(`/v1/share`, {
      params: { token },
    });
    return res.data;
  },

  /** GET /api/v1/share/graph?token=... */
  getShareGraph: async (token: string): Promise<ApiResponse<GraphData>> => {
    const res = await axiosInstance.get<ApiResponse<GraphData>>(`/v1/share/graph`, {
      params: { token },
    });
    return res.data;
  },
};

export default invitationService;
