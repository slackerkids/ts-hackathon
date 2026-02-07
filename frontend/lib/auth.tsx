"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
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
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function authenticate() {
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
    }

    authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  return useContext(AuthContext);
}
