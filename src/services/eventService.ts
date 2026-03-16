import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { TreeEvent, TreeEventCreateRequest } from "@/types/event";

const TREES_PATH = "/v1/trees";

const eventService = {
  getTreeEvents: async (treeId: string): Promise<ApiResponse<TreeEvent[]>> => {
    const res = await axiosInstance.get<ApiResponse<TreeEvent[]>>(
      `${TREES_PATH}/${treeId}/events`,
    );
    return res.data;
  },

  createTreeEvent: async (
    treeId: string,
    payload: TreeEventCreateRequest,
  ): Promise<ApiResponse<TreeEvent>> => {
    const res = await axiosInstance.post<ApiResponse<TreeEvent>>(
      `${TREES_PATH}/${treeId}/events`,
      payload,
    );
    return res.data;
  },

  addPersonToEvent: async (
    treeId: string,
    eventId: string,
    payload: {
      personId: string;
      eventTypeId: string;
      roleInEventId: string;
      addressId: string;
      name: string;
    },
  ): Promise<ApiResponse<TreeEvent>> => {
    const res = await axiosInstance.post<ApiResponse<TreeEvent>>(
      `${TREES_PATH}/${treeId}/events/${eventId}/persons`,
      payload,
    );
    return res.data;
  },

  getEventDetail: async (treeId: string, eventId: string): Promise<ApiResponse<TreeEvent>> => {
    const res = await axiosInstance.get<ApiResponse<TreeEvent>>(
      `${TREES_PATH}/${treeId}/events/${eventId}`,
    );
    return res.data;
  },

  deleteEvent: async (treeId: string, eventId: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/events/${eventId}`,
    );
    return res.data;
  },

  getEventsOfPerson: async (
    treeId: string,
    personId: string,
  ): Promise<ApiResponse<TreeEvent[]>> => {
    const res = await axiosInstance.get<ApiResponse<TreeEvent[]>>(
      `${TREES_PATH}/${treeId}/events/persons/${personId}`,
    );
    return res.data;
  },

  removePersonFromEvent: async (
    treeId: string,
    eventId: string,
    personId: string,
  ): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(
      `${TREES_PATH}/${treeId}/events/${eventId}/persons/${personId}`,
    );
    return res.data;
  },
};

export default eventService;

