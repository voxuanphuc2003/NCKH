export type SharePermission = "VIEW" | string;

export interface ShareLink {
  id: string;
  shareUrl: string;
  permission: SharePermission;
  expiresAt: string;
  isActive: boolean;
}

export interface ShareLinkCreateRequest {
  permission: SharePermission;
  expiredAt: string;
}

export interface InvitationCreateRequest {
  email: string;
  role: "VIEWER" | "EDITOR" | "ADMIN" | "OWNER";
}

