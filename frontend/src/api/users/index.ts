import { BaseApiService } from "../base";
import type {
  OrganizationUser,
  UserSession,
  UserStats,
  UpdateProfileData,
  DeleteAccountData,
} from "./types";
import type { User } from "../auth/types";

export class UsersApiService extends BaseApiService {
  async updateProfile(data: UpdateProfileData): Promise<{ user: User }> {
    return this.patch<{ user: User }>("/api/users/profile", data);
  }

  async getSessions(): Promise<{ sessions: UserSession[] }> {
    return this.get<{ sessions: UserSession[] }>("/api/users/sessions");
  }

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/users/sessions/${sessionId}`);
  }

  async getOrganizationUsers(): Promise<{ users: OrganizationUser[] }> {
    return this.get<{ users: OrganizationUser[] }>("/api/users/organization");
  }

  async getUserStats(): Promise<{ stats: UserStats }> {
    return this.get<{ stats: UserStats }>("/api/users/stats");
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<{ avatarUrl: string }>("/api/users/avatar", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async deleteAccount(data: DeleteAccountData): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/users/account", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }
}

export const usersApi = new UsersApiService();
