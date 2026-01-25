import { View, Pressable, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { TabsProps } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Text } from "../primitives/Text";

const sizeStyles: Record<"sm" | "md" | "lg", ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  lg: { paddingHorizontal: 20, paddingVertical: 12 },
};

export function Tabs({
  items,
  activeKey,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = false,
}: TabsProps) {
  const { colors } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case "default":
        return {
          backgroundColor: `${colors.border}80`,
          padding: 4,
          borderRadius: 10,
        };
      case "pills":
        return { gap: 8 };
      case "underline":
        return {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        };
    }
  };

  const getTabStyle = (isActive: boolean): ViewStyle => {
    switch (variant) {
      case "default":
        return {
          borderRadius: 8,
          backgroundColor: isActive ? colors.background : "transparent",
          ...(isActive && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }),
        };
      case "pills":
        return {
          borderRadius: 9999,
          backgroundColor: isActive ? colors.accent.main : "transparent",
        };
      case "underline":
        return {
          borderBottomWidth: 2,
          borderBottomColor: isActive ? colors.accent.main : "transparent",
          marginBottom: -StyleSheet.hairlineWidth,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        getContainerStyle(),
        fullWidth && styles.fullWidth,
      ]}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            disabled={item.disabled}
            style={[
              styles.tab,
              sizeStyles[size],
              getTabStyle(isActive),
              fullWidth && styles.tabFullWidth,
              item.disabled && styles.disabled,
            ]}
          >
            {item.icon && <View style={styles.icon}>{item.icon}</View>}
            <Text
              variant="body"
              weight={isActive ? "medium" : "normal"}
              style={{
                color:
                  variant === "pills" && isActive
                    ? "#ffffff"
                    : isActive
                      ? colors.foreground
                      : colors.muted,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabFullWidth: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
