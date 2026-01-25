import { View, StyleSheet, type DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import type { SkeletonProps, Radius } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";

const radiusMap: Record<Radius, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export function Skeleton({
  width,
  height,
  radius = "md",
  animate = true,
  circle = false,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animate) {
      opacity.value = withRepeat(
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const size = circle ? (height as number) : undefined;

  return (
    <Animated.View
      style={[
        {
          width: circle ? size : (width as DimensionValue),
          height: height as DimensionValue,
          backgroundColor: colors.border,
          borderRadius: circle ? 9999 : radiusMap[radius],
        },
        animate && animatedStyle,
      ]}
    />
  );
}
