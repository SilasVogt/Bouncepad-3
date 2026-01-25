import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassView } from "../glass/GlassView";
import type {
  ToastProps,
  ToastOptions,
  ToastContextValue,
  ToastType,
} from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";
import { Text } from "../primitives/Text";

// Colors for toast types (except info which uses accent)
const typeColors: Record<Exclude<ToastType, "info">, string> = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#eab308",
};

const typeIcons: Record<ToastType, string> = {
  success: "checkmark-circle",
  error: "alert-circle",
  warning: "warning",
  info: "information-circle",
};

function ToastComponent({
  message,
  type = "info",
  title,
  actionLabel,
  onAction,
  onDismiss,
  visible = true,
}: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  // Use accent color for info, specific colors for others
  const tintColor = type === "info" ? colors.accent.main : typeColors[type];
  const icon = typeIcons[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 16 },
        animatedStyle,
      ]}
    >
      <GlassView intensity="medium" tintColor={tintColor} borderRadius={16} padding={16}>
        <View style={styles.content}>
          <Ionicons name={icon as any} size={24} color={tintColor} />
          <View style={styles.textContainer}>
            {title && (
              <Text variant="body" weight="semibold">
                {title}
              </Text>
            )}
            <Text variant="body">{message}</Text>
            {actionLabel && onAction && (
              <Pressable onPress={onAction} style={styles.action}>
                <Text variant="body" weight="medium" accent>
                  {actionLabel}
                </Text>
              </Pressable>
            )}
          </View>
          {onDismiss && (
            <Pressable onPress={onDismiss} hitSlop={8}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </GlassView>
    </Animated.View>
  );
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface QueuedToast extends ToastOptions {
  id: number;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueuedToast[]>([]);
  const [currentToast, setCurrentToast] = useState<QueuedToast | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idRef = useRef(0);

  // Process queue - show next toast when current one is dismissed
  useEffect(() => {
    if (!currentToast && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentToast(next);
      setQueue(rest);
      setVisible(true);
    }
  }, [currentToast, queue]);

  // Auto-dismiss timer
  useEffect(() => {
    if (currentToast && visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const duration = currentToast.duration ?? 3000;
      if (duration !== 0) {
        timeoutRef.current = setTimeout(() => {
          dismiss();
        }, duration);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentToast, visible]);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
    // Wait for exit animation before clearing current toast
    setTimeout(() => {
      setCurrentToast(null);
    }, 250);
  }, []);

  const show = useCallback((options: ToastOptions) => {
    const id = ++idRef.current;
    const newToast: QueuedToast = { ...options, id };

    setQueue((prev) => [...prev, newToast]);
  }, []);

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "type">) => {
      show({ message, type: "success", ...options });
    },
    [show]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "type">) => {
      show({ message, type: "error", ...options });
    },
    [show]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "type">) => {
      show({ message, type: "warning", ...options });
    },
    [show]
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, "message" | "type">) => {
      show({ message, type: "info", ...options });
    },
    [show]
  );

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info, dismiss }}>
      {children}
      {currentToast && (
        <ToastComponent
          key={currentToast.id}
          {...currentToast}
          visible={visible}
          onDismiss={dismiss}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  action: {
    marginTop: 8,
  },
});

export { ToastComponent as Toast };
