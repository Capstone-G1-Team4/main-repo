"use client";

/**
 * ProductCard
 * ------------------------------------------------------------------
 * Renders a single product suggestion. Used inside AI chat bubbles
 * (see ChatBubble.js) when the assistant recommends one or more
 * products in response to a query.
 *
 * Props:
 *  - product: {
 *      id: string,
 *      name: string,
 *      price: number,
 *      originalPrice?: number,  // shown struck-through if present
 *      currency?: string,       // defaults to "INR" (catalog is priced in INR)
 *      imageUrl?: string,
 *      rating?: number,         // 0-5
 *      reviewCount?: number,
 *      inStock?: boolean,       // defaults to true
 *      brand?: string,
 *    }
 *  - onAddToCart: (product) => void
 *  - compact: boolean  // smaller layout, used inside chat bubbles
 */

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

export default function ProductCard({ product, onAddToCart, compact = false }) {
  const {
    name,
    price,
    originalPrice,
    currency = "INR",
    imageUrl,
    rating,
    reviewCount,
    inStock = true,
    brand,
  } = product;

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const handleAddToCart = () => {
    if (!inStock) return;

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log("Add to cart clicked for:", product);
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-cyber-border bg-cyber-panel transition hover:border-cyber-purple/40 ${
        compact ? "w-40 sm:w-44" : "w-full sm:w-56"
      }`}
    >
      {/* Product image */}
      <div
        className={`relative flex items-center justify-center bg-cyber-bg ${
          compact ? "h-24" : "h-32 sm:h-36"
        }`}
      >
        {!inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-950/90 px-2 py-0.5 text-[10px] font-medium text-white">
            Out of Stock
          </span>
        )}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className={`h-full w-full object-cover ${!inStock ? "opacity-60 grayscale" : ""}`}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-cyber-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
            />
          </svg>
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {brand && (
          <span
            className={`font-medium uppercase tracking-wide text-cyber-muted ${
              compact ? "text-[10px]" : "text-xs"
            }`}
          >
            {brand}
          </span>
        )}

        <h4 className={`font-medium text-cyber-text line-clamp-2 ${compact ? "text-xs" : "text-sm"}`}>
          {name}
        </h4>

        {/* Rating + review count */}
        {typeof rating === "number" && (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`text-amber-400 ${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.196-1.538-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
            <span className={`font-medium text-cyber-text ${compact ? "text-[10px]" : "text-xs"}`}>
              {rating.toFixed(1)}
            </span>
            {typeof reviewCount === "number" && (
              <span className={`text-cyber-muted ${compact ? "text-[10px]" : "text-xs"}`}>
                ({reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price + optional strikethrough original price */}
        <div className="flex items-baseline gap-1.5">
          <p className={`font-semibold text-cyber-purple ${compact ? "text-sm" : "text-base"}`}>
            {currencySymbol}
            {Number(price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {originalPrice && originalPrice > price && (
            <span className={`text-cyber-muted line-through ${compact ? "text-[10px]" : "text-xs"}`}>
              {currencySymbol}
              {Number(originalPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`mt-auto flex items-center justify-center gap-1 rounded-lg font-bold uppercase tracking-wide text-white transition active:scale-[0.98] ${
            inStock
              ? "bg-gradient-to-r from-cyber-purple to-indigo-600 hover:opacity-90"
              : "cursor-not-allowed bg-slate-700"
          } ${compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-2 text-xs"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}