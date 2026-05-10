"use client";
/*
 - Used on: app-level authentication (login, register, pages needing user)
 - Features: user state, login/logout helpers, refresh user data, inactivity auto-logout
*/
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const WARNING_BEFORE_MS = 5 * 60 * 1000; // warn 5 minutes before logout

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
  inactivityWarning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const router = useRouter();

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    logoutTimerRef.current = null;
    warningTimerRef.current = null;
  }, []);

  const doLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setInactivityWarning(false);
    clearTimers();
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(
      () => {},
    );
    router.push("/");
  }, [router, clearTimers]);

  const resetInactivityTimer = useCallback(() => {
    if (!user) return;
    clearTimers();
    setInactivityWarning(false);

    // Show warning 5 min before auto-logout
    warningTimerRef.current = setTimeout(() => {
      setInactivityWarning(true);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Auto-logout after full timeout
    logoutTimerRef.current = setTimeout(() => {
      doLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [user, clearTimers, doLogout]);

  // Set up activity listeners whenever user is logged in
  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => resetInactivityTimer();

    events.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );
    resetInactivityTimer(); // start the timer on login

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

    if (redirectTo) {
      router.push(redirectTo);
    } else {
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
    doLogout();
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
        inactivityWarning,
      }}
    >
      {/* Inactivity warning toast — shown 5 minutes before auto-logout */}
      {inactivityWarning && (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 z-[9999] flex items-center md:items-start gap-2.5 md:gap-3 bg-amber-950 border border-amber-500/50 text-amber-200 px-3 py-2.5 md:px-5 md:py-4 rounded-xl md:rounded-2xl shadow-2xl shadow-amber-900/40 md:max-w-sm">
          <span className="text-xl md:text-2xl mt-0 md:mt-0.5 shrink-0">⏱️</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-100 text-sm truncate md:whitespace-normal">
              Session expiring
            </p>
            <p className="text-[11px] md:text-xs text-amber-300 leading-tight mt-0.5 truncate md:whitespace-normal">
              Auto-logout in 5 mins.
            </p>
          </div>
          <button
            onClick={() => resetInactivityTimer()}
            className="shrink-0 text-xs bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-3 py-1.5 rounded-lg transition-colors md:self-start"
          >
            Stay
          </button>
        </div>
      )}
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
