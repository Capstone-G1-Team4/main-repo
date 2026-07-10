"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, getStoredToken, ApiError } from "../../src/lib/api";
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

// Status → badge color mapping. Semantic order-state colors, not part of
// the core cyber-* brand palette, so kept page-local rather than as
// theme.js tokens. Falls back to the "Pending" style for any status
// string the backend returns that isn't one of these three.
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

/** Normalizes a backend order record into the shape this page renders.
 *  Accepts a few plausible field-name variants defensively, since the
 *  exact `/orders` response schema wasn't provided — adjust the
 *  `raw.X || raw.Y` fallbacks once the real shape is confirmed. */
function normalizeOrder(raw) {
  const items = (raw.items || raw.order_items || []).map((item) => ({
    name: item.name || item.product_name || "Item",
    quantity: item.quantity || item.qty || 1,
    price: Number(item.price ?? item.unit_price ?? 0),
  }));

  const total =
    raw.total ?? raw.total_price ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    id: raw.id || raw.order_id || raw._id,
    timestamp: raw.created_at || raw.timestamp || raw.date,
    status: raw.status || "Pending",
    items,
    total: Number(total),
  };
}

/** Normalizes a backend /auth/me response into the profile fields this
 *  page displays, with defensive field-name fallbacks (see above). */
function normalizeUser(raw) {
  return {
    username: raw.username || raw.user_name || raw.email,
    fullName: raw.full_name || raw.fullName || raw.name || raw.username || "User",
    role: raw.role || raw.user_role || "Standard Member",
    email: raw.email || "",
    memberSince: raw.member_since || raw.created_at || null,
  };
}

/**
 * ProfilePage
 * ------------------------------------------------------------------
 * Fetches the logged-in user (GET /auth/me) and their order history
 * (GET /orders) from the backend on mount, using the Bearer token
 * stored by the login flow (see src/lib/api.js). Redirects to /login
 * if no token is present. All backend field-name assumptions are
 * documented above in normalizeUser/normalizeOrder.
 */
export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let isCancelled = false;

    async function loadProfileData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [userResponse, ordersResponse] = await Promise.all([
          apiFetch("/auth/me"),
          apiFetch("/orders"),
        ]);

        if (isCancelled) return;

        setProfile(normalizeUser(userResponse));
        const orderList = Array.isArray(ordersResponse)
          ? ordersResponse
          : ordersResponse?.orders || [];
        setOrderHistory(orderList.map(normalizeOrder));
      } catch (error) {
        if (isCancelled) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          router.push("/login");
          return;
        }

        setLoadError(
          error instanceof ApiError
            ? error.message
            : "Something went wrong while loading your profile. Please try again."
        );
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadProfileData();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  const metadataFields = profile
    ? [
        { label: "Username", value: profile.username },
        { label: "Role", value: profile.role },
        { label: "Authorized Email", value: profile.email },
      ]
    : [];

  const initials = (profile?.fullName || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formatTimestamp = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Placeholder handlers — swap for real mutations (PATCH /auth/me,
  // navigation to a billing/account settings route, etc.) once those
  // endpoints are available.
  const handleEditProfile = () => {
    console.log("Edit Profile clicked", profile);
    setActionMessage("Edit Profile isn't wired to a backend endpoint yet.");
  };

  const handleManageAccount = () => {
    console.log("Manage Account clicked", profile);
    setActionMessage("Manage Account isn't wired to a backend endpoint yet.");
  };

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

        {isLoading && (
          <div className={cyberEmptyState}>
            <p className={cyberEmptyStateText}>Loading your profile…</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className={cyberEmptyState}>
            <p className={cyberEmptyStateText}>{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && profile && (
          <>
            {/* Profile metadata dashboard grid */}
            <section className={`${cyberPanel} mb-8 p-6`}>
              <div className="mb-6 flex items-center gap-4 border-b border-cyber-border pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyber-purple/20 bg-cyber-purple/10 text-lg font-bold text-cyber-purple">
                  {initials || "?"}
                </div>
                <div>
                  <h2 className="text-sm font-black text-cyber-text">{profile.fullName}</h2>
                  {profile.memberSince && (
                    <p className="mt-0.5 font-mono text-[10px] text-cyber-muted">
                      Member since {formatTimestamp(profile.memberSince)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {metadataFields.map((field) => (
                  <div key={field.label}>
                    <label className={cyberLabel}>{field.label}</label>
                    <input
                      type="text"
                      value={field.value || ""}
                      readOnly
                      className={`${cyberInput} cursor-not-allowed opacity-80`}
                    />
                  </div>
                ))}
              </div>

              {actionMessage && (
                <p className="mt-4 font-mono text-[11px] text-cyber-purple">{actionMessage}</p>
              )}

              <div className="mt-6 flex flex-col-reverse justify-end gap-2 border-t border-cyber-border pt-5 sm:flex-row">
                <button type="button" onClick={handleEditProfile} className={cyberButtonGhost}>
                  Edit Profile
                </button>
                <button type="button" onClick={handleManageAccount} className={cyberButtonPrimary}>
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
                  <p className={cyberEmptyStateText}>No orders found.</p>
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
                          {order.items.map((item, index) => (
                            <div key={`${order.id}-${item.name}-${index}`} className={cyberOrderItemRow}>
                              <span className={cyberOrderItemName}>{item.name}</span>
                              <span className={cyberOrderItemQty}>x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className={cyberOrderTotalRow}>
                          <span className={cyberOrderTotalLabel}>Total</span>
                          <span className={cyberOrderTotalValue}>${order.total.toFixed(2)}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}