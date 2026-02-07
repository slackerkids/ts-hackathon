"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type PropsWithChildren,
} from "react";
import { retrieveRawInitData } from "@tma.js/sdk-react";
import { api } from "./api";

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  role: "guest" | "student" | "club_leader" | "admin";
  school_login?: string;
  school_level?: number;
  school_xp?: number;
  audit_ratio?: number;
  coins?: number;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    try {
      let rawInitData: string | undefined;
      try {
        rawInitData = retrieveRawInitData();
      } catch {
        // Not inside Telegram
      }

      if (rawInitData) {
        const res = await api<{ user: User }>("/api/auth/telegram", {
          method: "POST",
          body: JSON.stringify({ init_data: rawInitData }),
        });
        setUser(res.user);
      }
    } catch (err) {
      console.error("Auth failed:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api<User>("/api/users/me");
      setUser(u);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  return useContext(AuthContext);
}
