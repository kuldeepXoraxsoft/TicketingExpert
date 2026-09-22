import type {
  InputHTMLAttributes,
} from "react";
import { Search, X } from "lucide-react";

type SearchInputProps =
  InputHTMLAttributes<HTMLInputElement> & {
    value: string;
    onValueChange: (value: string) => void;
    onClear?: () => void;
  };

export default function SearchInput({
  value,
  onValueChange,
  onClear,
  placeholder = "Search...",
  className = "",
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onValueChange("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        {...props}
        type="text"
        value={value}
        onChange={(event) =>
          onValueChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
