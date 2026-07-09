"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";
import { useCart } from "../../src/context/CartContext";
import { getDynamicProductImage } from "../../src/lib/productImage";
import AddToCartModal from "../../src/components/AddToCartModal";
import {
  cyberPageShell,
  cyberNavBar,
  cyberNavLink,
  cyberBrandText,
  cyberHeading,
  cyberCard,
  cyberInput,
  cyberBadge,
  cyberEmptyState,
  cyberButtonGhost,
  cyberTabActive,
  cyberTabInactive,
} from "../../src/lib/theme";

const CATEGORY_ICON_BY_MATCH = [
  { test: (category) => category === "laptop", icon: "💻" },
  { test: (category) => category === "phones" || category === "mobile", icon: "📱" },
  { test: (category) => category?.includes("watch"), icon: "⌚" },
  { test: (category) => category?.includes("refrigerator"), icon: "❄️" },
  { test: (category) => category === "tv", icon: "📺" },
  { test: (category) => category?.includes("machine"), icon: "🧺" },
];

function getCategoryIcon(category) {
  return CATEGORY_ICON_BY_MATCH.find((entry) => entry.test(category))?.icon || null;
}

function formatCategoryLabel(category) {
  if (category === "all") return "🛍️ All Products";
  return category.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const catalog = rawProducts || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const availableCategories = useMemo(
    () => ["all", ...new Set(catalog.map((product) => product.category).filter(Boolean))],
    [catalog]
  );

  const categoryFromUrl = searchParams.get("cat");
  const selectedCategory =
    categoryFromUrl && availableCategories.includes(categoryFromUrl) ? categoryFromUrl : "all";

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return catalog.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [catalog, selectedCategory, searchQuery]);

  const handleCategorySelect = (category) => {
    router.replace(`/products?cat=${category}`, { scroll: false });
  };

  const handleAddToCart = (product) => {
    addItem(product);
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`${cyberPageShell} pt-20`}>
      <nav className={cyberNavBar}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className={cyberBrandText}>NextGen Core</span>
            </Link>
            <div className="flex items-center gap-5">
              <Link href="/" className={cyberNavLink}>⬅️ Back to Home</Link>
              <Link href="/profile" className={cyberNavLink}>👤 Profile</Link>
              <Link href="/cart" className={cyberButtonGhost}>🛒 View Cart</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 border-b border-cyber-border pb-5">
          <h1 className={cyberHeading}>Discover Products</h1>
        </div>

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`${cyberInput} pl-11 py-3.5`}
            />
            <span className="absolute left-4 top-4 text-cyber-muted text-sm">🔍</span>
          </div>

          <div className="flex flex-wrap gap-2.5 bg-cyber-panel/40 p-1.5 rounded-2xl border border-cyber-border backdrop-blur-sm">
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === category ? cyberTabActive : cyberTabInactive
                }`}
              >
                {formatCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={cyberEmptyState}>
            <p className="text-cyber-muted font-medium font-mono text-sm">No products matched your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product, index) => (
              <div key={`${product.brand}-${product.name}-${index}`} className={cyberCard}>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950 border border-cyber-border flex items-center justify-center p-4">
                  {getCategoryIcon(product.category) && (
                    <span className="text-4xl absolute opacity-5 select-none font-mono">
                      {getCategoryIcon(product.category)}
                    </span>
                  )}
                  <img
                    src={getDynamicProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-contain relative z-10 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-cyber-purple font-mono">
                      <span>{product.brand}</span>
                      <span className={cyberBadge}>{product.category}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-cyber-text group-hover:text-cyber-purple transition duration-200 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    {product.details?.length > 0 && (
                      <p className="text-[10px] text-cyber-muted line-clamp-3 mt-1.5 font-mono">
                        ⚙️ {product.details.join(" | ")}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-amber-400 font-bold font-mono">★ {product.rating || 4.2}</div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cyber-border flex items-center justify-between">
                    <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyber-purple">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <button type="button" onClick={() => handleAddToCart(product)} className={cyberButtonGhost}>
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-indigo-600 text-white font-bold shadow-lg border border-purple-500/30 transition-all hover:scale-110 active:scale-95"
        >
          ▲
        </button>
      )}

      <AddToCartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={activeProduct} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}