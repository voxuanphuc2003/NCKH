import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/api";
import type { Person, PersonCreateOrUpdateRequest, PersonPage } from "@/types/person";

const PERSONS_PATH = "/v1/persons";

const personService = {
  getById: async (id: string): Promise<ApiResponse<Person>> => {
    const res = await axiosInstance.get<ApiResponse<Person>>(`${PERSONS_PATH}/${id}`);
    return res.data;
  },

  update: async (
    id: string,
    payload: PersonCreateOrUpdateRequest,
  ): Promise<ApiResponse<Person>> => {
    const res = await axiosInstance.put<ApiResponse<Person>>(`${PERSONS_PATH}/${id}`, payload);
    return res.data;
  },

  remove: async (id: string): Promise<ApiResponse<string>> => {
    const res = await axiosInstance.delete<ApiResponse<string>>(`${PERSONS_PATH}/${id}`);
    return res.data;
  },

  search: async (
    keyword: string,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<PersonPage>> => {
    const res = await axiosInstance.get<ApiResponse<PersonPage>>(PERSONS_PATH, {
      params: { keyword, page, size },
    });
    return res.data;
  },

  create: async (payload: PersonCreateOrUpdateRequest): Promise<ApiResponse<Person>> => {
    const res = await axiosInstance.post<ApiResponse<Person>>(PERSONS_PATH, payload);
    return res.data;
  },
};

export default personService;

