import type { InputProps } from "@bouncepad/shared";

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

const variantClasses = {
  default: `
    bg-[var(--background)]
    border border-[var(--border)]
    shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]
    focus:border-[var(--accent-main)] focus:ring-2 focus:ring-[var(--accent-main)]/20
    focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_0_0_3px_color-mix(in_srgb,var(--accent-main)_15%,transparent)]
  `,
  glass: `
    glass-input
  `,
};

export function Input({
  variant = "default",
  size = "md",
  placeholder,
  value,
  onChangeText,
  disabled = false,
  error = false,
  errorMessage,
  type = "text",
  leftElement,
  rightElement,
  label,
}: InputProps) {
  const id = label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--foreground)] mb-1.5 cursor-default"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">
            {leftElement}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChangeText?.(e.target.value)}
          disabled={disabled}
          className={`
            w-full rounded-lg
            text-[var(--foreground)]
            placeholder:text-[var(--muted)]
            outline-none
            transition-all duration-150
            cursor-text
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${leftElement ? "pl-10" : ""}
            ${rightElement ? "pr-10" : ""}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
          `}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {rightElement}
          </div>
        )}
      </div>
      {error && errorMessage && (
        <p className="mt-1.5 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
