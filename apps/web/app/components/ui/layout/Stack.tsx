import type { VStackProps, HStackProps } from "@bouncepad/shared";

const gapClasses = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

const paddingClasses = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

export function VStack({
  gap = "md",
  align = "stretch",
  justify = "start",
  padding = "none",
  wrap = false,
  children,
  className,
}: VStackProps & { className?: string }) {
  return (
    <div
      className={`
        flex flex-col
        ${gapClasses[gap]}
        ${alignClasses[align]}
        ${justifyClasses[justify]}
        ${paddingClasses[padding]}
        ${wrap ? "flex-wrap" : ""}
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
}

export function HStack({
  gap = "md",
  align = "center",
  justify = "start",
  padding = "none",
  wrap = false,
  children,
  className,
}: HStackProps & { className?: string }) {
  return (
    <div
      className={`
        flex flex-row
        ${gapClasses[gap]}
        ${alignClasses[align]}
        ${justifyClasses[justify]}
        ${paddingClasses[padding]}
        ${wrap ? "flex-wrap" : ""}
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
}

// Re-export for convenience
export const Stack = { V: VStack, H: HStack };
