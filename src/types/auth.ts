export interface AuthData {
  userId: string;
  userName: string;
  email?: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  accessToken: string;
  tokenType: string;
}

export interface AuthResponse {
  success: boolean;
  code: number;
  message: string;
  data: AuthData;
  timestamp: string;
}

export interface RegisterRequest {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string; // yyyy-mm-dd
}

export interface LoginRequest {
  userName: string;
  password: string;
}
