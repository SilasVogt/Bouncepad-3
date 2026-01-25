import type { BoxProps } from "@bouncepad/shared";

const paddingClasses = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

const marginClasses = {
  none: "m-0",
  xs: "m-1",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
  "2xl": "m-12",
};

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
};

const variantClasses = {
  default: "",
  glass: "glass",
  glow: "glass glass-glow",
};

const glassIntensityClasses = {
  subtle: "glass-subtle",
  medium: "",
  strong: "glass-strong",
};

export function Box({
  variant = "default",
  glassIntensity = "medium",
  padding = "none",
  margin = "none",
  radius = "none",
  bg,
  flex,
  children,
}: BoxProps) {
  const flexStyle =
    flex === true ? "flex-1" : typeof flex === "number" ? "" : "";
  const flexValue = typeof flex === "number" ? { flex } : undefined;

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${(variant === "glass" || variant === "glow") && glassIntensity !== "medium" ? glassIntensityClasses[glassIntensity] : ""}
        ${paddingClasses[padding]}
        ${marginClasses[margin]}
        ${radiusClasses[radius]}
        ${flexStyle}
      `}
      style={{
        ...flexValue,
        ...(bg ? { backgroundColor: bg.startsWith("var(") ? undefined : bg } : {}),
      }}
    >
      {children}
    </div>
  );
}
