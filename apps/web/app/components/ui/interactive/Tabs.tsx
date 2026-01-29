import type { TabsProps } from "@bouncepad/shared";

const sizeClasses = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

const variantStyles = {
  default: {
    container: "glass p-1 rounded-lg",
    tab: "rounded-md",
    active: "bg-[var(--background)] shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
    inactive: "hover:bg-[var(--foreground)]/5",
  },
  pills: {
    container: "gap-2",
    tab: "rounded-full border",
    active: `
      bg-gradient-to-b from-[color-mix(in_srgb,var(--accent-light)_30%,var(--accent-main))] via-[var(--accent-main)] to-[color-mix(in_srgb,var(--accent-dark)_20%,var(--accent-main))]
      border-[color-mix(in_srgb,var(--accent-dark)_50%,var(--accent-main))]
      shadow-[inset_0_1px_0_color-mix(in_srgb,white_30%,var(--accent-main)),inset_0_-1px_0_color-mix(in_srgb,var(--accent-dark)_40%,var(--accent-main)),0_2px_8px_-2px_color-mix(in_srgb,var(--accent-main)_60%,transparent)]
      text-[var(--accent-text)]
    `,
    inactive: "bg-transparent border-transparent shadow-none text-[var(--foreground)] hover:bg-[var(--foreground)]/10",
  },
  underline: {
    container: "border-b border-[var(--border)]",
    tab: "border-b-2 -mb-px rounded-none",
    active: "border-[var(--accent-main)] text-[var(--accent-main)]",
    inactive: "border-transparent hover:border-[var(--muted)]/50",
  },
};

export function Tabs({
  items,
  activeKey,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = false,
}: TabsProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="tablist"
      className={`
        flex ${fullWidth ? "w-full" : "inline-flex"}
        ${styles.container}
      `}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onChange(item.key)}
            className={`
              inline-flex items-center justify-center gap-2
              font-medium
              cursor-pointer
              select-none
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/60 focus-visible:ring-inset
              disabled:opacity-50 disabled:cursor-not-allowed
              ${fullWidth ? "flex-1" : ""}
              ${sizeClasses[size]}
              ${styles.tab}
              ${isActive ? styles.active : styles.inactive}
              ${!isActive && variant !== "pills" ? "text-[var(--muted)]" : ""}
              ${isActive && variant === "default" ? "text-[var(--foreground)]" : ""}
            `}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
