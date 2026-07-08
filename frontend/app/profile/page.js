"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * UserProfilePage - Premium Cyber-Tech Profile & Order History Component
 * Allows user identity node management and tracks historical procurement order logs.
 */
export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Staging state representing grounded logged-in user credentials
  const [userNode, setUserNode] = useState({
    fullName: "Dania Jarbooh",
    email: "developer@example.com",
    shippingAddress: "Irbid Main St ",
    city: "Irbid",
    terminalZip: "21110",
    accountCreated: "2026-03-15"
  });

  // Mock array capturing previous order fulfillment telemetry
  const orderHistory = [
    { id: "ORD-9410", date: "2026-06-12", amount: 245.00, status: "Delivered", items: "AeroStride Runners x1, SoundWave Elite x1" },
    { id: "ORD-8821", date: "2026-05-02", amount: 799.00, status: "Delivered", items: "Quantum Phone Pro x1" },
    { id: "ORD-1052", date: "2026-07-06", amount: 135.50, status: "Processing", items: "Cyber Cushion Trainer x2" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserNode((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Secure Node Saver: Simulates cloud storage persistence handshake latency
   */
  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate database update network delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert("🔒 Identity cluster node updated securely in global registry cache.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative selection:bg-purple-500/30">
      
      {/* Background Neon Blur Ambient Glows */}
      <div className="absolute top-0 left-10 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

      {/* Main Container Workstation */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb Dashboard Header Banner */}
        <div className="mb-10 border-b border-slate-900 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent sm:text-3xl">
              My Profile
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Manage your profile details and view your order history.</p>
          </div>
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition">
            ⬅️ Back to Home Page
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT SIDE PANEL: User Profile Update Card (Takes 5 columns) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500" />
            
            {/* Visual Node Avatar Badge Layout */}
            <div className="flex items-center gap-4 border-b border-slate-900/60 pb-5 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-900/10 text-lg font-bold font-mono">
                DN
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100">{userNode.fullName}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Node Initialized: {userNode.accountCreated}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  disabled={!isEditing}
                  value={userNode.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none disabled:opacity-50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5"> Email Address</label>
                <input
                  type="email"
                  name="email"
                  disabled={!isEditing}
                  value={userNode.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none disabled:opacity-50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5"> Default Address</label>
                <textarea
                  name="shippingAddress"
                  disabled={!isEditing}
                  rows={2}
                  value={userNode.shippingAddress}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none disabled:opacity-50 resize-none transition"
                />
              </div>

              {/* Action Button Toggles */}
              <div className="pt-4 border-t border-slate-900/60 flex items-center justify-end">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-bold text-purple-400 hover:bg-purple-600 hover:text-white transition-all duration-200"
                  >
                    Update Info ⚙️
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
                    >
                      Abort
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40"
                    >
                      {isSaving ? "Syncing..." : "Commit Changes 🚀"}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT SIDE PANEL: Historical Order Ledger Manifest Tables (Takes 7 columns) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-900 bg-slate-900/20 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-900 bg-slate-950/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">Order History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950 font-mono text-slate-500 font-bold uppercase">
                    <th className="p-4">Order ID</th>
                    <th className="p-4"> Date</th>
                    <th className="p-4">  Products</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 font-medium font-sans">
                  {orderHistory.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-900/10 transition">
                      <td className="p-4 font-mono text-slate-400">{order.id}</td>
                      <td className="p-4 font-mono text-slate-500">{order.date}</td>
                      <td className="p-4 text-slate-300 max-w-[200px] truncate" title={order.items}>
                        {order.items}
                      </td>
                      <td className="p-4 font-bold font-mono text-purple-400">${order.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider ${order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}