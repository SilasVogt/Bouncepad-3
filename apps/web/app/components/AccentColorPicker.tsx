import {
  accentColors,
  accentColorKeys,
  gnomeAccentColorKeys,
  type AccentColorKey,
} from "@bouncepad/shared";
import { useTheme } from "~/lib/theme";

interface AccentColorPickerProps {
  variant?: "full" | "gnome";
}

export function AccentColorPicker({ variant = "gnome" }: AccentColorPickerProps) {
  const { accentColor, setAccentColor } = useTheme();
  const colorKeys = variant === "gnome" ? gnomeAccentColorKeys : accentColorKeys;

  return (
    <div className="flex flex-wrap gap-2">
      {colorKeys.map((key) => {
        const color = accentColors[key];
        const isSelected = key === accentColor;

        return (
          <button
            key={key}
            onClick={() => setAccentColor(key)}
            className={`w-8 h-8 rounded-full transition-all ${
              isSelected
                ? "ring-2 ring-offset-2 ring-offset-[var(--background)] ring-[var(--accent-main)] scale-110"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: color[500] }}
            title={color.name}
            aria-label={`Select ${color.name} accent color`}
          />
        );
      })}
    </div>
  );
}
