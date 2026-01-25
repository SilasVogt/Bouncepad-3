import type { DividerProps } from "@bouncepad/shared";

const spacingClasses = {
  none: "",
  xs: "my-1",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
  xl: "my-8",
  "2xl": "my-12",
};

const verticalSpacingClasses = {
  none: "",
  xs: "mx-1",
  sm: "mx-2",
  md: "mx-4",
  lg: "mx-6",
  xl: "mx-8",
  "2xl": "mx-12",
};

export function Divider({
  orientation = "horizontal",
  spacing = "md",
  color,
}: DividerProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      role="separator"
      className={`
        ${isHorizontal ? `w-full h-px ${spacingClasses[spacing]}` : `h-full w-px ${verticalSpacingClasses[spacing]}`}
        bg-[var(--border)]
      `}
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}
