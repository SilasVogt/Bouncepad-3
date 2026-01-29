import type { ButtonProps } from "@bouncepad/shared";
import { Spinner } from "../feedback/Spinner";

const sizeClasses = {
  xs: { base: "py-1 text-xs gap-1", px: "px-2.5", pxLeft: "pl-2 pr-2.5", pxRight: "pl-2.5 pr-2", pxBoth: "px-2" },
  sm: { base: "py-1.5 text-sm gap-1.5", px: "px-3.5", pxLeft: "pl-2.5 pr-3.5", pxRight: "pl-3.5 pr-2.5", pxBoth: "px-2.5" },
  md: { base: "py-2 text-sm gap-2", px: "px-4", pxLeft: "pl-3 pr-4", pxRight: "pl-4 pr-3", pxBoth: "px-3" },
  lg: { base: "py-2.5 text-base gap-2", px: "px-5", pxLeft: "pl-3.5 pr-5", pxRight: "pl-5 pr-3.5", pxBoth: "px-3.5" },
  xl: { base: "py-3 text-lg gap-2.5", px: "px-6", pxLeft: "pl-4 pr-6", pxRight: "pl-6 pr-4", pxBoth: "px-4" },
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

export function Button({
  variant = "solid",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeConfig = sizeClasses[size];

  // Determine padding based on icon presence
  const getPaddingClass = () => {
    if (leftIcon && rightIcon) return sizeConfig.pxBoth;
    if (leftIcon) return sizeConfig.pxLeft;
    if (rightIcon) return sizeConfig.pxRight;
    return sizeConfig.px;
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onPress}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        cursor-pointer
        select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeConfig.base}
        ${getPaddingClass()}
        ${variantClasses[variant]}
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {loading ? (
        <Spinner size={spinnerSizes[size]} color={variant === "solid" ? "var(--accent-text)" : undefined} />
      ) : (
        <>
          {leftIcon && <span className="shrink-0 inline-flex items-center justify-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0 inline-flex items-center justify-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
