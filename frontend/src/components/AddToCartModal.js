"use client";

import { useRouter } from "next/navigation";

/**
 * Reusable "item added to cart" confirmation modal.
 *
 * Previously this markup was copy-pasted into home/page.js, products/page.js,
 * and chat/page.js, each with its own local isModalOpen/activeProduct state.
 * Render this once per page and drive it with local state for `isOpen` and
 * `product`; the modal owns navigation to /cart itself.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {{ name?: string } | null} product
 */
export default function AddToCartModal({ isOpen, onClose, product }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToCart = () => {
    onClose();
    router.push("/cart");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-cart-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-cyber-purple border border-purple-500/20 shadow-xl mb-4">
          🛒
        </div>

        <div className="text-center">
          <h3 id="add-to-cart-modal-title" className="text-base font-bold text-cyber-text">
            Added to Cart
          </h3>
          <p className="mt-2 text-xs text-cyber-muted line-clamp-2">
            <span className="text-cyber-purple font-semibold">{product?.name}</span> has been
            added to your shopping cart.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleGoToCart}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg"
          >
            Go to Cart
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-950 border border-cyber-border py-3 text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-slate-200 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}