import { View, TextInput, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import type { InputProps } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Text } from "./Text";

const sizeStyles: Record<"sm" | "md" | "lg", { container: ViewStyle; input: TextStyle }> = {
  sm: { container: { paddingHorizontal: 12, paddingVertical: 8 }, input: { fontSize: 14 } },
  md: { container: { paddingHorizontal: 16, paddingVertical: 12 }, input: { fontSize: 16 } },
  lg: { container: { paddingHorizontal: 20, paddingVertical: 16 }, input: { fontSize: 18 } },
};

export function Input({
  variant = "default",
  size = "md",
  placeholder,
  value,
  onChangeText,
  disabled = false,
  error = false,
  errorMessage,
  type = "text",
  leftElement,
  rightElement,
  label,
}: InputProps) {
  const { colors, isDark } = useTheme();
  const sizeStyle = sizeStyles[size];

  const getKeyboardType = () => {
    switch (type) {
      case "email":
        return "email-address";
      case "number":
        return "numeric";
      default:
        return "default";
    }
  };

  const inputContent = (
    <>
      {leftElement && <View style={styles.element}>{leftElement}</View>}
      <TextInput
        style={[styles.input, sizeStyle.input, { color: colors.foreground }]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        secureTextEntry={type === "password"}
        keyboardType={getKeyboardType()}
        autoCapitalize={type === "email" ? "none" : "sentences"}
      />
      {rightElement && <View style={styles.element}>{rightElement}</View>}
    </>
  );

  // Glass variant with blur
  if (variant === "glass") {
    return (
      <View style={styles.wrapper}>
        {label && (
          <Text variant="label" style={styles.label}>
            {label}
          </Text>
        )}
        <View
          style={[
            styles.container,
            styles.glassContainer,
            { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" },
            error && { borderColor: "#ef4444" },
            disabled && styles.disabled,
          ]}
        >
          <BlurView
            intensity={30}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          {/* Inner highlight */}
          <LinearGradient
            colors={[
              isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)",
              "transparent",
            ]}
            locations={[0, 0.5]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.inputRow, sizeStyle.container]}>
            {inputContent}
          </View>
        </View>
        {error && errorMessage && (
          <Text variant="caption" style={styles.error}>
            {errorMessage}
          </Text>
        )}
      </View>
    );
  }

  // Default variant with inset/depth effect
  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          sizeStyle.container,
          {
            backgroundColor: isDark ? "#0f0f0f" : "#f5f5f5",
            borderWidth: 1,
            borderColor: error ? "#ef4444" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            // Inset shadow effect
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 2,
          },
          disabled && styles.disabled,
        ]}
      >
        {/* Inner shadow gradient for inset look */}
        <LinearGradient
          colors={[
            isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
            "transparent",
          ]}
          locations={[0, 0.3]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
          pointerEvents="none"
        />
        {/* Bottom highlight for depth */}
        <LinearGradient
          colors={[
            "transparent",
            isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
          ]}
          locations={[0.7, 1]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
          pointerEvents="none"
        />
        {inputContent}
      </View>
      {error && errorMessage && (
        <Text variant="caption" style={styles.error}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    marginBottom: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  glassContainer: {
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  input: {
    flex: 1,
  },
  element: {
    marginHorizontal: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: "#ef4444",
    marginTop: 6,
  },
});
