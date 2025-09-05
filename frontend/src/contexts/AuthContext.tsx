import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";
import type { User } from "@/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    organization?: string;
  }) => Promise<{ user: User; token: string }>;
  updateProfile: (data: { name?: string; phone?: string; organization?: string }) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authHook = useAuthHook();

  return <AuthContext.Provider value={authHook}>{children}</AuthContext.Provider>;
};
