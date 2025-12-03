"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "organizer" | "player" | "sponsor";
  profilePicture?: string;
  city?: string;
  state?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data.user);
        // Merge persisted phoneVerified from localStorage if backend returns false/undefined
        const persistedPhoneVerified =
          localStorage.getItem("phoneVerified") === "true";
        const mergedUser = {
          ...data.user,
          phoneVerified:
            typeof data.user.phoneVerified === "boolean"
              ? data.user.phoneVerified || persistedPhoneVerified
              : persistedPhoneVerified,
        };
        setUser(mergedUser);
      } else {
        localStorage.removeItem("token");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);

    // Redirect based on role
    if (data.user.role === "organizer") {
      router.push("/organizer/dashboard");
    } else if (data.user.role === "player") {
      router.push("/player/dashboard");
    } else if (data.user.role === "sponsor") {
      router.push("/sponsor/dashboard");
    }
  };

  const register = async (userData: any, redirectTo?: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);

    // Redirect preference
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      // Default redirect based on role
      if (data.user.role === "organizer") {
        router.push("/organizer/dashboard");
      } else if (data.user.role === "player") {
        router.push("/player/dashboard");
      } else if (data.user.role === "sponsor") {
        router.push("/sponsor/dashboard");
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/");
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    // Keep phoneVerified persisted if set to true
    if (updates.phoneVerified === true) {
      localStorage.setItem("phoneVerified", "true");
    }
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
