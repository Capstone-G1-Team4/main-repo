"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../src/lib/api";

// ---------------------------------------------------------------------------
// Mini chart components (pure CSS — no chart library)
// ---------------------------------------------------------------------------

function BarChart({ data, labelKey, valueKey, color = "from-cyber-purple to-cyber-indigo" }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 truncate text-[10px] font-mono text-cyber-muted" title={item[labelKey]}>
            {item[labelKey]}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-cyber-bg/60">
            <div
              className={`absolute inset-y-0 left-0 rounded-md bg-gradient-to-r ${color} transition-all duration-700`}
              style={{ width: `${(Number(item[valueKey]) / max) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right font-mono text-[10px] font-bold text-cyber-text">
            {item[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, size = 140 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let accumulated = 0;
  const gradientParts = segments.map((s) => {
    const start = (accumulated / total) * 360;
    accumulated += s.value;
    const end = (accumulated / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientParts.join(", ")})`,
        }}
      />
      <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-cyber-panel/80 backdrop-blur-sm">
        <span className="text-sm font-black text-cyber-text">{total}</span>
      </div>
    </div>
  );
}

function SparkLine({ values, color = "#a855f7", width = 120, height = 32 }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);

  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_COLORS = {
  pending: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  confirmed: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  preparing: "border-orange-500/40 text-orange-400 bg-orange-500/10",
  out_for_delivery: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  delivered: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  cancelled: "border-red-500/40 text-red-400 bg-red-500/10",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider ${STATUS_COLORS[status] || "border-slate-500/40 text-slate-400 bg-slate-500/10"}`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Panel
// ---------------------------------------------------------------------------

const CATEGORY_COLORS = [
  "#a855f7", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316",
];

export default function DashboardPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch("/admin/analytics/summary");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent" />
          <p className="font-mono text-xs text-cyber-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <p className="text-sm font-bold text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${Number(stats.revenue).toLocaleString()}`,
      subtitle: `Avg order: $${Number(stats.avg_order_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      accent: "text-emerald-400",
      icon: "💰",
    },
    {
      title: "Total Products",
      value: stats.products_total,
      subtitle: `${stats.categories_total} categories`,
      accent: "text-cyan-400",
      icon: "📦",
    },
    {
      title: "Total Users",
      value: stats.users_total,
      subtitle: `${stats.active_users} active`,
      accent: "text-purple-400",
      icon: "👥",
    },
    {
      title: "Total Orders",
      value: stats.orders_total,
      subtitle: `${stats.conversations_total} conversations`,
      accent: "text-indigo-400",
      icon: "🛒",
    },
  ];

  // Prepare donut chart data for order status
  const statusSegments = Object.entries(stats.orders_by_status || {}).map(([key, val], i) => ({
    label: key,
    value: val,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  // Prepare bar chart data for products by category
  const categoryBarData = Object.entries(stats.products_by_category || {}).map(([name, count]) => ({
    name,
    count,
  }));

  // Revenue sparkline
  const revenueValues = (stats.revenue_over_time || []).map((d) => Number(d.revenue));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="mb-2 animate-fade-in-up">
        <h1 className="text-lg font-black tracking-tight text-cyber-text sm:text-xl">
          System Analytics Dashboard
        </h1>
        <p className="mt-1 font-mono text-[10px] text-cyber-muted">
          Live data from your store database
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="group rounded-2xl border border-cyber-border bg-cyber-panel/30 p-5 backdrop-blur-sm transition-all duration-300 hover:border-cyber-purple/30 animate-fade-in-up card-glow"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber-muted">
                {card.title}
              </p>
              <span className="text-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">{card.icon}</span>
            </div>
            <p className={`mt-2 text-2xl font-black font-mono tracking-tight ${card.accent}`}>
              {card.value}
            </p>
            <p className="mt-1 text-[10px] font-mono text-cyber-muted">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Products by Category */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up delay-400 card-glow">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-cyber-text">
            Products by Category
          </h3>
          {categoryBarData.length > 0 ? (
            <BarChart data={categoryBarData} labelKey="name" valueKey="count" color="from-cyan-500 to-cyan-700" />
          ) : (
            <p className="font-mono text-xs text-cyber-muted">No category data</p>
          )}
        </div>

        {/* Order Status Donut */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up delay-500 card-glow">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-cyber-text">
            Orders by Status
          </h3>
          {statusSegments.length > 0 ? (
            <div className="flex items-center gap-6">
              <DonutChart segments={statusSegments} />
              <div className="flex-1 space-y-2">
                {statusSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                    <span className="flex-1 text-[10px] font-mono text-cyber-muted">{seg.label}</span>
                    <span className="text-[10px] font-mono font-bold text-cyber-text">{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs text-cyber-muted">No orders yet</p>
          )}
        </div>
      </div>

      {/* Revenue over time */}
      {revenueValues.length > 0 && (
        <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up delay-600 card-glow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyber-text">
              Revenue Trend (Last 30 Days)
            </h3>
            <SparkLine values={revenueValues} color="#a855f7" width={160} height={28} />
          </div>
          <div className="space-y-1.5">
            {(stats.revenue_over_time || []).slice(-10).map((d, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg px-3 py-2 transition hover:bg-cyber-bg/40">
                <span className="w-24 font-mono text-[10px] text-cyber-muted">{d.date}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded bg-cyber-bg/60">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-emerald-500/80 to-emerald-400/80"
                    style={{
                      width: `${Math.min(
                        (Number(d.revenue) / Math.max(...revenueValues, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="w-20 text-right font-mono text-[10px] font-bold text-emerald-400">
                  ${Number(d.revenue).toLocaleString()}
                </span>
                <span className="w-12 text-right font-mono text-[10px] text-cyber-muted">
                  {d.orders} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: Top products + Payment methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top selling products */}
        <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up delay-700 card-glow">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-cyber-text">
            Top Selling Products
          </h3>
          {stats.top_products.length > 0 ? (
            <div className="space-y-2">
              {stats.top_products.map((p, i) => (
                <div
                  key={p.product_id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-cyber-bg/40"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyber-purple/10 font-mono text-[10px] font-bold text-cyber-purple">
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-cyber-text">{p.name}</p>
                    <p className="font-mono text-[9px] text-cyber-muted">{p.quantity_sold} sold</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ${Number(p.revenue).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-xs text-cyber-muted">No sales data yet</p>
          )}
        </div>

        {/* Payment methods + recent orders */}
        <div className="space-y-6">
          {/* Payment methods */}
          <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up delay-800 card-glow">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-cyber-text">
              Payment Methods
            </h3>
            {Object.keys(stats.orders_by_payment || {}).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.orders_by_payment).map(([method, count], i) => (
                  <div key={method} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                    <span className="flex-1 text-xs font-mono text-cyber-muted">
                      {method?.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyber-text">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-cyber-muted">No payment data</p>
            )}
          </div>

          {/* Recent orders */}
          <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up delay-1000 card-glow">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-cyber-text">
              Recent Orders
            </h3>
            {(stats.recent_orders || []).length > 0 ? (
              <div className="space-y-2">
                {stats.recent_orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-cyber-bg/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-cyber-text">{o.customer_name}</p>
                      <p className="font-mono text-[9px] text-cyber-muted">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={o.status} />
                      <span className="font-mono text-xs font-bold text-cyber-text">${Number(o.total).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-cyber-muted">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* User activity */}
      <div className="rounded-2xl border border-cyber-border bg-cyber-panel/30 p-6 backdrop-blur-sm animate-fade-in-up card-glow">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-cyber-text">
          User Activity
        </h3>
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">{stats.active_users}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-muted">Active Users</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-cyber-bg/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{
                  width: `${stats.users_total > 0 ? (stats.active_users / stats.users_total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-400 font-mono">{stats.inactive_users}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-muted">Inactive Users</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-cyber-bg/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                style={{
                  width: `${stats.users_total > 0 ? (stats.inactive_users / stats.users_total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
