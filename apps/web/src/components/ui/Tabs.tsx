import type { ReactNode } from "react";

export type TabItem = {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function Tabs({
  items,
  value,
  onChange,
  className = "",
}: TabsProps) {
  return (
    <div
      className={`flex w-full items-center gap-1 overflow-x-auto border-b border-slate-200 ${className}`}
    >
      {items.map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`group relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition ${
              active
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.icon && (
              <span
                className={
                  active ? "text-slate-700" : "text-slate-400"
                }
              >
                {item.icon}
              </span>
            )}

            <span>{item.label}</span>

            {typeof item.count === "number" && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.count}
              </span>
            )}

            {/* Active indicator */}
            <span
              className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full transition ${
                active ? "bg-slate-900" : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
