import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";

import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title?: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  variant?: ConfirmModalVariant;
  loading?: boolean;
  loadingText?: string;

  icon?: ReactNode;
};

const VARIANT_CONFIG: Record<
  ConfirmModalVariant,
  {
    icon: typeof AlertTriangle;
    iconWrapper: string;
    iconColor: string;
    buttonVariant: "danger" | "primary";
  }
> = {
  danger: {
    icon: Trash2,
    iconWrapper: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    buttonVariant: "danger",
  },

  warning: {
    icon: AlertTriangle,
    iconWrapper: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    buttonVariant: "primary",
  },

  info: {
    icon: Info,
    iconWrapper: "bg-slate-50 border-slate-200",
    iconColor: "text-slate-600",
    buttonVariant: "primary",
  },

  success: {
    icon: CheckCircle2,
    iconWrapper: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    buttonVariant: "primary",
  },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  loadingText = "Please wait...",
  icon,
}: ConfirmModalProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    if (loading) return;

    await onConfirm();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      loading={loading}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={config.buttonVariant}
            loading={loading}
            loadingText={loadingText}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${config.iconWrapper} ${config.iconColor}`}
        >
          {icon ?? <Icon size={22} strokeWidth={1.8} />}
        </div>

        <div className="mt-4">
          <p className="text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
}
