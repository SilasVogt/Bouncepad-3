import { Pressable, View, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import type { CardProps, Radius } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { GlassView } from "../glass/GlassView";

const paddingMap: Record<"none" | "sm" | "md" | "lg", number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

const radiusMap: Record<Radius, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  variant = "default",
  glassIntensity = "medium",
  padding = "md",
  radius = "lg",
  pressable = false,
  onPress,
  children,
}: CardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  // Glass and glow variants use GlassView
  if (variant === "glass" || variant === "glow") {
    const content = (
      <GlassView
        intensity={glassIntensity}
        glow={variant === "glow"}
        borderRadius={radiusMap[radius]}
        padding={paddingMap[padding]}
      >
        {children}
      </GlassView>
    );

    if (pressable) {
      return (
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
        >
          {content}
        </AnimatedPressable>
      );
    }

    return content;
  }

  // Default variant with depth
  const containerStyle: ViewStyle = {
    borderRadius: radiusMap[radius],
    padding: paddingMap[padding],
    overflow: "hidden",
    // Subtle shadow for depth
    shadowColor: isDark ? "#000" : "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 3,
    // Border
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    // Background
    backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
  };

  const content = (
    <View style={containerStyle}>
      {/* Inner highlight gradient for 3D effect */}
      <LinearGradient
        colors={[
          isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
          isDark ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.2)",
          "transparent",
        ]}
        locations={[0, 0.3, 1]}
        style={[StyleSheet.absoluteFill, { borderRadius: radiusMap[radius] }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );

  if (pressable) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}
