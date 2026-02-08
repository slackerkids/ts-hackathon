"use client";

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { miniApp } from "@tma.js/sdk-react";
import { Sun, Moon, Monitor } from "lucide-react";

const STORAGE_KEY = "theme-preference";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function resolveSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return miniApp.isDark();
  } catch {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
}

function applyDark(dark: boolean) {
  if (typeof document === "undefined") return;
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemePreference>("system");

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  // Hydrate theme from localStorage on mount (client-only)
  useEffect(() => {
    setThemeState(getStoredPreference());
  }, []);

  // When theme preference changes (user selected light/dark/system), apply immediately
  useEffect(() => {
    if (theme === "light") {
      applyDark(false);
      return;
    }
    if (theme === "dark") {
      applyDark(true);
      return;
    }

    // theme === "system"
    applyDark(resolveSystemDark());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyDark(resolveSystemDark());
    mq.addEventListener("change", listener);

    let unsubTelegram: (() => void) | undefined;
    try {
      if (typeof (miniApp.isDark as { sub?: (fn: () => void) => () => void })?.sub === "function") {
        unsubTelegram = (miniApp.isDark as { sub: (fn: () => void) => () => void }).sub(listener);
      }
    } catch {
      // not in Telegram
    }

    return () => {
      mq.removeEventListener("change", listener);
      unsubTelegram?.();
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Theme switcher UI: Light / Dark / System
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-2">
      <ThemeOption
        value="light"
        label="Light"
        icon={<Sun className="h-4 w-4" />}
        current={theme}
        onSelect={setTheme}
      />
      <ThemeOption
        value="dark"
        label="Dark"
        icon={<Moon className="h-4 w-4" />}
        current={theme}
        onSelect={setTheme}
      />
      <ThemeOption
        value="system"
        label="System"
        icon={<Monitor className="h-4 w-4" />}
        current={theme}
        onSelect={setTheme}
      />
    </div>
  );
}

function ThemeOption({
  value,
  label,
  icon,
  current,
  onSelect,
}: {
  value: ThemePreference;
  label: string;
  icon: React.ReactNode;
  current: ThemePreference;
  onSelect: (t: ThemePreference) => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground hover:bg-accent"
      }`}
      aria-pressed={isActive}
      aria-label={`Theme: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
