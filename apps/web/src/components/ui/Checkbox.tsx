import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: ReactNode;
  description?: ReactNode;
};

export default function Checkbox({
  label,
  description,
  className = "",
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
    >
      <input
        {...props}
        type="checkbox"
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed"
      />

      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-700">
          {label}
        </span>

        {description && (
          <span className="mt-0.5 block text-xs text-slate-400">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}