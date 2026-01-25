// Type definitions for feedback components

import type { Size } from "./common.types";

// ============================================================================
// Spinner
// ============================================================================

export interface SpinnerProps {
  /** Size of the spinner */
  size?: Size;
  /** Custom color */
  color?: string;
  /** Label for accessibility */
  label?: string;
}

// ============================================================================
// Toast
// ============================================================================

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast type/severity */
  type?: ToastType;
  /** Title (optional) */
  title?: string;
  /** Duration in ms before auto-dismiss (0 = manual dismiss) */
  duration?: number;
  /** Action button label */
  actionLabel?: string;
  /** Action button handler */
  onAction?: () => void;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Whether to show the toast */
  visible?: boolean;
}

// Toast context for imperative API
export interface ToastOptions {
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastContextValue {
  show: (options: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void;
  error: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void;
  warning: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void;
  info: (message: string, options?: Omit<ToastOptions, "message" | "type">) => void;
  dismiss: () => void;
}

// ============================================================================
// Modal
// ============================================================================

export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropPress?: boolean;
  /** Size (web) */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Modal content */
  children?: React.ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: React.ReactNode;
}
