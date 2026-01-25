import type { AvatarProps } from "@bouncepad/shared";

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const statusSizeClasses = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-4 w-4",
};

const statusColorClasses = {
  online: "bg-green-500",
  offline: "bg-[var(--muted)]",
  busy: "bg-red-500",
  away: "bg-yellow-500",
};

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  showStatus = false,
  statusColor = "online",
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className={`relative inline-flex shrink-0 ${sizeClasses[size]}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className={`
            h-full w-full rounded-full
            bg-accent-light text-accent-dark
            flex items-center justify-center
            font-semibold
          `}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizeClasses[size]}
            rounded-full
            ${statusColorClasses[statusColor]}
            ring-2 ring-[var(--background)]
          `}
        />
      )}
    </div>
  );
}
