import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { Address, AddressCreateRequest, TreeAddressRequest } from "@/types/address";

const TREES_PATH = "/v1/trees";

const addressService = {
  // ── Tree Addresses ─────────────────────────────────────────────────────────

  /** GET /api/v1/trees/{treeId}/addresses */
  getTreeAddresses: async (treeId: string): Promise<ApiResponse<Address[]>> => {
    const res = await axiosInstance.get<ApiResponse<Address[]>>(
      `${TREES_PATH}/${treeId}/addresses`,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/addresses */
  createTreeAddress: async (
    treeId: string,
    payload: TreeAddressRequest,
  ): Promise<ApiResponse<Address>> => {
    const res = await axiosInstance.post<ApiResponse<Address>>(
      `${TREES_PATH}/${treeId}/addresses`,
      payload,
    );
    return res.data;
  },

  /** PUT /api/v1/trees/{treeId}/addresses/{treeAddressId} */
  updateTreeAddress: async (
    treeId: string,
    treeAddressId: string,
    payload: TreeAddressRequest,
  ): Promise<ApiResponse<Address>> => {
    const res = await axiosInstance.put<ApiResponse<Address>>(
      `${TREES_PATH}/${treeId}/addresses/${treeAddressId}`,
      payload,
    );
    return res.data;
  },

  /** DELETE /api/v1/trees/{treeId}/addresses/{treeAddressId} */
  deleteTreeAddress: async (
    treeId: string,
    treeAddressId: string,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/addresses/${treeAddressId}`,
    );
    return res.data;
  },

  // ── Person Addresses (tree-scoped) ─────────────────────────────────────────

  /** GET /api/v1/trees/{treeId}/persons/{personId}/addresses */
  getPersonAddresses: async (
    treeId: string,
    personId: string,
  ): Promise<ApiResponse<Address[]>> => {
    const res = await axiosInstance.get<ApiResponse<Address[]>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/addresses`,
    );
    return res.data;
  },

  /** POST /api/v1/trees/{treeId}/persons/{personId}/addresses */
  createPersonAddress: async (
    treeId: string,
    personId: string,
    payload: AddressCreateRequest,
  ): Promise<ApiResponse<Address>> => {
    const res = await axiosInstance.post<ApiResponse<Address>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/addresses`,
      payload,
    );
    return res.data;
  },

  /** PUT /api/v1/trees/{treeId}/persons/{personId}/addresses/{addressId} */
  updatePersonAddress: async (
    treeId: string,
    personId: string,
    addressId: string,
    payload: AddressCreateRequest,
  ): Promise<ApiResponse<Address>> => {
    const res = await axiosInstance.put<ApiResponse<Address>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/addresses/${addressId}`,
      payload,
    );
    return res.data;
  },

  /** DELETE /api/v1/trees/{treeId}/persons/{personId}/addresses/{addressId} */
  deletePersonAddress: async (
    treeId: string,
    personId: string,
    addressId: string,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/persons/${personId}/addresses/${addressId}`,
    );
    return res.data;
  },
};

export default addressService;
