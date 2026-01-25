import { View, StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { BadgeProps, BadgeVariant } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Text } from "./Text";

const sizeStyles: Record<"sm" | "md", ViewStyle> = {
  sm: { paddingHorizontal: 10, paddingVertical: 4 },
  md: { paddingHorizontal: 12, paddingVertical: 6 },
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
}: BadgeProps) {
  const { colors, isDark } = useTheme();

  const textContent = (
    <Text
      variant={size === "sm" ? "caption" : "body"}
      weight="semibold"
      style={{
        color: variant === "default" ? "#ffffff" : variant === "outline" ? colors.accent.main : colors.foreground,
        fontSize: size === "sm" ? 11 : 13,
      }}
    >
      {children}
    </Text>
  );

  // Default variant with smooth gradient
  if (variant === "default") {
    return (
      <View style={[styles.container, styles.defaultShadow, { shadowColor: colors.accent.main }]}>
        <LinearGradient
          colors={[colors.accent.main, colors.accent.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {/* Subtle top highlight */}
          <View style={styles.highlight} />
          {textContent}
        </LinearGradient>
      </View>
    );
  }

  // Outline variant
  if (variant === "outline") {
    return (
      <View
        style={[
          styles.container,
          sizeStyles[size],
          {
            borderWidth: 1.5,
            borderColor: colors.accent.main,
            backgroundColor: `${colors.accent.main}10`,
          },
        ]}
      >
        {textContent}
      </View>
    );
  }

  // Glass variant with blur
  return (
    <View
      style={[
        styles.container,
        {
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        },
      ]}
    >
      <BlurView
        intensity={30}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)",
          "transparent",
        ]}
        locations={[0, 0.6]}
        style={StyleSheet.absoluteFill}
      />
      <View style={sizeStyles[size]}>
        {textContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultShadow: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 9999,
    borderTopRightRadius: 9999,
  },
});
