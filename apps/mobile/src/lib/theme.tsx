import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  accentColors,
  defaultAccentColor,
  getThemeColors,
  type AccentColorKey,
  type ThemeMode,
  type ThemeColors,
} from "@bouncepad/shared";

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        const [savedMode, savedAccent] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_MODE),
          AsyncStorage.getItem(STORAGE_KEY_ACCENT),
        ]);

        if (savedMode) setModeState(savedMode as ThemeMode);
        if (savedAccent && savedAccent in accentColors) {
          setAccentColorState(savedAccent as AccentColorKey);
        }
      } catch (e) {
        console.error("Failed to load theme preferences:", e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadPreferences();
  }, []);

  const isDark =
    mode === "dark" || (mode === "system" && systemColorScheme === "dark");

  const colors = getThemeColors(accentColor, isDark);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MODE, newMode);
    } catch (e) {
      console.error("Failed to save theme mode:", e);
    }
  };

  const setAccentColor = async (color: AccentColorKey) => {
    setAccentColorState(color);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ACCENT, color);
    } catch (e) {
      console.error("Failed to save accent color:", e);
    }
  };

  // Don't render until preferences are loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

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
