import { View, Image, StyleSheet } from "react-native";
import type { AvatarProps, Size } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Text } from "./Text";

const sizeMap: Record<Size, { container: number; text: number; status: number }> = {
  xs: { container: 24, text: 10, status: 6 },
  sm: { container: 32, text: 12, status: 8 },
  md: { container: 40, text: 14, status: 10 },
  lg: { container: 48, text: 16, status: 12 },
  xl: { container: 64, text: 20, status: 16 },
};

const statusColorMap = {
  online: "#22c55e",
  offline: "#737373",
  busy: "#ef4444",
  away: "#eab308",
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  showStatus = false,
  statusColor = "online",
}: AvatarProps) {
  const { colors } = useTheme();
  const sizeStyle = sizeMap[size];

  const initials = fallback
    ? fallback
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <View
      style={[
        styles.container,
        { width: sizeStyle.container, height: sizeStyle.container },
      ]}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={styles.image}
          accessibilityLabel={alt}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { backgroundColor: colors.accent.light },
          ]}
        >
          <Text
            variant="body"
            weight="semibold"
            style={{ fontSize: sizeStyle.text, color: colors.accent.dark }}
          >
            {initials}
          </Text>
        </View>
      )}
      {showStatus && (
        <View
          style={[
            styles.status,
            {
              width: sizeStyle.status,
              height: sizeStyle.status,
              backgroundColor: statusColorMap[statusColor],
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  fallback: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 9999,
    borderWidth: 2,
  },
});
