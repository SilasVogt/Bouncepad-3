import { View, Switch as RNSwitch, StyleSheet } from "react-native";
import type { SwitchProps } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Text } from "../primitives/Text";

export function Switch({
  value,
  onValueChange,
  disabled = false,
  size = "md",
  label,
  labelPosition = "right",
}: SwitchProps) {
  const { colors } = useTheme();

  // React Native Switch doesn't support custom sizes well,
  // but we can scale the container
  const scale = size === "sm" ? 0.8 : size === "lg" ? 1.2 : 1;

  const toggle = (
    <View style={{ transform: [{ scale }] }}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border,
          true: colors.accent.main,
        }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  if (!label) {
    return toggle;
  }

  return (
    <View
      style={[
        styles.container,
        labelPosition === "left" && styles.reversed,
        disabled && styles.disabled,
      ]}
    >
      {toggle}
      <Text variant="body">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reversed: {
    flexDirection: "row-reverse",
  },
  disabled: {
    opacity: 0.5,
  },
});
