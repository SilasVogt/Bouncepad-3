import type { TextProps } from "@bouncepad/shared";

const variantClasses: Record<Required<TextProps>["variant"], string> = {
  display: "text-5xl font-normal tracking-tight font-display", // Instrument Serif for hero headlines
  h1: "text-4xl font-semibold tracking-tight",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-semibold",
  body: "text-base",
  caption: "text-sm",
  label: "text-xs uppercase tracking-wide font-medium",
};

const weightClasses: Record<Required<TextProps>["weight"], string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const alignClasses: Record<Required<TextProps>["align"], string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Text({
  variant = "body",
  weight,
  align,
  muted = false,
  accent = false,
  numberOfLines,
  children,
  className,
}: TextProps & { className?: string }) {
  const Tag =
    variant === "display"
      ? "h1"
      : variant === "h1"
        ? "h1"
        : variant === "h2"
          ? "h2"
          : variant === "h3"
            ? "h3"
            : variant === "h4"
              ? "h4"
              : variant === "label"
                ? "span"
                : "p";

  const colorClass = accent
    ? "text-accent"
    : muted
      ? "text-[var(--muted)]"
      : "text-[var(--foreground)]";

  const truncateClass =
    numberOfLines === 1
      ? "truncate"
      : numberOfLines
        ? `line-clamp-${numberOfLines}`
        : "";

  return (
    <Tag
      className={`
        ${variantClasses[variant]}
        ${weight ? weightClasses[weight] : ""}
        ${align ? alignClasses[align] : ""}
        ${colorClass}
        ${truncateClass}
        ${className ?? ""}
      `}
    >
      {children}
    </Tag>
  );
}
