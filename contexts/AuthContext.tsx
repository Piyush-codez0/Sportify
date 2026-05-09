"use client";
/*
 - Used on: app-level authentication (login, register, pages needing user)
 - Features: user state, login/logout helpers, refresh user data
*/
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
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data.user);
        // Trust backend state; do not override phoneVerified client-side
        setUser(data.user);
      } else {
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
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);

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
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);

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
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    router.push("/");
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const updateUser = (updates: Partial<User>) => {
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
