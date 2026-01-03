// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserInfo {
  email: string;
  agencyId: string;
  role: string;
}

export interface ValidationResponse {
  valid: boolean;
  email?: string;
  role?: string;
  agencyId?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}
