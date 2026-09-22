import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;

  title: string;
  description?: string;

  children: ReactNode;
  footer?: ReactNode;

  loading?: boolean;
  loadingText?: string;

  maxWidth?: string;

  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  loading = false,
  maxWidth = "max-w-md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEscape || loading) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, loading, onClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (loading) return;
    if (!closeOnOverlayClick) return;

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`
          grid
          w-full
          ${maxWidth}
          max-h-[calc(100vh-2rem)]
          grid-rows-[auto_minmax(0,1fr)_auto]
          overflow-hidden
          rounded-xl
          bg-white
          shadow-xl
        `}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER - NEVER SCROLLS */}
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {title}
              </h2>

              {description && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY - ONLY THIS AREA SCROLLS */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5">
          {children}
        </div>

        {/* FOOTER - NEVER SCROLLS */}
        {footer && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-4">
            <div className="flex items-center justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
