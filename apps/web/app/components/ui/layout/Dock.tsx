import type { DockProps } from "@bouncepad/shared";

const positionClasses = {
  top: "top-0 left-0 right-0",
  bottom: "bottom-0 left-0 right-0",
  left: "top-0 bottom-0 left-0",
  right: "top-0 bottom-0 right-0",
};

const paddingClasses = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

const gapClasses = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

const glassIntensityClasses = {
  subtle: "glass-subtle",
  medium: "",
  strong: "glass-strong",
};

export function Dock({
  position = "bottom",
  glass = true,
  glassIntensity = "medium",
  padding = "md",
  gap = "sm",
  safeArea = true,
  children,
}: DockProps) {
  const isHorizontal = position === "top" || position === "bottom";

  return (
    <div
      className={`
        fixed z-50
        ${positionClasses[position]}
        ${glass ? "glass-dock" : "bg-[var(--background)] border border-[var(--border)]"}
        ${glass && glassIntensity !== "medium" ? glassIntensityClasses[glassIntensity] : ""}
        ${paddingClasses[padding]}
        ${safeArea && position === "bottom" ? "pb-safe" : ""}
        ${safeArea && position === "top" ? "pt-safe" : ""}
        flex ${isHorizontal ? "flex-row items-center justify-center" : "flex-col items-center justify-center"}
        ${gapClasses[gap]}
      `}
    >
      {children}
    </div>
  );
}
