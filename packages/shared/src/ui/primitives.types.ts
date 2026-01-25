// Type definitions for primitive UI components

import type { Size, GlassIntensity, Radius } from "./common.types";

// ============================================================================
// Button
// ============================================================================

export type ButtonVariant = "solid" | "outline" | "ghost" | "glass" | "glow";

export interface ButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: Size;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button shows a loading state */
  loading?: boolean;
  /** Icon to show before the label */
  leftIcon?: React.ReactNode;
  /** Icon to show after the label */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children?: React.ReactNode;
  /** Click handler */
  onPress?: () => void;
}

// ============================================================================
// Text
// ============================================================================

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "caption"
  | "label";

export type TextWeight = "normal" | "medium" | "semibold" | "bold";

export type TextAlign = "left" | "center" | "right";

export interface TextProps {
  /** Typography variant */
  variant?: TextVariant;
  /** Font weight override */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Use muted color */
  muted?: boolean;
  /** Use accent color */
  accent?: boolean;
  /** Number of lines before truncating (0 = no limit) */
  numberOfLines?: number;
  /** Text content */
  children?: React.ReactNode;
}

// ============================================================================
// Input
// ============================================================================

export type InputVariant = "default" | "glass";

export interface InputProps {
  /** Visual variant */
  variant?: InputVariant;
  /** Size of the input */
  size?: Exclude<Size, "xs" | "xl">;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Change handler */
  onChangeText?: (text: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Input type (web) / keyboard type (mobile) */
  type?: "text" | "email" | "password" | "number" | "search";
  /** Left icon/element */
  leftElement?: React.ReactNode;
  /** Right icon/element */
  rightElement?: React.ReactNode;
  /** Label text */
  label?: string;
}

// ============================================================================
// Card
// ============================================================================

export type CardVariant = "default" | "glass" | "glow";

export interface CardProps {
  /** Visual variant */
  variant?: CardVariant;
  /** Glass intensity (only for glass/glow variants) */
  glassIntensity?: GlassIntensity;
  /** Padding inside the card */
  padding?: "none" | "sm" | "md" | "lg";
  /** Border radius */
  radius?: Radius;
  /** Whether the card is pressable */
  pressable?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Card content */
  children?: React.ReactNode;
}

// ============================================================================
// Avatar
// ============================================================================

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text / accessibility label */
  alt?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Size of the avatar */
  size?: Size;
  /** Whether to show a status indicator */
  showStatus?: boolean;
  /** Status indicator color */
  statusColor?: "online" | "offline" | "busy" | "away";
}

// ============================================================================
// Badge
// ============================================================================

export type BadgeVariant = "default" | "outline" | "glass";

export interface BadgeProps {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: "sm" | "md";
  /** Badge content */
  children?: React.ReactNode;
}

// ============================================================================
// Skeleton
// ============================================================================

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number | string;
  /** Border radius */
  radius?: Radius;
  /** Whether to show animation */
  animate?: boolean;
  /** Render as a circle */
  circle?: boolean;
}
