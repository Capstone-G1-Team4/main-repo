"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cyberPageShell,
  cyberPanel,
  cyberHeading,
  cyberLabel,
  cyberInput,
  cyberButtonPrimary,
} from "../../src/lib/theme";
import { apiFetch, ApiError } from "../../src/lib/api";

/**
 * RegisterPage
 * ------------------------------------------------------------------
 * Account creation form. Validates password length/confirmation
 * client-side and simulates a registration request before redirecting
 * to /login. Replace the simulated request with a real API call once
 * a registration endpoint is available.
 */
export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
        }),
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not reach the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${cyberPageShell} flex items-center justify-center overflow-hidden p-4`}>
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyber-purple/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-96 w-96 rounded-full bg-cyber-cyan/10 blur-[120px]" />

      <div className={`${cyberPanel} relative w-full max-w-md p-8 shadow-2xl`}>
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-cyber-purple via-indigo-500 to-cyber-cyan" />

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyber-purple/20 bg-cyber-purple/10 text-cyber-purple">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className={cyberHeading}>Create Account</h1>
          <p className="mt-1 font-mono text-xs text-cyber-muted">Register to access your dashboard</p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegistrationSubmit} className="space-y-4">
          <div>
            <label className={cyberLabel}>Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Jane Doe"
              className={cyberInput}
            />
          </div>

          <div>
            <label className={cyberLabel}>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jane@example.com"
              className={cyberInput}
            />
          </div>

          <div>
            <label className={cyberLabel}>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 8 characters"
              className={cyberInput}
            />
          </div>

          <div>
            <label className={cyberLabel}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              className={cyberInput}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className={`${cyberButtonPrimary} mt-2 w-full`}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 border-t border-cyber-border pt-6 text-center text-xs text-cyber-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-cyber-purple underline underline-offset-4 transition hover:text-purple-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}