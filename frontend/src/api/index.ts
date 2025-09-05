// Base exports
export type { ApiResponse, PaginatedResponse } from "./base";
export { ApiError, BaseApiService } from "./base";

// Auth exports
export { authApi } from "./auth";
export type {
  AuthResponse,
  ChangePasswordData,
  LoginData,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
} from "./auth/types";

// Users exports
export { usersApi } from "./users";
export type {
  DeleteAccountData,
  OrganizationUser,
  UpdateProfileData,
  UserSession,
  UserStats,
} from "./users/types";

// Grammar exports
export { analyzeGrammar, getAnalysisHistory } from "./grammar";
export type {
  GrammarAnalysisResult,
  GrammarAnalysisRequest,
  GrammarError,
  GrammarRule,
  GrammarReplacement,
} from "../types/grammar";
