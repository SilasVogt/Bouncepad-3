import { Pressable, StyleSheet, View, type ViewStyle, type TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { ButtonProps, Size, ButtonVariant } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Spinner } from "../feedback/Spinner";
import { Text } from "./Text";

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle; gap: number }> = {
  xs: { container: { paddingHorizontal: 10, paddingVertical: 6 }, text: { fontSize: 12 }, gap: 4 },
  sm: { container: { paddingHorizontal: 14, paddingVertical: 8 }, text: { fontSize: 14 }, gap: 6 },
  md: { container: { paddingHorizontal: 18, paddingVertical: 12 }, text: { fontSize: 14 }, gap: 8 },
  lg: { container: { paddingHorizontal: 22, paddingVertical: 14 }, text: { fontSize: 16 }, gap: 8 },
  xl: { container: { paddingHorizontal: 28, paddingVertical: 16 }, text: { fontSize: 18 }, gap: 10 },
};

const spinnerSizes: Record<Size, Size> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "sm",
  xl: "md",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = "solid",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onPress,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const sizeStyle = sizeStyles[size];

  const renderContent = (textColor: string) => (
    <View style={[styles.content, { gap: sizeStyle.gap }, sizeStyle.container]}>
      {loading ? (
        <Spinner size={spinnerSizes[size]} color={textColor} />
      ) : (
        <>
          {leftIcon}
          {typeof children === "string" ? (
            <Text
              variant="body"
              weight="semibold"
              style={{ color: textColor, ...sizeStyle.text }}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </View>
  );

  // Solid variant with smooth gradient
  if (variant === "solid") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.container,
          styles.solidShadow,
          { shadowColor: colors.accent.main },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.accent.main, colors.accent.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          {/* Subtle top highlight */}
          <View style={styles.solidHighlight} />
          {renderContent("#ffffff")}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // Outline variant with subtle fill
  if (variant === "outline") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.container,
          {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {/* Subtle inner highlight */}
        <LinearGradient
          colors={[
            isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)",
            "transparent",
          ]}
          locations={[0, 0.4]}
          style={StyleSheet.absoluteFill}
        />
        {renderContent(colors.foreground)}
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
        style={[
          styles.container,
          { backgroundColor: "transparent" },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {renderContent(colors.foreground)}
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
        style={[
          styles.container,
          styles.glassContainer,
          { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle inner highlight */}
        <LinearGradient
          colors={[
            isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.4)",
            "transparent",
          ]}
          locations={[0, 0.5]}
          style={StyleSheet.absoluteFill}
        />
        {renderContent(colors.foreground)}
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
        style={[
          styles.container,
          styles.glowContainer,
          {
            borderColor: `${colors.accent.main}40`,
            shadowColor: colors.accent.main,
          },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle accent tint */}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.accent.main}10` }]}
        />
        {/* Subtle inner highlight */}
        <LinearGradient
          colors={[
            `${colors.accent.main}15`,
            "transparent",
          ]}
          locations={[0, 0.5]}
          style={StyleSheet.absoluteFill}
        />
        {renderContent(colors.foreground)}
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
  gradient: {
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
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
  },
  glassContainer: {
    borderWidth: 1,
  },
  glowContainer: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
