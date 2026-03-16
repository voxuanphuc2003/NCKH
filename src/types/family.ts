import type { Gender } from "./user";

export type UnionType = "MARRIED" | string;

export interface FamilyPerson {
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

export interface Family {
  id: string;
  parent1: FamilyPerson;
  parent2: FamilyPerson;
  unionType: UnionType;
  fromDate: string;
  toDate: string;
  children: FamilyPerson[];
}

/** Request for adding spouse or parent — includes union info */
export interface CreateRelativeRequest {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  dateOfDeath?: string;
  citizenIdentificationNumber: string;
  avatarUrl: string;
  unionType?: UnionType;
  fromDate?: string;
  toDate?: string;
}

export interface PersonFamilyDetail {
  person: FamilyPerson;
  parentFamily?: Family | null;
  spouseFamilies: Family[];
}

/** Graph node returned by GET /trees/{treeId}/graph and GET /share/graph */
export interface GraphPerson {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  avatarUrl: string;
  dateOfBirth: string;
  dateOfDeath: string;
  generation: number;
}

export interface GraphFamily {
  id: string;
  parent1Id: string | null;
  parent2Id: string | null;
  unionType: UnionType;
  childrenIds: string[];
}

export interface GraphMeta {
  totalPersons: number;
  totalGenerations: number;
  rootPersonId: string;
}

export interface GraphData {
  persons: GraphPerson[];
  families: GraphFamily[];
  meta: GraphMeta;
}
