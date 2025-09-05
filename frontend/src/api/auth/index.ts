import { BaseApiService } from "../base";
import type {
  LoginData,
  RegisterData,
  ChangePasswordData,
  LoginResponse,
  RegisterResponse,
  User,
} from "./types";

export class AuthApiService extends BaseApiService {
  async login(data: LoginData): Promise<LoginResponse> {
    return this.post<LoginResponse>("/api/auth/login", data);
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    return this.post<RegisterResponse>("/api/auth/register", data);
  }

  async logout(): Promise<void> {
    return this.post<void>("/api/auth/logout");
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.post<{ token: string }>("/api/auth/refresh");
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.get<{ user: User }>("/api/auth/me");
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    return this.patch<void>("/api/auth/change-password", data);
  }
}

export const authApi = new AuthApiService();
