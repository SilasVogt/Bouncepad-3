import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  accentColors,
  defaultAccentColor,
  getThemeColors,
  type AccentColorKey,
  type ThemeMode,
} from "@bouncepad/shared";
import { useUser } from "@clerk/tanstack-start";
import { useQuery, useMutation } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  accentColor: AccentColorKey;
  setAccentColor: (color: AccentColorKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY_MODE = "bouncepad-theme-mode";
const STORAGE_KEY_ACCENT = "bouncepad-accent-color";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accentColor, setAccentColorState] =
    useState<AccentColorKey>(defaultAccentColor);
  const [systemDark, setSystemDark] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Clerk user
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const clerkId = clerkUser?.id;

  // Convex user data (only query if logged in)
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  const updateThemePrefs = useMutation(api.users.updateThemePreferences);

  // Load from localStorage initially
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
    const savedAccent = localStorage.getItem(STORAGE_KEY_ACCENT) as AccentColorKey | null;

    if (savedMode) setModeState(savedMode);
    if (savedAccent && savedAccent in accentColors) setAccentColorState(savedAccent);
    setInitialLoadDone(true);
  }, []);

  // Sync from Convex when user data loads
  useEffect(() => {
    if (convexUser && initialLoadDone) {
      if (convexUser.themeMode) {
        setModeState(convexUser.themeMode);
        localStorage.setItem(STORAGE_KEY_MODE, convexUser.themeMode);
      }
      if (convexUser.accentColor && convexUser.accentColor in accentColors) {
        setAccentColorState(convexUser.accentColor as AccentColorKey);
        localStorage.setItem(STORAGE_KEY_ACCENT, convexUser.accentColor);
      }
    }
  }, [convexUser, initialLoadDone]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const isDark = mode === "dark" || (mode === "system" && systemDark);

  // Apply theme to document
  useEffect(() => {
    const colors = getThemeColors(accentColor, isDark);

    document.documentElement.classList.toggle("dark", isDark);

    // Set CSS variables
    document.documentElement.style.setProperty("--accent-light", colors.accent.light);
    document.documentElement.style.setProperty("--accent-main", colors.accent.main);
    document.documentElement.style.setProperty("--accent-dark", colors.accent.dark);
    document.documentElement.style.setProperty("--accent-text", colors.accent.text);
    document.documentElement.style.setProperty("--background", colors.background);
    document.documentElement.style.setProperty("--foreground", colors.foreground);
    document.documentElement.style.setProperty("--muted", colors.muted);
    document.documentElement.style.setProperty("--border", colors.border);
  }, [accentColor, isDark]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);

    // Sync to Convex if logged in
    if (clerkId) {
      updateThemePrefs({ clerkId, themeMode: newMode });
    }
  }, [clerkId, updateThemePrefs]);

  const setAccentColor = useCallback((color: AccentColorKey) => {
    setAccentColorState(color);
    localStorage.setItem(STORAGE_KEY_ACCENT, color);

    // Sync to Convex if logged in
    if (clerkId) {
      updateThemePrefs({ clerkId, accentColor: color });
    }
  }, [clerkId, updateThemePrefs]);

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, isDark, accentColor, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Basic theme provider without Convex sync (for when not logged in / no backend)
export function ThemeProviderBasic({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accentColor, setAccentColorState] =
    useState<AccentColorKey>(defaultAccentColor);
  const [systemDark, setSystemDark] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
    const savedAccent = localStorage.getItem(STORAGE_KEY_ACCENT) as AccentColorKey | null;

    if (savedMode) setModeState(savedMode);
    if (savedAccent && savedAccent in accentColors) setAccentColorState(savedAccent);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const isDark = mode === "dark" || (mode === "system" && systemDark);

  // Apply theme to document
  useEffect(() => {
    const colors = getThemeColors(accentColor, isDark);

    document.documentElement.classList.toggle("dark", isDark);

    document.documentElement.style.setProperty("--accent-light", colors.accent.light);
    document.documentElement.style.setProperty("--accent-main", colors.accent.main);
    document.documentElement.style.setProperty("--accent-dark", colors.accent.dark);
    document.documentElement.style.setProperty("--accent-text", colors.accent.text);
    document.documentElement.style.setProperty("--background", colors.background);
    document.documentElement.style.setProperty("--foreground", colors.foreground);
    document.documentElement.style.setProperty("--muted", colors.muted);
    document.documentElement.style.setProperty("--border", colors.border);
  }, [accentColor, isDark]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  }, []);

  const setAccentColor = useCallback((color: AccentColorKey) => {
    setAccentColorState(color);
    localStorage.setItem(STORAGE_KEY_ACCENT, color);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, isDark, accentColor, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
