import type { SpinnerProps } from "@bouncepad/shared";

const sizeConfig = {
  xs: { size: 12, stroke: 2 },
  sm: { size: 16, stroke: 2 },
  md: { size: 24, stroke: 3 },
  lg: { size: 32, stroke: 3 },
  xl: { size: 48, stroke: 4 },
};

export function Spinner({ size = "md", color, label = "Loading" }: SpinnerProps) {
  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const accentColor = color || "var(--accent-main)";

  return (
    <svg
      role="status"
      aria-label={label}
      className="animate-spin"
      width={config.size}
      height={config.size}
      viewBox={`0 0 ${config.size} ${config.size}`}
      style={{ animationDuration: "0.8s" }}
    >
      {/* Background track */}
      <circle
        cx={config.size / 2}
        cy={config.size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={config.stroke}
        opacity={0.3}
      />

      {/* Spinning arc */}
      <circle
        cx={config.size / 2}
        cy={config.size / 2}
        r={radius}
        fill="none"
        stroke={accentColor}
        strokeWidth={config.stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.65} ${circumference * 0.35}`}
      />

      {/* Bright tip highlight */}
      <circle
        cx={config.size / 2}
        cy={config.size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={config.stroke * 0.5}
        strokeLinecap="round"
        strokeDasharray={`${config.stroke * 1.5} ${circumference}`}
        opacity={0.5}
      />
    </svg>
  );
}
