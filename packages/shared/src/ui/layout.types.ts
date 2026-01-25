// Type definitions for layout components

import type {
  Spacing,
  Alignment,
  JustifyContent,
  GlassIntensity,
  Radius,
  Orientation,
} from "./common.types";

// ============================================================================
// Stack (VStack / HStack)
// ============================================================================

export interface StackProps {
  /** Gap between children */
  gap?: Spacing;
  /** Alignment on the cross axis */
  align?: Alignment;
  /** Justification on the main axis */
  justify?: JustifyContent;
  /** Padding inside the stack */
  padding?: Spacing;
  /** Whether children should wrap */
  wrap?: boolean;
  /** Stack content */
  children?: React.ReactNode;
}

export interface VStackProps extends StackProps {}

export interface HStackProps extends StackProps {}

// ============================================================================
// Box
// ============================================================================

export type BoxVariant = "default" | "glass" | "glow";

export interface BoxProps {
  /** Visual variant */
  variant?: BoxVariant;
  /** Glass intensity (only for glass/glow variants) */
  glassIntensity?: GlassIntensity;
  /** Padding inside the box */
  padding?: Spacing;
  /** Margin around the box */
  margin?: Spacing;
  /** Border radius */
  radius?: Radius;
  /** Background color (use CSS variable name or color) */
  bg?: string;
  /** Whether the box should fill available space */
  flex?: boolean | number;
  /** Box content */
  children?: React.ReactNode;
}

// ============================================================================
// Divider
// ============================================================================

export interface DividerProps {
  /** Orientation of the divider */
  orientation?: Orientation;
  /** Spacing around the divider */
  spacing?: Spacing;
  /** Custom color */
  color?: string;
}

// ============================================================================
// HList (Horizontal Scrollable List)
// ============================================================================

export interface HListProps<T> {
  /** Data items to render */
  data: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Key extractor for items */
  keyExtractor?: (item: T, index: number) => string;
  /** Gap between items */
  gap?: Spacing;
  /** Padding at the edges */
  contentPadding?: Spacing;
  /** Whether to show scroll indicators */
  showsScrollIndicator?: boolean;
  /** Snap to items */
  snap?: boolean;
}

// ============================================================================
// VList (Vertical Scrollable List)
// ============================================================================

export interface VListProps<T> {
  /** Data items to render */
  data: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Key extractor for items */
  keyExtractor?: (item: T, index: number) => string;
  /** Gap between items */
  gap?: Spacing;
  /** Padding at the edges */
  contentPadding?: Spacing;
  /** Header component */
  header?: React.ReactNode;
  /** Footer component */
  footer?: React.ReactNode;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Whether refreshing is in progress */
  refreshing?: boolean;
  /** Load more handler (infinite scroll) */
  onEndReached?: () => void;
}

// ============================================================================
// Dock
// ============================================================================

export type DockPosition = "top" | "bottom" | "left" | "right";

export interface DockProps {
  /** Position of the dock */
  position?: DockPosition;
  /** Use glass effect */
  glass?: boolean;
  /** Glass intensity */
  glassIntensity?: GlassIntensity;
  /** Padding inside the dock */
  padding?: Spacing;
  /** Gap between children */
  gap?: Spacing;
  /** Safe area insets */
  safeArea?: boolean;
  /** Dock content */
  children?: React.ReactNode;
}
