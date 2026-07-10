"use client";

import { useState } from "react";

/**
 * AddProductModal Component
 * Renders a secure, isolated glassmorphic form view modal to capture new inventory metadata.
 * * @param {boolean} isOpen - Controls the structural visibility state of the modal overlay.
 * @param {function} onClose - Callback handler to dismantle the modal layout context.
 * @param {function} onAddProduct - Pipeline dispatch to bubble product payload to the core state array.
 */
export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  // Staging state to hold input data fields mapped to the data architecture schema
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "select category",
    price: "",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", // Default fallback premium placeholder
    inStock: true
  });

  // Guard Clause: Terminate render layout immediately if the visibility switch flag is down
  if (!isOpen) return null;

  /**
   * Updates state attributes dynamically based on user input fields interaction triggers
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Validates structure constraints and triggers parent pipeline commit workflows
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct(newProduct);
    
    // Reset staging buffer configurations back to defaults post submission dispatch
    setNewProduct({
      name: "",
      brand: "",
      category: "Select category",
      price: "",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      inStock: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-850 bg-slate-900 p-6 shadow-2xl">
        
        {/* Futuristic Laser Border Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />
        
        <h3 className="text-base font-bold text-slate-100 border-b border-slate-850 pb-3">
          Register New Product
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Product Name Form Input Node */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Product  Name</label>
            <input
              type="text"
              required
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="e.g. AeroStride Elite Runners"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Brand Attribute Input Node */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Brand Identity</label>
            <input
              type="text"
              required
              name="brand"
              value={newProduct.brand}
              onChange={handleInputChange}
              placeholder="e.g. NOVA / APPLE / SONY"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Combined Responsive Grid Cluster Selector & Financial Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Cluster Category</label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select Category</option>
                <option value="shoes">SHOES</option>
                <option value="phones">PHONES</option>
                <option value="headphones">HEADPHONES</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Price  ($)</label>
              <input
                type="number"
                step="0.01"
                required
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                placeholder="100.00"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Static Asset Direct Image Endpoint String Pointer */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Asset Image Pointer URL</label>
            <input
              type="text"
              name="imageUrl"
              value={newProduct.imageUrl}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-400 focus:border-purple-500 focus:outline-none font-mono text-[11px]"
            />
          </div>

          {/* Action Interactive Interface Confirmation Controllers */}
          <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition"
            >
              Cancel 
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/20 hover:from-purple-500 hover:to-indigo-500 transition"
            >
              Add new Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}