"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Ensure the path correctly points to your JSON data location
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";

// Import Custom Modular Tabs Components
import AnalyticsTab from "./components/AnalyticsTab";
import ProductsTab from "./components/ProductsTab";
import CustomersTab from "./components/CustomersTab";
import AiLogsTab from "./components/AiLogsTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  
  // Using rawProducts to populate the state correctly
  const [products] = useState(rawProducts.catalog || []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative selection:bg-purple-500/30">
      
      {/* Background Neon Blur Glows */}
      <div className="absolute top-0 right-10 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Cluster */}
        <div className="mb-10 border-b border-slate-900 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent sm:text-3xl">
              System Control Tower
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Audit metrics, data-layers, and contextual RAG evaluation streams.</p>
          </div>
          <button 
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center gap-2 rounded-xl border-slate-900 bg-slate-950/40 px-4 py-2 text-xs font-bold text-purple-400 hover:border-purple-500/30 hover:bg-purple-950/20 transition-all"
          >
            ⬅️ Back to Home 
          </button>
        </div>

        {/* Tabs Controller */}
        <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-900 pb-4">
          {[
            { id: "analytics", label: "📊 System Analytics" },
            { id: "products", label: "📦 Product Registry" },
            { id: "customers", label: "👥 Customer Nodes" },
            { id: "ai-logs", label: "🤖 AI Intent Logs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Context Router Deployment */}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "products" && <ProductsTab products={products} />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "ai-logs" && <AiLogsTab />}

      </div>
    </div>
  );
}