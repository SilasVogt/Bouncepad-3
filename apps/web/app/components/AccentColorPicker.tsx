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
            className={`w-9 h-9 rounded-full transition-all cursor-pointer ${
              isSelected ? "" : "hover:scale-110"
            }`}
            style={{
              background: `radial-gradient(circle at 35% 30%, ${color[200]}, ${color[500]} 55%, ${color[800]})`,
              boxShadow: isSelected
                ? `inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px ${color[800]}80, 0 0 0 3px var(--background), 0 0 0 5px ${color[500]}, 0 0 20px ${color[500]}90`
                : `inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px ${color[800]}80, 0 2px 8px ${color[500]}40`,
            }}
            title={color.name}
            aria-label={`Select ${color.name} accent color`}
          />
        );
      })}
    </div>
  );
}
