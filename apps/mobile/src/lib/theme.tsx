import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import {
  accentColors,
  defaultAccentColor,
  getThemeColors,
  type AccentColorKey,
  type ThemeMode,
  type ThemeColors,
} from "@bouncepad/shared";

// AsyncStorage import - will be null if native module not linked (needs rebuild)
let AsyncStorage: any = null;

async function getStorage() {
  if (AsyncStorage === null) {
    try {
      const module = await import("@react-native-async-storage/async-storage");
      AsyncStorage = module.default;
    } catch (e) {
      AsyncStorage = false; // Mark as unavailable
    }
  }
  return AsyncStorage || null;
}

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  accentColor: AccentColorKey;
  setAccentColor: (color: AccentColorKey) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY_MODE = "bouncepad-theme-mode";
const STORAGE_KEY_ACCENT = "bouncepad-accent-color";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accentColor, setAccentColorState] =
    useState<AccentColorKey>(defaultAccentColor);

  // Load saved preferences (only if AsyncStorage is available)
  useEffect(() => {
    async function loadPreferences() {
      const storage = await getStorage();
      if (!storage) return;

      try {
        const [savedMode, savedAccent] = await Promise.all([
          storage.getItem(STORAGE_KEY_MODE),
          storage.getItem(STORAGE_KEY_ACCENT),
        ]);

        if (savedMode) setModeState(savedMode as ThemeMode);
        if (savedAccent && savedAccent in accentColors) {
          setAccentColorState(savedAccent as AccentColorKey);
        }
      } catch (e) {
        console.error("Failed to load theme preferences:", e);
      }
    }

    loadPreferences();
  }, []);

  const isDark =
    mode === "dark" || (mode === "system" && systemColorScheme === "dark");

  const colors = getThemeColors(accentColor, isDark);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    const storage = await getStorage();
    if (storage) {
      try {
        await storage.setItem(STORAGE_KEY_MODE, newMode);
      } catch (e) {
        console.error("Failed to save theme mode:", e);
      }
    }
  };

  const setAccentColor = async (color: AccentColorKey) => {
    setAccentColorState(color);
    const storage = await getStorage();
    if (storage) {
      try {
        await storage.setItem(STORAGE_KEY_ACCENT, color);
      } catch (e) {
        console.error("Failed to save accent color:", e);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, isDark, accentColor, setAccentColor, colors }}
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
