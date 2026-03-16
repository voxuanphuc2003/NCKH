import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";

export type TreeMemberRole = "VIEWER" | "EDITOR" | "ADMIN" | "OWNER";
export type TreeMemberStatus = "PENDING" | "ACTIVE" | "LEFT" | string;

export interface TreeMember {
  id: string;
  userId: string;
  userName: string;
  fullName: string;
  avatarUrl: string;
  role: TreeMemberRole;
  status: TreeMemberStatus;
  joinedAt: string;
}

const TREES_PATH = "/v1/trees";

const treeMemberService = {
  getMembers: async (treeId: string): Promise<ApiResponse<TreeMember[]>> => {
    const res = await axiosInstance.get<ApiResponse<TreeMember[]>>(
      `${TREES_PATH}/${treeId}/members`,
    );
    return res.data;
  },

  changeRole: async (
    treeId: string,
    targetUserId: string,
    role: TreeMemberRole,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.patch<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/members/${targetUserId}/role`,
      null,
      { params: { role } },
    );
    return res.data;
  },

  removeMember: async (
    treeId: string,
    targetUserId: string,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/members/${targetUserId}`,
    );
    return res.data;
  },
};

export default treeMemberService;

