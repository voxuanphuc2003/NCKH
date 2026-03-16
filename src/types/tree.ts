export type TreeRole = "VIEWER" | "EDITOR" | "ADMIN" | "OWNER";

export interface TreeSummary {
  id: string;
  name: string;
  description: string;
  myRole: TreeRole;
  totalMembers: number;
  totalPersons: number;
  createdAt: string;
  updatedAt: string;
}

export type TreeDetail = TreeSummary;

export interface TreeUpsertRequest {
  name: string;
  description: string;
}

