export interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface UserStats {
  dataSources: number;
  reports: number;
  workflows: number;
  forecastUploads: number;
  activeWorkflows: number;
  recentReports: number;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  organization?: string;
}

export interface DeleteAccountData {
  password: string;
  confirmation: string;
}
