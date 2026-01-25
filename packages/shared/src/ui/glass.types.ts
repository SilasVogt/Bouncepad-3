// Type definitions for glass effect components

import type { GlassIntensity } from "./common.types";

// ============================================================================
// Glass View (Mobile-specific container with glass effect)
// ============================================================================

export interface GlassViewProps {
  /** Intensity of the blur effect */
  intensity?: GlassIntensity;
  /** Whether to show glow border */
  glow?: boolean;
  /** Tint color (defaults to theme background) */
  tint?: "light" | "dark" | "auto";
  /** Border radius */
  borderRadius?: number;
  /** Padding inside the view */
  padding?: number;
  /** Children content */
  children?: React.ReactNode;
}

// ============================================================================
// Glass CSS class utilities (for reference in web implementation)
// ============================================================================

/**
 * Web glass effect CSS classes:
 *
 * Base: .glass
 * Intensities: .glass-subtle, .glass-strong
 * Glow border: .glass-glow
 * Outer glow shadow: .glass-outer-glow
 *
 * Example usage:
 * <div className="glass glass-glow">...</div>
 */
export const glassClasses = {
  base: "glass",
  subtle: "glass-subtle",
  strong: "glass-strong",
  glow: "glass-glow",
  outerGlow: "glass-outer-glow",
} as const;

export type GlassClass = keyof typeof glassClasses;

// Helper function to build glass class string
export function getGlassClassName(options?: {
  intensity?: GlassIntensity;
  glow?: boolean;
  outerGlow?: boolean;
}): string {
  const classes = ["glass"];

  if (options?.intensity === "subtle") {
    classes.push("glass-subtle");
  } else if (options?.intensity === "strong") {
    classes.push("glass-strong");
  }

  if (options?.glow) {
    classes.push("glass-glow");
  }

  if (options?.outerGlow) {
    classes.push("glass-outer-glow");
  }

  return classes.join(" ");
}
