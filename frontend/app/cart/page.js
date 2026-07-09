"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCart } from "../../src/context/CartContext";
import { getDynamicProductImage } from "../../src/lib/productImage";

const TAX_RATE = 0.16;
const SHIPPING_FEE = 15.0;

export default function CartPage() {
  const { items, removeItem, incrementQuantity, isHydrated } = useCart();

  // Derived totals only need to recompute when the cart contents change,
  // not on every render.
  const { subtotal, shippingFee, estimatedTax, totalOrderAmount } = useMemo(() => {
    const computedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const computedShipping = computedSubtotal > 0 ? SHIPPING_FEE : 0;
    const computedTax = computedSubtotal * TAX_RATE;

    return {
      subtotal: computedSubtotal,
      shippingFee: computedShipping,
      estimatedTax: computedTax,
      totalOrderAmount: computedSubtotal + computedShipping + computedTax,
    };
  }, [items]);

  // Avoid a flash of "empty cart" before localStorage has been read once
  // on mount.
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-xs text-slate-500 font-mono">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative selection:bg-purple-500/30">
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 flex items-center justify-between border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} saved locally in your browser.
            </p>
          </div>
          <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition">
            ⬅️ Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-slate-900 backdrop-blur-sm">
            <span className="text-4xl">🛒</span>
            <p className="text-slate-500 font-medium font-mono text-sm mt-4">Your cart is empty.</p>
            <Link href="/products" className="mt-5 inline-flex rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-500 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <div className="space-y-4 lg:col-span-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-slate-900 bg-slate-900/30 p-5 backdrop-blur-sm transition hover:border-slate-800"
                >
                  <img
                    src={getDynamicProductImage(item)}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover border border-slate-800 shadow-inner shrink-0"
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-black uppercase text-purple-400 tracking-widest">{item.brand}</span>
                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1 mt-0.5">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">Category: {item.category}</p>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-3 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => incrementQuantity(item.id, -1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="text-slate-500 hover:text-purple-400 font-bold px-1.5 transition text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold font-mono min-w-[20px] text-center text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementQuantity(item.id, 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="text-slate-500 hover:text-purple-400 font-bold px-1.5 transition text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-center sm:text-right min-w-[90px]">
                    <p className="text-base font-black text-purple-400 font-mono">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">${item.price.toFixed(2)} / unit</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm lg:col-span-4 shadow-xl">
              <h2 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-3">Order Summary</h2>

              <div className="mt-5 space-y-3.5 text-xs font-medium text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (16%)</span>
                  <span className="text-slate-200">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-slate-200">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="pt-3.5 border-t border-slate-900 flex justify-between text-sm font-black text-slate-100 font-sans">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    ${totalOrderAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <Link
                  href="/checkout"
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.01] active:scale-95"
                >
                  Secure Checkout 🔒
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}