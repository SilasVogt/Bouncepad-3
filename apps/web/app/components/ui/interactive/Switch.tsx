import type { SwitchProps } from "@bouncepad/shared";

const sizeClasses = {
  sm: {
    track: "h-[22px] w-[40px]",
    thumb: "h-[18px] w-[18px]",
    translateOn: "translate-x-[20px]",
    translateOff: "translate-x-[2px]",
  },
  md: {
    track: "h-[26px] w-[48px]",
    thumb: "h-[22px] w-[22px]",
    translateOn: "translate-x-[24px]",
    translateOff: "translate-x-[2px]",
  },
  lg: {
    track: "h-[32px] w-[58px]",
    thumb: "h-[28px] w-[28px]",
    translateOn: "translate-x-[28px]",
    translateOff: "translate-x-[2px]",
  },
};

export function Switch({
  value,
  onValueChange,
  disabled = false,
  size = "md",
  label,
  labelPosition = "right",
}: SwitchProps) {
  const sizes = sizeClasses[size];

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onValueChange(!value)}
      className={`
        relative inline-flex shrink-0
        ${sizes.track}
        items-center rounded-full
        cursor-pointer
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-main)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${value
          ? `
            bg-gradient-to-b from-[var(--accent-main)] to-[color-mix(in_srgb,var(--accent-dark)_30%,var(--accent-main))]
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(0,0,0,0.15),0_2px_8px_-2px_var(--accent-main)]
            border border-[color-mix(in_srgb,var(--accent-dark)_40%,var(--accent-main))]
          `
          : `
            bg-gradient-to-b from-[color-mix(in_srgb,var(--foreground)_12%,var(--background))] to-[color-mix(in_srgb,var(--foreground)_18%,var(--background))]
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(0,0,0,0.05)]
            border border-[color-mix(in_srgb,var(--foreground)_15%,transparent)]
          `
        }
      `}
    >
      {/* Thumb */}
      <span
        className={`
          ${sizes.thumb}
          rounded-full
          bg-gradient-to-b from-white to-[#f0f0f0]
          shadow-[0_2px_4px_rgba(0,0,0,0.2),0_4px_8px_-2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.05)]
          border border-[rgba(0,0,0,0.08)]
          transition-all duration-300 ease-out
          ${value ? sizes.translateOn : sizes.translateOff}
        `}
      />
    </button>
  );

  if (!label) {
    return toggle;
  }

  return (
    <label
      className={`
        inline-flex items-center gap-3
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${labelPosition === "left" ? "flex-row-reverse" : "flex-row"}
      `}
    >
      {toggle}
      <span className="text-sm text-[var(--foreground)] select-none">{label}</span>
    </label>
  );
}
