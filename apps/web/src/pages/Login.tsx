import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Headphones } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.10),transparent_30%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                  <Headphones size={21} strokeWidth={2.2} />
                </div>

                <span className="text-lg font-semibold tracking-tight text-white">
                  Helpdesk
                </span>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Customer Support Platform
              </p>

              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Manage every customer conversation in one place.
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                Turn customer emails into organized tickets, collaborate with
                your team, and keep every conversation connected.
              </p>

              <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-lg font-semibold text-white">Tickets</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Organized support
                  </p>
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">Teams</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Better collaboration
                  </p>
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">Email</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Connected inbox
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} Helpdesk. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Headphones size={21} />
              </div>

              <span className="text-lg font-semibold text-slate-900">
                Helpdesk
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access your support workspace.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 accent-slate-900 focus:ring-slate-900"
                    />

                    <span className="text-sm text-slate-600">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-slate-700 transition hover:text-slate-950 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure access to your support workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}