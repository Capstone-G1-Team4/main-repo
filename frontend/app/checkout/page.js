"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";

/**
 * CheckoutPage - Premium Cyber-Tech Checkout & Shipping Form Component
 * Simulates secure order commitment, adaptive billing forms, and cash-on-delivery routing.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" or "cod"

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    // Load initial staging cart buffer items for visual aggregate mapping
    if (rawProducts.catalog && rawProducts.catalog.length >= 2) {
      setCartItems([
        { ...rawProducts.catalog[0], quantity: 1 },
        { ...rawProducts.catalog[2], quantity: 2 }
      ]);
    }
  }, []);

  // Compute financial totals loaded from state array
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 15.00 : 0;
  const estimatedTax = subtotal * 0.16;
  const totalOrderAmount = subtotal + shippingFee + estimatedTax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Secure Order Pipeline Submitter: Simulates async transaction verification
   */
  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate async gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      if (paymentMethod === "cod") {
        alert("💵 Order Buffered via COD! Prepare settlement upon handshake delivery.");
      } else {
        alert("🔒 Gateway Secured! Token authorized successfully.");
      }
      router.push("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative selection:bg-purple-500/30">
      
      {/* Background Visual Overlays */}
      <div className="absolute top-0 left-1/3 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Breadcrumb Panel */}
        <div className="mb-8 border-b border-slate-900 pb-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent sm:text-3xl">
              Secure Checkout
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Finalizing end-to-end user procurement streams.</p>
          </div>
          <Link href="/cart" className="text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition">
            ⬅️ Back to Cart 
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: Shipping & Payment Core Form fields (Takes 7 columns) */}
          <form onSubmit={handleOrderSubmit} className="space-y-6 lg:col-span-7">
            
            {/* Section A: Shipping Logistics */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 border-b border-slate-900 pb-3 mb-4 font-mono">
                01 / Shipping Details
              </h2>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Full  Name</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Dania "
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">  Email Address </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="dania@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Street Address </label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Petra St."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">City </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Irbid"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">ZIP  Code</label>
                  <input
                    type="text"
                    required
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="21110"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Financial Settlement Interface */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 mb-4 gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-mono">
                  02 / Payment Method
                </h2>
                
                {/* Toggle Switch for Payment Method */}
                <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${paymentMethod === "card" ? "bg-purple-600 text-white shadow-md shadow-purple-600/10" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${paymentMethod === "cod" ? "bg-purple-600 text-white shadow-md shadow-purple-600/10" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    COD (Cash)
                  </button>
                </div>
              </div>
              
              {paymentMethod === "card" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Card Number </label>
                    <input
                      type="text"
                      required={paymentMethod === "card"}
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="4242 •••• •••• 4242"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Exp. Date (MM/YY)</label>
                    <input
                      type="text"
                      required={paymentMethod === "card"}
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="12/29"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">CVV </label>
                    <input
                      type="password"
                      maxLength={3}
                      required={paymentMethod === "card"}
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="•••"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                  <p className="text-xs text-purple-300 font-medium">
                    💵 <strong className="text-white">Cash on Delivery Active.</strong> Additional Shipping fees are included in the final total. Paymentwill be collected upon delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Action Submit Trigger Button Control */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40"
            >
              {isProcessing ? "Processing Secure Cryptography... ⛓️" : "PLACE ORDER"}
            </button>
          </form>

          {/* RIGHT COLUMN: Order Manifest Mini Summary (Takes 5 columns) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl lg:sticky lg:top-6">
            <h2 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-3">Order Details</h2>
            
            {/* Inline Mini Catalog Summary Cards */}
            <div className="mt-4 divide-y divide-slate-900/80 max-h-[220px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover border border-slate-800" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">QTY: {item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-bold font-mono text-purple-400">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="mt-6 border-t border-slate-900 pt-5 space-y-3 text-xs font-medium text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Subtotal </span>
                <span className="text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span> Sales Tax</span>
                <span className="text-slate-200">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-slate-200">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="pt-3.5 border-t border-slate-900 flex justify-between text-sm font-black text-slate-100 font-sans">
                <span> Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">${totalOrderAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}