"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, setStoredToken, ApiError } from "../../src/lib/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginForm({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateLoginForm({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(response.access_token);
      router.push("/profile");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Could not reach the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden selection:bg-purple-500/30">
      <div className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-900 bg-slate-900/30 p-8 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-purple-500/20">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />

        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] mb-4">
            🔑
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-800 focus:border-purple-500 focus:ring-purple-500"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-[11px] text-rose-400">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                errors.password
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-800 focus:border-purple-500 focus:ring-purple-500"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p id="password-error" className="mt-1.5 text-[11px] text-rose-400">
                {errors.password}
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-[11px] text-rose-400 text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 hover:scale-[1.01] active:scale-95 mt-2"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-900/80 text-center text-xs text-slate-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-purple-400 font-bold hover:text-purple-300 underline underline-offset-4 transition">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}