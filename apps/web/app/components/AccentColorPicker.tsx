import { accentColors, accentColorKeys, type AccentColorKey } from "@bouncepad/shared";
import { useTheme } from "~/lib/theme";

export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useTheme();

  return (
    <div className="flex flex-wrap gap-2">
      {accentColorKeys.map((key) => {
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
