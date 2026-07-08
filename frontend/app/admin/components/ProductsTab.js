"use client";

import { useState } from "react";
import AddProductModal from "./AddProductModal"; // Core Form input dialog module split cleanly

/**
 * ProductsTab Component
 * Coordinates enterprise dashboard table inventory views and tracks auto-increment data mapping algorithms.
 * * @param {Array} initialProducts - Grounded snapshot catalog pulled directly down from local mock database file.
 */
export default function ProductsTab({ products: initialProducts }) {
  const [productsList, setProductsList] = useState(initialProducts || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Auto-Increment Processing Pipeline Engine
   * Dynamically tracks numerical increments based on highest sequential index identifier found locally.
   * * @param {Object} formData - Product attribute properties bubbled from modular sub-component context.
   */
  const handleAddNewProductPayload = (formData) => {
    // 🧠 ALGORITHM: Scan all inventory strings/ints, trace numerical sequences, and find max value
    const numericalIds = productsList.map(p => {
      const match = String(p.id).match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    
    // Resolve incremental boundaries securely
    const maxId = numericalIds.length > 0 ? Math.max(...numericalIds) : 0;
    const generatedNewId = maxId + 1;

    // Encapsulate model variables gracefully matching full catalog signatures
    const productPayload = {
      id: generatedNewId,
      ...formData,
      price: parseFloat(formData.price) || 0.00,
      rating: 4.5,
      reviewCount: 0
    };

    // Immutably append record into local functional runtime state cache array
    setProductsList((prev) => [...prev, productPayload]);
    setIsModalOpen(false);
    
    alert(`🚀 Product SKU-prod-${generatedNewId} committed successfully to local modular state!`);
  };

  return (
    <div className="relative">
      <div className="rounded-2xl border border-slate-900 bg-slate-900/20 overflow-hidden shadow-xl animate-fadeIn">
        
        {/* Core Header Section Action Trigger Buttons Banner */}
        <div className="p-5 border-b border-slate-900 bg-slate-950/40 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
            INVENTORY REGISTRY MANIFEST
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/20 transition-all active:scale-95"
          >
            + Add New Product
          </button>
        </div>

        {/* Dense Analytics Grid Inventory Datatable Frame */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950 font-mono text-slate-500 font-bold uppercase">
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Registry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 font-medium">
              {productsList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/10 transition">
                  <td className="p-4 font-mono text-slate-500">SKU-prod-{p.id}</td>
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.imageUrl} alt="" className="h-9 w-9 rounded-xl object-cover border border-slate-800" />
                    <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">{p.brand}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono uppercase text-slate-400">{p.category}</td>
                  <td className="p-4 font-bold font-mono text-purple-400">${p.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${p.inStock ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                      {p.inStock ? "In Stock" : "Depleted"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decoupled custom input metadata overlay handling state events */}
      <AddProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddNewProductPayload}
      />
    </div>
  );
}