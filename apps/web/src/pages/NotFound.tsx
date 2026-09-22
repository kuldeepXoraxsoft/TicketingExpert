import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, Home, ShieldAlert } from "lucide-react";

type ErrorType = "404" | "403" | "500";

interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
}

const ERROR_CONFIG = {
  "404": {
    code: "404",
    title: "Page not found",
    message:
      "The page you're looking for doesn't exist or may have been moved.",
    icon: ArrowLeftRight,
  },

  "403": {
    code: "403",
    title: "Access denied",
    message:
      "You don't have permission to access this page. Contact your administrator if you think this is a mistake.",
    icon: ShieldAlert,
  },

  "500": {
    code: "500",
    title: "Something went wrong",
    message:
      "We couldn't load this page correctly. Please try again or return to the dashboard.",
    icon: ShieldAlert,
  },
} as const;

export default function NotFound({
  type = "404",
  title,
  message,
}: ErrorPageProps) {
  const location = useLocation();

  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Icon size={28} strokeWidth={1.8} />
        </div>

        {/* Error Code */}
        <p className="mt-8 text-7xl font-bold tracking-tight text-slate-200 sm:text-8xl">
          {config.code}
        </p>

        {/* Title */}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title ?? config.title}
        </h1>

        {/* Message */}
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          {message ?? config.message}
        </p>

        {/* Current path */}
        {type === "404" && (
          <div className="mx-auto mt-5 max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-2.5">
            <p className="truncate font-mono text-xs text-slate-400">
              {location.pathname}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          <Link
            to="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Home size={16} />
            Dashboard
          </Link>
        </div>

        {/* Footer */}
         <div className="mt-10 flex w-full items-center justify-center gap-1 leading-none">
              <span className="text-[13px] font-extrabold tracking-[0.12em] text-slate-900">
                TICKETING
              </span>

              <span className="mx-0.5 text-[15px] font-bold text-slate-300">
                ×
              </span>

              <span className="text-[13px] font-bold tracking-[0.08em] text-slate-500">
                EXPERT
              </span>
            </div>
      </div>
    </div>
  );
}