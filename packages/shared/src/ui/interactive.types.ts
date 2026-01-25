// Type definitions for interactive components

import type { Size } from "./common.types";
import type { ButtonVariant } from "./primitives.types";

// ============================================================================
// IconButton
// ============================================================================

export interface IconButtonProps {
  /** Icon element to render */
  icon: React.ReactNode;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: Size;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Accessibility label */
  label: string;
  /** Press handler */
  onPress?: () => void;
}

// ============================================================================
// Pressable (Base pressable component with feedback)
// ============================================================================

export interface PressableProps {
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Haptic feedback type (mobile) */
  haptic?: "light" | "medium" | "heavy" | "none";
  /** Scale animation on press */
  scaleOnPress?: boolean;
  /** Content */
  children?: React.ReactNode;
}

// ============================================================================
// Switch
// ============================================================================

export interface SwitchProps {
  /** Whether the switch is on */
  value: boolean;
  /** Change handler */
  onValueChange: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Size of the switch */
  size?: "sm" | "md" | "lg";
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: "left" | "right";
}

// ============================================================================
// Tabs
// ============================================================================

export interface TabItem {
  /** Unique key for the tab */
  key: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab items */
  items: TabItem[];
  /** Currently active tab key */
  activeKey: string;
  /** Change handler */
  onChange: (key: string) => void;
  /** Visual variant */
  variant?: "default" | "pills" | "underline";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Full width tabs */
  fullWidth?: boolean;
}
