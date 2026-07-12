"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../src/context/CartContext";
import { getDynamicProductImage } from "../../src/lib/productImage";
import { apiFetch, ApiError } from "../../src/lib/api";
import {
  cyberPageShell,
  cyberHeading,
  cyberPanel,
  cyberInput,
  cyberLabel,
  cyberButtonPrimary,
  cyberEmptyState,
} from "../../src/lib/theme";

const TAX_RATE = 0.16;
const SHIPPING_FEE = 15.0;

/**
 * Card number, expiry, and CVV are deliberately NOT tracked in React state.
 * They live only in the DOM (via refs) for the moment they're needed to
 * "authorize" the simulated payment, and are wiped immediately afterward.
 * This keeps sensitive values out of component state, out of any state
 * inspector, and out of anything that might get logged or persisted later.
 */
function readAndClearCardFields(cardNumberRef, expiryRef, cvvRef) {
  const snapshot = {
    cardNumber: cardNumberRef.current?.value || "",
    expiry: expiryRef.current?.value || "",
    cvv: cvvRef.current?.value || "",
  };

  if (cardNumberRef.current) cardNumberRef.current.value = "";
  if (expiryRef.current) expiryRef.current.value = "";
  if (cvvRef.current) cvvRef.current.value = "";

  return snapshot;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [formError, setFormError] = useState("");

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const cardNumberRef = useRef(null);
  const expiryRef = useRef(null);
  const cvvRef = useRef(null);

  const { subtotal, shippingFee, estimatedTax, totalOrderAmount } = useMemo(() => {
    const computedShipping = totalPrice > 0 ? SHIPPING_FEE : 0;
    const computedTax = totalPrice * TAX_RATE;
    return {
      subtotal: totalPrice,
      shippingFee: computedShipping,
      estimatedTax: computedTax,
      totalOrderAmount: totalPrice + computedShipping + computedTax,
    };
  }, [totalPrice]);

  const handleShippingChange = (event) => {
    const { name, value } = event.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    if (paymentMethod === "card") {
      const cardSnapshot = readAndClearCardFields(cardNumberRef, expiryRef, cvvRef);
      const hasAllCardFields = cardSnapshot.cardNumber && cardSnapshot.expiry && cardSnapshot.cvv;

      if (!hasAllCardFields) {
        setFormError("Enter your card number, expiry, and CVV.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderItems = [];
      for (const item of items) {
        const searchName = item.name.split(" - ")[0].split("(")[0].trim();
        const results = await apiFetch(`/products?q=${encodeURIComponent(searchName)}&size=1`);
        const product = results.items?.[0];
        if (!product) {
          setFormError(`Could not find product: ${item.name}`);
          setIsProcessing(false);
          return;
        }
        orderItems.push({ product_id: product.id, quantity: item.quantity });
      }

      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: orderItems,
          payment_method: paymentMethod === "cod" ? "cash_on_delivery" : "card",
          customer_name: shippingInfo.fullName,
          notes: `Order from ${shippingInfo.city}, ${shippingInfo.address}`,
        }),
      });

      setIsOrderComplete(true);
      clearCart();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Could not place order. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnHome = () => {
    router.push("/");
  };

  if (isOrderComplete) {
    return (
      <div className={`${cyberPageShell} flex items-center justify-center px-4`}>
        <div className={`${cyberPanel} max-w-md w-full p-10 text-center shadow-2xl`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5 text-2xl">
            ✅
          </div>
          <h1 className={cyberHeading}>Order Confirmed</h1>
          <p className="mt-3 text-xs text-cyber-muted font-mono leading-relaxed">
            {paymentMethod === "cod"
              ? "Your order is confirmed for cash on delivery."
              : "Your payment was processed successfully."}
          </p>
          <button type="button" onClick={handleReturnHome} className={`${cyberButtonPrimary} mt-8 w-full`}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${cyberPageShell} pt-20 px-4`}>
        <div className="mx-auto max-w-2xl py-24">
          <div className={cyberEmptyState}>
            <span className="text-4xl">🛒</span>
            <p className="text-cyber-muted font-medium font-mono text-sm mt-4">
              Your cart is empty — add something before checking out.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-xl bg-cyber-purple px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cyberPageShell}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 border-b border-cyber-border pb-5 flex justify-between items-center">
          <div>
            <h1 className={cyberHeading}>Secure Checkout</h1>
            <p className="text-xs text-cyber-muted font-mono mt-1">Review your order and complete payment.</p>
          </div>
          <Link href="/cart" className="text-xs font-bold uppercase tracking-wider text-cyber-purple hover:opacity-80 transition">
            ⬅️ Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <form onSubmit={handleOrderSubmit} className="space-y-6 lg:col-span-7">
            <div className={`${cyberPanel} p-6 shadow-xl`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyber-purple border-b border-cyber-border pb-3 mb-4 font-mono">
                01 / Shipping Details
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={cyberLabel} htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    className={cyberInput}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={cyberLabel} htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    className={cyberInput}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={cyberLabel} htmlFor="address">Street Address</label>
                  <input
                    id="address"
                    type="text"
                    required
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    className={cyberInput}
                    placeholder="123 Main St."
                  />
                </div>
                <div>
                  <label className={cyberLabel} htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    required
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className={cyberInput}
                    placeholder="Amman"
                  />
                </div>
                <div>
                  <label className={cyberLabel} htmlFor="zipCode">ZIP Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    required
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    className={cyberInput}
                    placeholder="11942"
                  />
                </div>
              </div>
            </div>

            <div className={`${cyberPanel} p-6 shadow-xl`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyber-purple border-b border-cyber-border pb-3 mb-4 font-mono">
                02 / Payment Method
              </h2>

              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                    paymentMethod === "card"
                      ? "bg-cyber-purple text-white"
                      : "bg-cyber-bg border border-cyber-border text-cyber-muted hover:text-cyber-text"
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                    paymentMethod === "cod"
                      ? "bg-cyber-purple text-white"
                      : "bg-cyber-bg border border-cyber-border text-cyber-muted hover:text-cyber-text"
                  }`}
                >
                  💵 Cash on Delivery
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={cyberLabel} htmlFor="cardNumber">Card Number</label>
                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      ref={cardNumberRef}
                      // Intentionally uncontrolled: no `value`/`onChange` here.
                      // This field is never written into component state.
                      className={cyberInput}
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div>
                    <label className={cyberLabel} htmlFor="expiry">Expiry (MM/YY)</label>
                    <input
                      id="expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                      ref={expiryRef}
                      className={cyberInput}
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <label className={cyberLabel} htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                      ref={cvvRef}
                      className={cyberInput}
                      placeholder="•••"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <p className="text-xs text-cyber-muted font-mono">
                  Pay with cash when your order arrives.
                </p>
              )}
            </div>

            {formError && <p className="text-xs text-rose-400 font-mono">{formError}</p>}

            <button type="submit" disabled={isProcessing} className={`${cyberButtonPrimary} w-full`}>
              {isProcessing ? "Processing..." : `Place Order — $${totalOrderAmount.toFixed(2)}`}
            </button>
          </form>

          <div className={`${cyberPanel} p-6 lg:col-span-5 shadow-xl`}>
            <h2 className="text-base font-bold text-cyber-text border-b border-cyber-border pb-3">Order Summary</h2>

            <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={getDynamicProductImage(item)}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover border border-cyber-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-cyber-text truncate">{item.name}</p>
                    <p className="text-[10px] text-cyber-muted font-mono">Qty {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-cyber-purple font-mono shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-cyber-border space-y-3 text-xs font-medium text-cyber-muted font-mono">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-cyber-text">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (16%)</span>
                <span className="text-cyber-text">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-cyber-text">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-cyber-border flex justify-between text-sm font-black text-cyber-text font-sans">
                <span>Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-cyber-cyan">
                  ${totalOrderAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}