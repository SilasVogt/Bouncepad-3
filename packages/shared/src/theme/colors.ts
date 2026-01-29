// Tailwind color palette for accent colors
// Each accent has shades: 200 (light), 500 (main), 800 (dark)

export const accentColors = {
  red: {
    name: "Red",
    200: "#fecaca",
    500: "#ef4444",
    800: "#991b1b",
  },
  orange: {
    name: "Orange",
    200: "#fed7aa",
    500: "#f97316",
    800: "#9a3412",
  },
  amber: {
    name: "Amber",
    200: "#fde68a",
    500: "#f59e0b",
    800: "#92400e",
  },
  yellow: {
    name: "Yellow",
    200: "#fef08a",
    500: "#eab308",
    800: "#854d0e",
  },
  lime: {
    name: "Lime",
    200: "#d9f99d",
    500: "#84cc16",
    800: "#3f6212",
  },
  green: {
    name: "Green",
    200: "#bbf7d0",
    500: "#22c55e",
    800: "#166534",
  },
  emerald: {
    name: "Emerald",
    200: "#a7f3d0",
    500: "#10b981",
    800: "#065f46",
  },
  teal: {
    name: "Teal",
    200: "#99f6e4",
    500: "#14b8a6",
    800: "#115e59",
  },
  cyan: {
    name: "Cyan",
    200: "#a5f3fc",
    500: "#06b6d4",
    800: "#155e75",
  },
  sky: {
    name: "Sky",
    200: "#bae6fd",
    500: "#0ea5e9",
    800: "#075985",
  },
  blue: {
    name: "Blue",
    200: "#bfdbfe",
    500: "#3b82f6",
    800: "#1e40af",
  },
  indigo: {
    name: "Indigo",
    200: "#c7d2fe",
    500: "#6366f1",
    800: "#3730a3",
  },
  violet: {
    name: "Violet",
    200: "#ddd6fe",
    500: "#8b5cf6",
    800: "#5b21b6",
  },
  purple: {
    name: "Purple",
    200: "#e9d5ff",
    500: "#a855f7",
    800: "#6b21a8",
  },
  fuchsia: {
    name: "Fuchsia",
    200: "#f5d0fe",
    500: "#d946ef",
    800: "#86198f",
  },
  pink: {
    name: "Pink",
    200: "#fbcfe8",
    500: "#ec4899",
    800: "#9d174d",
  },
  rose: {
    name: "Rose",
    200: "#fecdd3",
    500: "#f43f5e",
    800: "#9f1239",
  },
  slate: {
    name: "Slate",
    200: "#e2e8f0",
    500: "#64748b",
    800: "#1e293b",
  },
  // Special "high contrast" - dynamic based on theme mode
  contrast: {
    name: "High Contrast",
    200: "#d4d4d4", // Placeholder, overridden dynamically
    500: "#171717", // Black for light mode (overridden for dark)
    800: "#525252",
  },
} as const;

export type AccentColorKey = keyof typeof accentColors;

export const accentColorKeys = Object.keys(accentColors) as AccentColorKey[];

// GNOME-style simplified color palette (10 colors)
export const gnomeAccentColorKeys: AccentColorKey[] = [
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "slate",
  "contrast",
];

export const defaultAccentColor: AccentColorKey = "blue";

// Text color for solid accent backgrounds (white for dark colors, black for light colors)
// Only blue, indigo, violet, purple are dark enough for white text
// "contrast" is special - handled dynamically in getThemeColors
export const accentTextColors: Record<AccentColorKey, "white" | "black" | "dynamic"> = {
  red: "white",
  orange: "black",
  amber: "black",
  yellow: "black",
  lime: "black",
  green: "black",
  emerald: "black",
  teal: "black",
  cyan: "black",
  sky: "black",
  blue: "white",
  indigo: "white",
  violet: "white",
  purple: "white",
  fuchsia: "black",
  pink: "white",
  rose: "black",
  slate: "black",
  contrast: "dynamic",
};

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  accent: {
    light: string;  // 200
    main: string;   // 500
    dark: string;   // 800
    text: string;   // white or black for contrast on solid backgrounds
  };
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export function getThemeColors(
  accentKey: AccentColorKey,
  isDark: boolean
): ThemeColors {
  const background = isDark ? "#0a0a0a" : "#fafafa";
  const foreground = isDark ? "#ededed" : "#171717";

  // Handle "contrast" specially - it inverts based on theme
  if (accentKey === "contrast") {
    return {
      accent: {
        light: isDark ? "#d4d4d4" : "#525252",
        main: isDark ? "#fafafa" : "#171717",
        dark: isDark ? "#a3a3a3" : "#0a0a0a",
        text: isDark ? "#000000" : "#ffffff",
      },
      background,
      foreground,
      muted: isDark ? "#737373" : "#a3a3a3",
      border: isDark ? "#262626" : "#e5e5e5",
    };
  }

  const accent = accentColors[accentKey];
  const textColorSetting = accentTextColors[accentKey];
  const textColor = textColorSetting === "white" ? "#ffffff" : "#000000";

  return {
    accent: {
      light: accent[200],
      main: accent[500],
      dark: accent[800],
      text: textColor,
    },
    background,
    foreground,
    muted: isDark ? "#737373" : "#a3a3a3",
    border: isDark ? "#262626" : "#e5e5e5",
  };
}
