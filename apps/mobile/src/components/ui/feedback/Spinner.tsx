import { ActivityIndicator } from "react-native";
import type { SpinnerProps, Size } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";

const sizeMap: Record<Size, "small" | "large"> = {
  xs: "small",
  sm: "small",
  md: "small",
  lg: "large",
  xl: "large",
};

export function Spinner({ size = "md", color, label }: SpinnerProps) {
  const { colors } = useTheme();

  return (
    <ActivityIndicator
      size={sizeMap[size]}
      color={color ?? colors.accent.main}
      accessibilityLabel={label ?? "Loading"}
    />
  );
}
