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
  cyberEmptyStateText,
  cyberSectionEyebrow,
  cyberOrderCard,
  cyberOrderId,
  cyberOrderTimestamp,
  cyberOrderStatusBadge,
  cyberOrderItemRow,
  cyberOrderItemName,
  cyberOrderItemQty,
  cyberOrderTotalRow,
  cyberOrderTotalLabel,
  cyberOrderTotalValue,
} from "../../src/lib/theme";

// Status → badge color mapping. These are semantic order-state colors
// (not part of the core cyber-* brand palette), so they live here as a
// small page-local config rather than as new tokens in theme.js.
const ORDER_STATUS_STYLES = {
  Pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Shipped: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
  Delivered: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const ORDER_STATUS_ICON = {
  Pending: "⏳",
  Shipped: "🚚",
  Delivered: "✅",
};

/**
 * ProfilePage
 * ------------------------------------------------------------------
 * Client-side mock dashboard for the signed-in user: a profile
 * metadata grid (Username, Role, Authorized Email) built from
 * cyberInput/cyberLabel, plus an Order History dashboard rendered as
 * a responsive grid of order cards (Order ID, timestamp, status
 * badge, itemized quantities, total price). All data here is static
 * mock state — wire it up to a real session/order API when one is
 * available.
 */
export default function ProfilePage() {
  const [profile] = useState({
    username: "dania.jarbooh",
    fullName: "Dania Jarbooh",
    role: "Standard Member",
    email: "developer@example.com",
    memberSince: "March 15, 2026",
  });

  const [orderHistory] = useState([
    {
      id: "ORD-9410",
      timestamp: "2026-06-12T14:32:00",
      status: "Delivered",
      items: [
        { name: "AeroStride Runners", quantity: 1, price: 145.0 },
        { name: "SoundWave Elite", quantity: 1, price: 100.0 },
      ],
    },
    {
      id: "ORD-8821",
      timestamp: "2026-05-02T09:05:00",
      status: "Delivered",
      items: [{ name: "Quantum Phone Pro", quantity: 1, price: 799.0 }],
    },
    {
      id: "ORD-1103",
      timestamp: "2026-07-08T18:47:00",
      status: "Shipped",
      items: [{ name: "Cyber Cushion Trainer", quantity: 2, price: 62.5 }],
    },
    {
      id: "ORD-1052",
      timestamp: "2026-07-09T11:20:00",
      status: "Pending",
      items: [
        { name: "NovaVision 55\" Smart TV", quantity: 1, price: 610.0 },
        { name: "WallMount Pro Bracket", quantity: 1, price: 34.99 },
      ],
    },
  ]);

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

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const orderTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

        {/* Order history dashboard */}
        <section>
          <div className="mb-6">
            <p className={cyberSectionEyebrow}>Dashboard</p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-cyber-text">Order History</h2>
          </div>

          {orderHistory.length === 0 ? (
            <div className={cyberEmptyState}>
              <p className={cyberEmptyStateText}>No past orders found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {orderHistory.map((order) => {
                const statusStyle = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.Pending;
                const statusIcon = ORDER_STATUS_ICON[order.status] || "•";

                return (
                  <article key={order.id} className={cyberOrderCard}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={cyberOrderId}>{order.id}</p>
                        <p className={cyberOrderTimestamp}>{formatTimestamp(order.timestamp)}</p>
                      </div>
                      <span className={`${cyberOrderStatusBadge} ${statusStyle}`}>
                        <span>{statusIcon}</span>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      {order.items.map((item) => (
                        <div key={item.name} className={cyberOrderItemRow}>
                          <span className={cyberOrderItemName}>{item.name}</span>
                          <span className={cyberOrderItemQty}>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className={cyberOrderTotalRow}>
                      <span className={cyberOrderTotalLabel}>Total</span>
                      <span className={cyberOrderTotalValue}>${orderTotal(order.items).toFixed(2)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}