import type { CardProps } from "@bouncepad/shared";

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
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
  default: `
    bg-[var(--background)]
    border border-[var(--border)]
    shadow-sm
  `,
  glass: "glass-card",
  glow: "glass-card-glow",
};

const glassIntensityClasses = {
  subtle: "glass-subtle",
  medium: "",
  strong: "glass-strong",
};

export function Card({
  variant = "default",
  glassIntensity = "medium",
  padding = "md",
  radius = "lg",
  pressable = false,
  onPress,
  children,
  className,
}: CardProps & { className?: string }) {
  const Component = pressable ? "button" : "div";

  return (
    <Component
      type={pressable ? "button" : undefined}
      onClick={pressable ? onPress : undefined}
      className={`
        ${variantClasses[variant]}
        ${(variant === "glass" || variant === "glow") && glassIntensity !== "medium" ? glassIntensityClasses[glassIntensity] : ""}
        ${paddingClasses[padding]}
        ${radiusClasses[radius]}
        ${pressable ? "cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]" : ""}
        text-left w-full
        ${className ?? ""}
      `}
    >
      {children}
    </Component>
  );
}
