"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getStoredToken } from "../../src/lib/api";
import DashboardPanel from "./components/DashboardPanel";
import NlpSqlPanel from "./components/NlpSqlPanel";
import {
  cyberPageShell,
  cyberHeading,
  cyberButtonSecondary,
} from "../../src/lib/theme";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "nlp-sql", label: "NLP to SQL", icon: "🧠" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState("dashboard");
  const [authState, setAuthState] = useState("loading"); // loading | denied | admin

  useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setAuthState("denied");
        return;
      }
      try {
        const me = await apiFetch("/auth/me");
        if (!cancelled) setAuthState(me.role === "admin" ? "admin" : "denied");
      } catch {
        if (!cancelled) setAuthState("denied");
      }
    }
    checkAdmin();
    return () => { cancelled = true; };
  }, []);

  // --- Denied screen ---
  if (authState === "denied") {
    return (
      <div className={`${cyberPageShell} flex min-h-screen items-center justify-center`}>
        <div className="rounded-2xl border border-red-500/20 bg-cyber-panel/40 p-10 text-center backdrop-blur-sm max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl border border-red-500/20">
            🚫
          </div>
          <h1 className="text-lg font-black tracking-tight text-cyber-text">Admin privileges required</h1>
          <p className="mt-2 font-mono text-xs text-cyber-muted">
            You need to sign in as an administrator to access this page.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-500 hover:to-indigo-500"
            >
              Sign In as Admin
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className={`w-full ${cyberButtonSecondary}`}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (authState === "loading") {
    return (
      <div className={`${cyberPageShell} flex min-h-screen items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent" />
          <p className="font-mono text-xs text-cyber-muted">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // --- Admin panel ---
  return (
    <div className={`${cyberPageShell} flex min-h-screen`}>
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-cyber-border bg-cyber-panel/40 backdrop-blur-sm md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-cyber-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-indigo text-sm font-bold text-white shadow-lg shadow-cyber-purple/30">
            AD
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-cyber-text">Admin Panel</h2>
            <p className="font-mono text-[9px] text-cyber-muted">System Control Tower</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePanel(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                activePanel === item.id
                  ? "bg-gradient-to-r from-cyber-purple/20 to-cyber-indigo/10 text-cyber-text border border-cyber-purple/30 shadow-lg shadow-cyber-purple/10"
                  : "text-cyber-muted hover:bg-cyber-panel/60 hover:text-cyber-text border border-transparent"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-cyber-border px-3 py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyber-muted transition hover:bg-cyber-panel/60 hover:text-cyber-text border border-transparent`}
          >
            <span className="text-base">⬅</span>
            Back to Home
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col md:hidden">
        <div className="flex items-center justify-between border-b border-cyber-border bg-cyber-panel/40 px-4 py-3 backdrop-blur-sm">
          <h1 className={cyberHeading}>Admin</h1>
          <button type="button" onClick={() => router.push("/")} className={cyberButtonSecondary}>
            ⬅ Home
          </button>
        </div>
        <div className="flex gap-2 border-b border-cyber-border px-4 py-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePanel(item.id)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                activePanel === item.id
                  ? "bg-cyber-purple/20 text-cyber-text border border-cyber-purple/30"
                  : "text-cyber-muted hover:text-cyber-text border border-transparent"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activePanel === "dashboard" && <DashboardPanel />}
        {activePanel === "nlp-sql" && <NlpSqlPanel />}
      </main>
    </div>
  );
}
