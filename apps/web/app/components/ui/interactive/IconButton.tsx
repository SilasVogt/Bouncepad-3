import type { IconButtonProps } from "@bouncepad/shared";
import { Spinner } from "../feedback/Spinner";

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
};

const iconSizeClasses = {
  xs: "[&_svg]:h-3.5 [&_svg]:w-3.5",
  sm: "[&_svg]:h-4 [&_svg]:w-4",
  md: "[&_svg]:h-5 [&_svg]:w-5",
  lg: "[&_svg]:h-6 [&_svg]:w-6",
  xl: "[&_svg]:h-7 [&_svg]:w-7",
};

const spinnerSizes = {
  xs: "xs" as const,
  sm: "xs" as const,
  md: "sm" as const,
  lg: "sm" as const,
  xl: "md" as const,
};

const variantClasses = {
  solid: `
    solid-button-3d text-[var(--accent-text)]
  `,
  outline: `
    outline-button-3d text-[var(--foreground)]
  `,
  ghost: `
    bg-transparent text-[var(--foreground)]
    hover:bg-[var(--foreground)]/10
    active:bg-[var(--foreground)]/15
    transition-colors duration-150
  `,
  glass: `
    glass-button text-[var(--foreground)]
  `,
  glow: `
    glow-button text-[var(--foreground)]
  `,
};

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  disabled = false,
  loading = false,
  label,
  onPress,
}: IconButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onPress}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-lg
        cursor-pointer
        select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeClasses[size]}
        ${iconSizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      <span className="inline-flex items-center justify-center">
        {loading ? <Spinner size={spinnerSizes[size]} color={variant === "solid" ? "var(--accent-text)" : undefined} /> : icon}
      </span>
    </button>
  );
}
