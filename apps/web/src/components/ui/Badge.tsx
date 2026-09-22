import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:
    "border-slate-200 bg-slate-100 text-slate-600",

  success:
    "border-emerald-100 bg-emerald-50 text-emerald-700",

  warning:
    "border-amber-100 bg-amber-50 text-amber-700",

  danger:
    "border-red-100 bg-red-50 text-red-700",

  info:
    "border-blue-100 bg-blue-50 text-blue-700",

  purple:
    "border-purple-100 bg-purple-50 text-purple-700",

  outline:
    "border-slate-200 bg-white text-slate-600",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}