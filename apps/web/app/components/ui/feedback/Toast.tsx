import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type {
  ToastProps,
  ToastOptions,
  ToastContextValue,
  ToastType,
} from "@bouncepad/shared";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const typeStyles: Record<ToastType, { icon: ReactNode; color: string; glowColor: string }> = {
  success: { icon: <CheckCircle size={20} />, color: "text-green-500", glowColor: "#22c55e" },
  error: { icon: <AlertCircle size={20} />, color: "text-red-500", glowColor: "#ef4444" },
  warning: { icon: <AlertTriangle size={20} />, color: "text-yellow-500", glowColor: "#eab308" },
  info: { icon: <Info size={20} />, color: "text-blue-500", glowColor: "#3b82f6" },
};

function ToastComponent({
  message,
  type = "info",
  title,
  actionLabel,
  onAction,
  onDismiss,
  visible = true,
  isExiting = false,
  duration = 4000,
}: ToastProps & { isExiting?: boolean; duration?: number }) {
  if (!visible && !isExiting) return null;

  const typeStyle = typeStyles[type];
  const showTimer = duration > 0;

  return (
    <div
      role="alert"
      className={`
        relative overflow-hidden
        glass glass-glow
        min-w-[320px] max-w-md
        rounded-xl
        shadow-lg
        transition-all duration-300 ease-out
        ${isExiting
          ? "translate-y-4 opacity-0"
          : "translate-y-0 opacity-100"
        }
        ${!isExiting && "animate-[slideUp_0.3s_ease-out]"}
      `}
    >
      {/* Timer progress bar along bottom edge */}
      {showTimer && !isExiting && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden"
          style={{ zIndex: 30 }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${typeStyle.glowColor}, ${typeStyle.glowColor})`,
              boxShadow: `0 0 8px ${typeStyle.glowColor}, 0 0 16px ${typeStyle.glowColor}`,
              animation: `timerShrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <div className="relative flex items-start gap-3 p-4" style={{ zIndex: 20 }}>
        <span className={`shrink-0 ${typeStyle.color}`}>{typeStyle.icon}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-[var(--foreground)] mb-1">{title}</p>
          )}
          <p className="text-sm text-[var(--foreground)]">{message}</p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-2 text-sm font-medium text-[var(--accent-main)] hover:text-[var(--accent-dark)] transition-colors cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// Viewport edge glow component - localized to bottom-right corner
function ViewportEdgeGlow({ type, visible }: { type: ToastType; visible: boolean }) {
  const glowColor = typeStyles[type].glowColor;

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 right-0 pointer-events-none z-[99]">
      {/* Bottom edge glow */}
      <div
        className="absolute bottom-0 right-0 w-[450px] h-40 animate-[edgeFlash_1s_ease-in-out_forwards]"
        style={{
          background: `linear-gradient(to top, ${glowColor}45, transparent)`,
          filter: "blur(20px)",
        }}
      />
      {/* Corner highlight */}
      <div
        className="absolute bottom-0 right-0 w-56 h-56 animate-[edgeFlash_1s_ease-in-out_forwards]"
        style={{
          background: `radial-gradient(circle at bottom right, ${glowColor}60, transparent 70%)`,
          filter: "blur(25px)",
        }}
      />
    </div>
  );
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showEdgeGlow, setShowEdgeGlow] = useState(false);
  const [toastDuration, setToastDuration] = useState(DEFAULT_DURATION);
  const [toastKey, setToastKey] = useState(0);

  // Use refs to track timeouts so we can clear them
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const edgeGlowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    if (edgeGlowTimeoutRef.current) {
      clearTimeout(edgeGlowTimeoutRef.current);
      edgeGlowTimeoutRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearAllTimeouts();
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      setIsExiting(false);
      setToast(null);
    }, 300);
  }, [clearAllTimeouts]);

  const show = useCallback(
    (options: ToastOptions) => {
      const duration = options.duration ?? DEFAULT_DURATION;

      // Clear any existing timeouts
      clearAllTimeouts();

      // Reset state for new toast
      setIsExiting(false);
      setToast(options);
      setToastDuration(duration);
      setToastKey((k) => k + 1); // Force re-render to restart animation

      // Show edge glow
      setShowEdgeGlow(true);
      edgeGlowTimeoutRef.current = setTimeout(() => setShowEdgeGlow(false), 1000);

      // Set up auto-dismiss
      if (duration > 0) {
        dismissTimeoutRef.current = setTimeout(dismiss, duration);
      }
    },
    [dismiss, clearAllTimeouts]
  );

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

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info, dismiss }}>
      {children}
      {/* Viewport edge glow */}
      <ViewportEdgeGlow type={toast?.type ?? "info"} visible={showEdgeGlow} />
      {/* Toast */}
      {(toast || isExiting) && (
        <div className="fixed bottom-4 right-4 z-[100]">
          {toast && (
            <ToastComponent
              key={toastKey}
              {...toast}
              visible={true}
              isExiting={isExiting}
              onDismiss={dismiss}
              duration={toastDuration}
            />
          )}
        </div>
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

export { ToastComponent as Toast };
