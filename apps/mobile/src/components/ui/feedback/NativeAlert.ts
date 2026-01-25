import { Alert, ActionSheetIOS, Platform } from "react-native";

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  options: string[];
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number;
  onSelect: (index: number) => void;
}

/**
 * Native iOS alert dialog
 * Uses the system alert which has proper styling and animations
 */
export function alert(options: AlertOptions): void {
  const { title, message, buttons = [{ text: "OK" }] } = options;

  Alert.alert(
    title,
    message,
    buttons.map((btn) => ({
      text: btn.text,
      style: btn.style,
      onPress: btn.onPress,
    }))
  );
}

/**
 * Native iOS confirmation dialog
 * Convenience wrapper for common confirm/cancel pattern
 */
export function confirm(options: {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}): void {
  const {
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    destructive = false,
    onConfirm,
    onCancel,
  } = options;

  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}

/**
 * Native iOS action sheet
 * Shows a bottom sheet with multiple options (iOS only, falls back to Alert on Android)
 */
export function actionSheet(options: ActionSheetOptions): void {
  const {
    title,
    message,
    options: sheetOptions,
    cancelButtonIndex,
    destructiveButtonIndex,
    onSelect,
  } = options;

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options: sheetOptions,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      onSelect
    );
  } else {
    // Fallback for Android - use Alert with buttons
    const buttons = sheetOptions.map((option, index) => ({
      text: option,
      style:
        index === destructiveButtonIndex
          ? ("destructive" as const)
          : index === cancelButtonIndex
            ? ("cancel" as const)
            : ("default" as const),
      onPress: () => onSelect(index),
    }));

    Alert.alert(title ?? "", message, buttons);
  }
}

/**
 * Convenience object for all native alert methods
 */
export const NativeAlert = {
  alert,
  confirm,
  actionSheet,
};
