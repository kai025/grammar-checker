import { useState, useEffect } from "react";
import { authApi, usersApi } from "@/api";
import type { User } from "@/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      try {
        const { user } = await authApi.getCurrentUser();
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem("authToken");
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await authApi.login({ email, password });

      // Store the token in localStorage
      localStorage.setItem("authToken", token);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { user, token };
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    organization?: string;
  }) => {
    try {
      const { user, token } = await authApi.register(data);

      // Store the token in localStorage
      localStorage.setItem("authToken", token);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { user, token };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      // Remove the token from localStorage
      localStorage.removeItem("authToken");
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; organization?: string }) => {
    try {
      const { user } = await usersApi.updateProfile(data);
      setAuthState((prev) => ({
        ...prev,
        user,
      }));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
    } catch (error) {
      throw error;
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
};
