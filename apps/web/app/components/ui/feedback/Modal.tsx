import { useEffect, useCallback, type ReactNode } from "react";
import type { ModalProps } from "@bouncepad/shared";
import { X } from "lucide-react";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

export function Modal({
  visible,
  onClose,
  title,
  showCloseButton = true,
  closeOnBackdropPress = true,
  size = "md",
  children,
  footer,
}: ModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        onClose();
      }
    },
    [visible, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0
          bg-black/50
          backdrop-blur-sm
          motion-safe:motion-opacity-in-0
          motion-safe:motion-duration-200
        `}
        onClick={closeOnBackdropPress ? onClose : undefined}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`
          relative
          w-full ${sizeClasses[size]}
          glass-card-glow
          rounded-2xl
          overflow-hidden
          motion-safe:motion-preset-pop
          motion-safe:motion-duration-300
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]/50">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--foreground)]"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={`
                  p-1 rounded-lg
                  text-[var(--muted)] hover:text-[var(--foreground)]
                  hover:bg-[var(--border)]/50
                  transition-colors
                  ${!title ? "ml-auto" : ""}
                `}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)]/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
