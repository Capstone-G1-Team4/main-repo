"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * RegisterPage - Premium Cyber-Tech Registration Interface
 * Simulates user node enrollment, cryptographic key confirmations, and automated account initialization.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Secure Registry Submitter: Validates inputs and pushes node info to temporary runtime buffer
   */
  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("❌ Cryptographic Keys mismatch! Please confirm passwords accurately.");
      return;
    }

    setIsSubmitting(true);

    // Simulated cloud cluster registry delay handshake
    setTimeout(() => {
      setIsSubmitting(false);
      alert("🎉 Account Registered Successfully! Node token created.");
      router.push("/login"); // Clean redirect to authorization node
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden selection:bg-purple-500/30">
      
      {/* Visual Ambient Blur Gradients */}
      <div className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Registry Card Frame */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-900 bg-slate-900/30 p-8 backdrop-blur-md shadow-2xl group transition-all duration-300 hover:border-purple-500/20">
        
        {/* Futuristic Top Design Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />

        {/* Branding Headings Block */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] mb-4">
            📝
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Register your account to access your dashboard</p>
        </div>

        {/* Interactive Form Input Elements */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          
          {/* Full Name Input Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="ALi"
            />
          </div>

          {/* Email Input Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="ali@example.com"
            />
          </div>

          {/* Password Input Field */}
          <div>
            <div className="flex flex-col mb-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                PASSWORD
              </label>
              <span className="text-[10px] text-slate-500 font-sans mt-0.5 normal-case tracking-normal">
                *Must be at least 8 characters with uppercase, lowercase, and numbers
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password Input Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Action Trigger Button Control */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 hover:scale-[1.01] active:scale-95 mt-2"
          >
            {isSubmitting ? "Syncing Identity Network... ⛓️" : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Footer Subtext Nav Links Redirect */}
        <div className="mt-8 pt-6 border-t border-slate-900/80 text-center text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 font-bold hover:text-purple-300 underline underline-offset-4 transition">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}