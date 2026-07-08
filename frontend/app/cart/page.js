"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import products from "../../../Agentic-RAG/data/processed/products.json";

/**
 * CartPage - Premium Cyber-Tech Shopping Cart Component
 * Manages adding, removing, and quantity adjustments synced mathematically with currency aggregators.
 */
export default function CartPage() {
  // Mocking initial cart state using items from our decoupled JSON catalog
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Populate with 2 mock items on initial load to show layout functionality beautifully
    if (products.catalog && products.catalog.length >= 2) {
      setCartItems([
        { ...products.catalog[0], quantity: 1 },
        { ...products.catalog[2], quantity: 2 }
      ]);
    }
  }, []);

  // Structural Handlers for Quantity Controls
  const updateQuantity = (id, amount) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
        )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Financial Order Aggregators Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 15.00 : 0;
  const estimatedTax = subtotal * 0.16; // Simulated 16% local sales tax standard
  const totalOrderAmount = subtotal + shippingFee + estimatedTax;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative selection:bg-purple-500/30">
      
      {/* Visual Ambient Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

      {/* Main Container Layout */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumbs Banner */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent sm:text-3xl">
              Shopping Cart Matrix
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Manifesting localized client-side staging bundles.</p>
          </div>
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition">
            ⬅️ Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-slate-900 backdrop-blur-sm">
            <span className="text-4xl">🛒</span>
            <p className="text-slate-500 font-medium font-mono text-sm mt-4">Your current cart buffer is depleted.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-500 transition">
              Explore Clusters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* LEFT SIDE: Items Interactive List Pipeline (Takes 8 columns) */}
            <div className="space-y-4 lg:col-span-8">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-slate-900 bg-slate-900/30 p-5 backdrop-blur-sm transition hover:border-slate-800"
                >
                  {/* Thumbnail Cover Frame */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-24 w-24 rounded-xl object-cover border border-slate-800 shadow-inner shrink-0"
                  />

                  {/* Informational Core metadata details block */}
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-black uppercase text-purple-400 tracking-widest">{item.brand}</span>
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1 mt-0.5">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Category: {item.category}</p>
                    
                    {/* Inline Delete Button control action */}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="mt-3 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                    >
                      🗑️Delete item
                    </button>
                  </div>

                  {/* Interactive Quantity Incremetors UI Matrix Counter */}
                  <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-slate-500 hover:text-purple-400 font-bold px-1.5 transition text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold font-mono min-w-[20px] text-center text-slate-200">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-slate-500 hover:text-purple-400 font-bold px-1.5 transition text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Individual Accumulative Financial Valuation pricing display */}
                  <div className="text-center sm:text-right min-w-[90px]">
                    <p className="text-base font-black text-purple-400 font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">${item.price.toFixed(2)} / unit</p>
                  </div>

                </div>
              ))}
            </div>

            {/* RIGHT SIDE: Final Order Summary & Pricing aggregate Checkout (Takes 4 columns) */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm lg:col-span-4 shadow-xl">
              <h2 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-3">Financial Manifest</h2>
              
              <div className="mt-5 space-y-3.5 text-xs font-medium text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal </span>
                  <span className="text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (16%)</span>
                  <span className="text-slate-200">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee </span>
                  <span className="text-slate-200">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="pt-3.5 border-t border-slate-900 flex justify-between text-sm font-black text-slate-100 font-sans">
                  <span>Total Amount</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">${totalOrderAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* CTA Checkout Commitment routing trigger handles */}
              <div className="mt-6 space-y-2.5">
               <Link 
                 href="/checkout"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-95"
                >
                Secure Checkout🔒
                </Link>
              <div className="text-center">
              <span className="text-[10px] text-slate-600 font-mono">
                All pipelines initialized securely.
              </span>
              </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}