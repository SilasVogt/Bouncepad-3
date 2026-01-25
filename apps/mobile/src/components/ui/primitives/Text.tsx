import { Text as RNText, type TextStyle } from "react-native";
import type { TextProps } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";

// Extended props for mobile-specific style overrides
interface MobileTextProps extends TextProps {
  style?: TextStyle;
}

const variantStyles: Record<Required<TextProps>["variant"], TextStyle> = {
  h1: { fontSize: 32, fontWeight: "700", letterSpacing: -0.5 },
  h2: { fontSize: 28, fontWeight: "600", letterSpacing: -0.3 },
  h3: { fontSize: 24, fontWeight: "600" },
  h4: { fontSize: 20, fontWeight: "600" },
  body: { fontSize: 16, fontWeight: "400" },
  caption: { fontSize: 14, fontWeight: "400" },
  label: { fontSize: 12, fontWeight: "500", letterSpacing: 0.5, textTransform: "uppercase" },
};

const weightStyles: Record<Required<TextProps>["weight"], TextStyle> = {
  normal: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  semibold: { fontWeight: "600" },
  bold: { fontWeight: "700" },
};

const alignStyles: Record<Required<TextProps>["align"], TextStyle> = {
  left: { textAlign: "left" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
};

export function Text({
  variant = "body",
  weight,
  align,
  muted = false,
  accent = false,
  numberOfLines,
  children,
  style,
}: MobileTextProps) {
  const { colors } = useTheme();

  const textColor = accent
    ? colors.accent.main
    : muted
      ? colors.muted
      : colors.foreground;

  return (
    <RNText
      style={[
        variantStyles[variant],
        weight && weightStyles[weight],
        align && alignStyles[align],
        { color: textColor },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}
