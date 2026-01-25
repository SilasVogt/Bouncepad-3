import type { BadgeProps } from "@bouncepad/shared";

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

const variantClasses = {
  default: `
    bg-accent text-white
  `,
  outline: `
    bg-transparent text-accent
    border border-accent
  `,
  glass: `
    glass text-[var(--foreground)]
  `,
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
}
