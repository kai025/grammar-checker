export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  organizationId?: string;
  phone?: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organization?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginResponse extends AuthResponse {
  message: string;
}

export interface RegisterResponse extends AuthResponse {
  message: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  organization?: string;
}
