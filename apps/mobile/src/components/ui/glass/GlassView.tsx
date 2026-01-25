import { Platform, View, StyleSheet, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { GlassViewProps } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";

// Extended props to support tint color
interface ExtendedGlassViewProps extends GlassViewProps {
  tintColor?: string;
  isInteractive?: boolean;
}

export function GlassView({
  intensity = "medium",
  glow = false,
  tintColor,
  borderRadius = 16,
  padding = 16,
  children,
}: ExtendedGlassViewProps) {
  const { isDark, colors } = useTheme();

  // Map intensity to blur amount
  const blurIntensity = intensity === "subtle" ? 30 : intensity === "strong" ? 80 : 50;

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: "hidden",
  };

  const borderStyle: ViewStyle = glow
    ? {
        borderWidth: 1.5,
        borderColor: `${colors.accent.main}50`,
        shadowColor: colors.accent.main,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
      }
    : {
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
      };

  const contentStyle: ViewStyle = {
    padding,
  };

  // iOS: Use BlurView for frosted glass effect
  if (Platform.OS === "ios") {
    return (
      <View style={[containerStyle, borderStyle]}>
        {/* Blur layer */}
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {/* Tint overlay */}
        {tintColor && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `${tintColor}30` },
            ]}
            pointerEvents="none"
          />
        )}
        <View style={contentStyle}>{children}</View>
      </View>
    );
  }

  // Android fallback: Solid background with tint
  const bgColor = isDark ? "rgba(30,30,30,0.95)" : "rgba(250,250,250,0.95)";

  return (
    <View style={[containerStyle, borderStyle, { backgroundColor: bgColor }]}>
      {/* Tint overlay if tintColor is provided */}
      {tintColor && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `${tintColor}20` },
          ]}
          pointerEvents="none"
        />
      )}
      {/* Subtle gradient overlay for depth */}
      <LinearGradient
        colors={[
          isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.3)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
