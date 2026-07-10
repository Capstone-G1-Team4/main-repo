"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";
import { getProductId } from "../../src/lib/productImage";
import AnalyticsTab from "./components/AnalyticsTab";
import ProductsTab from "./components/ProductsTab";
import CustomersTab from "./components/CustomersTab";
import AiLogsTab from "./components/AiLogsTab";
import {
  cyberPageShell,
  cyberHeading,
  cyberButtonSecondary,
  cyberTabActive,
  cyberTabInactive,
} from "../../src/lib/theme";

const TABS = [
  { id: "analytics", label: "📊 System Analytics" },
  { id: "products", label: "📦 Product Registry" },
  { id: "customers", label: "👥 Customer Nodes" },
  { id: "ai-logs", label: "🤖 AI Intent Logs" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");

  // `rawProducts` is a plain array — there is no `.catalog` property on it.
  // Reading `rawProducts.catalog` (as the previous version did) silently
  // evaluates to undefined, which is why the Product Registry tab used to
  // render empty. It's also missing stable `id`s, so it's normalized here
  // with the shared `getProductId` helper to avoid duplicate React keys
  // downstream in ProductsTab.
  const products = useMemo(
    () => (rawProducts || []).map((product) => ({ ...product, id: product.id || getProductId(product) })),
    []
  );

  return (
    <div className={cyberPageShell}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 border-b border-cyber-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cyberHeading}>System Control Tower</h1>
            <p className="text-xs text-cyber-muted font-mono mt-1">
              Audit metrics, data layers, and product inventory.
            </p>
          </div>
          <button type="button" onClick={() => router.push("/")} className={cyberButtonSecondary}>
            ⬅️ Back to Home
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-cyber-border pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                activeTab === tab.id ? cyberTabActive : cyberTabInactive
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "products" && <ProductsTab products={products} />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "ai-logs" && <AiLogsTab />}
      </div>
    </div>
  );
}