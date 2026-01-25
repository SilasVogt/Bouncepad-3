import type { SkeletonProps } from "@bouncepad/shared";

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({
  width,
  height,
  radius = "md",
  animate = true,
  circle = false,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: circle ? height : width,
    height,
  };

  return (
    <div
      className={`
        bg-[var(--border)]
        ${circle ? "rounded-full" : radiusClasses[radius]}
        ${animate ? "animate-pulse" : ""}
      `}
      style={style}
    />
  );
}
