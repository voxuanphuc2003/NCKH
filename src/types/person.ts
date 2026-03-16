import type { Gender } from "./user";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  avatarUrl: string;
  dateOfBirth: string;
  dateOfDeath: string;
  citizenIdentificationNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonCreateOrUpdateRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  dateOfDeath?: string;
  citizenIdentificationNumber: string;
  avatarUrl: string;
}

export interface PersonPage {
  content: Person[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

