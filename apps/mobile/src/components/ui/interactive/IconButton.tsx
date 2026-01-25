import { Pressable, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { IconButtonProps, Size, ButtonVariant } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Spinner } from "../feedback/Spinner";

const sizeMap: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 52,
  xl: 60,
};

const spinnerSizes: Record<Size, Size> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "sm",
  xl: "md",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  disabled = false,
  loading = false,
  label,
  onPress,
}: IconButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;
  const buttonSize = sizeMap[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const iconColor = variant === "solid" ? "#ffffff" : colors.foreground;
  const content = loading ? <Spinner size={spinnerSizes[size]} color={iconColor} /> : icon;

  // Solid variant with smooth gradient
  if (variant === "solid") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityLabel={label}
        style={[
          styles.container,
          styles.solidShadow,
          { width: buttonSize, height: buttonSize, shadowColor: colors.accent.main },
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.accent.main, colors.accent.dark]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        <View style={styles.solidHighlight} />
        {content}
      </AnimatedPressable>
    );
  }

  // Outline variant
  if (variant === "outline") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityLabel={label}
        style={[
          styles.container,
          {
            width: buttonSize,
            height: buttonSize,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          },
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)",
            "transparent",
          ]}
          locations={[0, 0.4]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {content}
      </AnimatedPressable>
    );
  }

  // Ghost variant
  if (variant === "ghost") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityLabel={label}
        style={[
          styles.container,
          { width: buttonSize, height: buttonSize, backgroundColor: "transparent" },
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  // Glass variant with blur
  if (variant === "glass") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityLabel={label}
        style={[
          styles.container,
          {
            width: buttonSize,
            height: buttonSize,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          },
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        <LinearGradient
          colors={[
            isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.4)",
            "transparent",
          ]}
          locations={[0, 0.5]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {content}
      </AnimatedPressable>
    );
  }

  // Glow variant
  if (variant === "glow") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityLabel={label}
        style={[
          styles.container,
          styles.glowShadow,
          {
            width: buttonSize,
            height: buttonSize,
            borderWidth: 1,
            borderColor: `${colors.accent.main}40`,
            shadowColor: colors.accent.main,
          },
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.accent.main}10`, borderRadius: 12 }]} />
        <LinearGradient
          colors={[`${colors.accent.main}15`, "transparent"]}
          locations={[0, 0.5]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {content}
      </AnimatedPressable>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  solidShadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  solidHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  glowShadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
