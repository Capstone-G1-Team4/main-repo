"use client";

import { useState } from "react";
import Link from "next/link";
import {
  cyberPageShell,
  cyberHeading,
  cyberPanel,
  cyberInput,
  cyberLabel,
  cyberButtonPrimary,
  cyberButtonGhost,
  cyberNavLink,
  cyberEmptyState,
} from "../../src/lib/theme";

/**
 * ProfilePage
 * ------------------------------------------------------------------
 * Client-side mock dashboard for the signed-in user: a profile
 * metadata grid (Username, Role, Authorized Email) built from
 * cyberInput/cyberLabel, plus a lightweight order history table.
 * All data here is static mock state — wire it up to a real
 * session/user API when one is available.
 */
export default function ProfilePage() {
  const [profile] = useState({
    username: "dania.jarbooh",
    fullName: "Dania Jarbooh",
    role: "Standard Member",
    email: "developer@example.com",
    memberSince: "March 15, 2026",
  });

  const orderHistory = [
    {
      id: "ORD-9410",
      date: "2026-06-12",
      amount: 245.0,
      status: "Delivered",
      items: "AeroStride Runners x1, SoundWave Elite x1",
    },
    {
      id: "ORD-8821",
      date: "2026-05-02",
      amount: 799.0,
      status: "Delivered",
      items: "Quantum Phone Pro x1",
    },
    {
      id: "ORD-1052",
      date: "2026-07-06",
      amount: 135.5,
      status: "Processing",
      items: "Cyber Cushion Trainer x2",
    },
  ];

  const metadataFields = [
    { label: "Username", value: profile.username },
    { label: "Role", value: profile.role },
    { label: "Authorized Email", value: profile.email },
  ];

  const initials = profile.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cyberPageShell}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-cyber-border pb-5">
          <div>
            <h1 className={cyberHeading}>My Profile</h1>
            <p className="mt-1 font-mono text-xs text-cyber-muted">
              Your account details and recent order activity.
            </p>
          </div>
          <Link href="/" className={cyberNavLink}>
            ⬅ Back to Home
          </Link>
        </div>

        {/* Profile metadata dashboard grid */}
        <section className={`${cyberPanel} mb-8 p-6`}>
          <div className="mb-6 flex items-center gap-4 border-b border-cyber-border pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyber-purple/20 bg-cyber-purple/10 text-lg font-bold text-cyber-purple">
              {initials}
            </div>
            <div>
              <h2 className="text-sm font-black text-cyber-text">{profile.fullName}</h2>
              <p className="mt-0.5 font-mono text-[10px] text-cyber-muted">Member since {profile.memberSince}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {metadataFields.map((field) => (
              <div key={field.label}>
                <label className={cyberLabel}>{field.label}</label>
                <input
                  type="text"
                  value={field.value}
                  readOnly
                  className={`${cyberInput} cursor-not-allowed opacity-80`}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col-reverse justify-end gap-2 border-t border-cyber-border pt-5 sm:flex-row">
            <button type="button" className={cyberButtonGhost}>
              Edit Profile
            </button>
            <button type="button" className={cyberButtonPrimary}>
              Manage Account
            </button>
          </div>
        </section>

        {/* Order history */}
        <section className={`${cyberPanel} overflow-hidden`}>
          <div className="border-b border-cyber-border bg-slate-950/40 p-5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyber-purple">
              Order History
            </h3>
          </div>

          {orderHistory.length === 0 ? (
            <div className={cyberEmptyState}>
              <p className="text-sm text-cyber-muted">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-cyber-border bg-slate-950 font-mono font-bold uppercase text-cyber-muted">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border/60 font-medium">
                  {orderHistory.map((order) => (
                    <tr key={order.id} className="transition hover:bg-cyber-panel/40">
                      <td className="p-4 font-mono text-cyber-muted">{order.id}</td>
                      <td className="p-4 font-mono text-cyber-muted">{order.date}</td>
                      <td className="max-w-[220px] truncate p-4 text-cyber-text" title={order.items}>
                        {order.items}
                      </td>
                      <td className="p-4 font-mono font-bold text-cyber-purple">${order.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider ${
                            order.status === "Delivered"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}