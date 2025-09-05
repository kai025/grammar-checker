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

export interface UserCreate {
  email: string;
  password: string;
  name: string;
  organizationId: string;
  role?: string;
  phone?: string;
  avatar?: string;
}

export interface UserUpdate {
  name?: string;
  role?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UserFilter {
  organizationId?: string;
  role?: string;
  isActive?: boolean;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  organization?: {
    id: string;
    name: string;
    domain?: string;
  };
}
