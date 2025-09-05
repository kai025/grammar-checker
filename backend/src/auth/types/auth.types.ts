import { BaseEntity } from '../../common/types';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: string;
  organizationId: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface UserSession extends BaseEntity {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}
