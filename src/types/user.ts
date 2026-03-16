export type Gender = "MALE" | "FEMALE" | "OTHER";
export type UserStatus = "INACTIVE" | "ACTIVE" | "LOCKED" | string;

export interface UserMe {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  avatarUrl: string;
  dateOfBirth: string; // yyyy-mm-dd
  status: UserStatus;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type User = UserMe;

export interface UpdateMeRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string; // yyyy-mm-dd
  avatarUrl: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
