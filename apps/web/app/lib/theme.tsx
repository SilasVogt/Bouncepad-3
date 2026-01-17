import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  accentColors,
  defaultAccentColor,
  getThemeColors,
  type AccentColorKey,
  type ThemeMode,
} from "@bouncepad/shared";

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

  // Load saved preferences
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

    // Set CSS variables
    document.documentElement.style.setProperty("--accent-light", colors.accent.light);
    document.documentElement.style.setProperty("--accent-main", colors.accent.main);
    document.documentElement.style.setProperty("--accent-dark", colors.accent.dark);
    document.documentElement.style.setProperty("--background", colors.background);
    document.documentElement.style.setProperty("--foreground", colors.foreground);
    document.documentElement.style.setProperty("--muted", colors.muted);
    document.documentElement.style.setProperty("--border", colors.border);
  }, [accentColor, isDark]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  };

  const setAccentColor = (color: AccentColorKey) => {
    setAccentColorState(color);
    localStorage.setItem(STORAGE_KEY_ACCENT, color);
  };

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
