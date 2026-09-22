type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <p className="text-sm font-medium text-slate-700">
              {label}
            </p>
          )}

          {description && (
            <p className="mt-0.5 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-slate-900" : "bg-slate-200"
        } disabled:cursor-not-allowed`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}