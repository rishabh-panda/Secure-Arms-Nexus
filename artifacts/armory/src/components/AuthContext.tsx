import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
    }
  });

  const refreshAuth = () => {
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const logoutLocal = () => {
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  const value = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
    isAdmin: user?.role === "admin",
    logout: logoutLocal,
    refreshAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
